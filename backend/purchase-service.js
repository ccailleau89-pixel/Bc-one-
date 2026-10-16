import { randomUUID } from "node:crypto";
import { calculateCommission, CommissionError } from "./commission.js";

export class PurchaseServiceError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "PurchaseServiceError";
    this.code = code;
  }
}

function requiredText(value, field, maxLength = 200) {
  if (typeof value !== "string" || value.length < 1 || value.length > maxLength || value.trim() !== value) {
    throw new PurchaseServiceError("INVALID_INPUT", `${field} is invalid`);
  }
  return value;
}

function positiveSafeInteger(value, field) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new PurchaseServiceError("INVALID_INPUT", `${field} must be positive integer cents`);
  }
  return value;
}

/**
 * Record a payment that has ALREADY been verified server-to-server or by a
 * verified provider webhook. This function does not verify webhook signatures.
 * Only trusted backend code may call it after provider verification.
 *
 * The pending purchase must already exist. Purchase state and commission
 * accrual are committed atomically; duplicate notifications are idempotent.
 */
export async function recordVerifiedPayment({ pool, purchaseId, paymentProvider, providerPaymentId, amountCents, currency = "EUR", providerEventId, providerEventType }) {
  if (!pool || typeof pool.connect !== "function") {
    throw new PurchaseServiceError("INVALID_POOL", "A PostgreSQL pool is required");
  }
  requiredText(purchaseId, "purchaseId", 36);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(purchaseId)) {
    throw new PurchaseServiceError("INVALID_INPUT", "purchaseId must be a UUID");
  }
  requiredText(paymentProvider, "paymentProvider", 80);
  requiredText(providerPaymentId, "providerPaymentId", 200);
  positiveSafeInteger(amountCents, "amountCents");
  if ((providerEventId && !providerEventType) || (!providerEventId && providerEventType)) {\n    throw new PurchaseServiceError("INVALID_EVENT", "Provider event ID and type must be supplied together");\n  }\n  if (providerEventId) {\n    requiredText(providerEventId, "providerEventId", 255);\n    requiredText(providerEventType, "providerEventType", 120);\n  }\n  if (currency !== "EUR") {
    throw new PurchaseServiceError("CURRENCY_MISMATCH", "Only EUR purchases are supported");
  }

  const client = await pool.connect();
  let transactionOpen = false;
  try {
    await client.query("BEGIN");
    transactionOpen = true;

    const result = await client.query(
      `SELECT id, merchant_id, member_id, currency, gross_cents, commission_bps,
              commission_cents, merchant_net_cents, payment_provider,
              provider_payment_id, status, paid_at
         FROM partner_purchases
        WHERE id = $1
        FOR UPDATE`,
      [purchaseId]
    );
    if (result.rows.length !== 1) {
      throw new PurchaseServiceError("PURCHASE_NOT_FOUND", "Purchase was not found");
    }

    const purchase = result.rows[0];
    if (purchase.payment_provider !== paymentProvider || purchase.provider_payment_id !== providerPaymentId) {
      throw new PurchaseServiceError("PAYMENT_REFERENCE_MISMATCH", "Payment reference does not match purchase");
    }
    if (Number(purchase.gross_cents) !== amountCents || purchase.currency !== currency) {
      throw new PurchaseServiceError("PAYMENT_AMOUNT_MISMATCH", "Verified payment amount does not match purchase");
    }

    if (!["pending", "paid", "partially_refunded", "refunded"].includes(purchase.status)) {
      throw new PurchaseServiceError("PURCHASE_NOT_PAYABLE", "Purchase is not in a payable state");
    }

    const split = calculateCommission({
      grossCents: amountCents,
      commissionBps: Number(purchase.commission_bps)
    });
    if (split.platformCommissionCents !== Number(purchase.commission_cents) ||
        split.merchantNetCents !== Number(purchase.merchant_net_cents)) {
      throw new PurchaseServiceError("PURCHASE_SPLIT_INVALID", "Stored purchase commission split is inconsistent");
    }

    const wasAlreadyPaid = purchase.status !== "pending";
    if (!wasAlreadyPaid) {
      await client.query(
        `UPDATE partner_purchases
            SET status = 'paid', paid_at = COALESCE(paid_at, now())
          WHERE id = $1 AND status = 'pending'`,
        [purchaseId]
      );
    }

    const commissionKey = `purchase-commission:${purchaseId}`;
    let commissionEntryCreated = false;
    if (split.platformCommissionCents > 0) {
      const inserted = await client.query(
        `INSERT INTO purchase_commission_entries
           (id, purchase_id, entry_type, amount_cents, idempotency_key, reason)
         VALUES ($1, $2, 'commission_accrual', $3, $4, 'Verified partner purchase commission')
         ON CONFLICT (idempotency_key) DO NOTHING
         RETURNING id, purchase_id, entry_type, amount_cents, idempotency_key`,
        [randomUUID(), purchaseId, split.platformCommissionCents, commissionKey]
      );
      commissionEntryCreated = inserted.rows.length > 0;

      if (!commissionEntryCreated) {
        const existing = await client.query(
          `SELECT purchase_id, entry_type, amount_cents
             FROM purchase_commission_entries
            WHERE idempotency_key = $1`,
          [commissionKey]
        );
        const entry = existing.rows[0];
        if (!entry || entry.purchase_id !== purchaseId ||
            entry.entry_type !== "commission_accrual" ||
            Number(entry.amount_cents) !== split.platformCommissionCents) {
          throw new PurchaseServiceError("COMMISSION_IDEMPOTENCY_CONFLICT", "Existing commission entry does not match purchase");
        }
      }
    }

    await client.query("COMMIT");
    transactionOpen = false;
    return {
      purchaseId,
      status: "paid",
      commissionCents: split.platformCommissionCents,
      merchantNetCents: split.merchantNetCents,
      duplicateNotification: wasAlreadyPaid && !commissionEntryCreated
    };
  } catch (error) {
    if (transactionOpen) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve the original transaction error.
      }
    }
    if (error instanceof PurchaseServiceError || error instanceof CommissionError) throw error;
    throw new PurchaseServiceError("PAYMENT_RECORDING_FAILED", "Verified payment could not be recorded");
  } finally {
    client.release();
  }
}

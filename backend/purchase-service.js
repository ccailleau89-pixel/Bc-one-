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
  if ((providerEventId && !providerEventType) || (!providerEventId && providerEventType)) {
    throw new PurchaseServiceError("INVALID_EVENT", "Provider event ID and type must be supplied together");
  }
  if (providerEventId) {
    requiredText(providerEventId, "providerEventId", 255);
    requiredText(providerEventType, "providerEventType", 120);
  }
  if (currency !== "EUR") {
    throw new PurchaseServiceError("CURRENCY_MISMATCH", "Only EUR purchases are supported");
  }

  const client = await pool.connect();
  let transactionOpen = false;
  try {
    await client.query("BEGIN");
    transactionOpen = true;

    if (providerEventId) {
      const eventInsert = await client.query(
        `INSERT INTO payment_provider_events (provider, provider_event_id, event_type)
         VALUES ($1, $2, $3)
         ON CONFLICT (provider, provider_event_id) DO NOTHING
         RETURNING id`,
        [paymentProvider, providerEventId, providerEventType]
      );
      if (eventInsert.rows.length === 0) {
        await client.query("COMMIT");
        transactionOpen = false;
        return { purchaseId, status: "duplicate_event", duplicateNotification: true };
      }
    }

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


/**
 * Creates a pending purchase from a price already resolved by trusted server
 * code (for example, a product ID looked up in the server-side catalogue).
 * Never pass a browser-supplied amount directly to this function.
 */
export async function createPendingPurchase({ pool, merchantId, memberId = null, grossCents, idempotencyKey }) {
  if (!pool || typeof pool.connect !== "function") {
    throw new PurchaseServiceError("INVALID_POOL", "A PostgreSQL pool is required");
  }
  if (typeof merchantId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(merchantId)) {
    throw new PurchaseServiceError("INVALID_INPUT", "merchantId must be a UUID");
  }
  if (memberId !== null && (typeof memberId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memberId))) {
    throw new PurchaseServiceError("INVALID_INPUT", "memberId must be a UUID or null");
  }
  positiveSafeInteger(grossCents, "grossCents");
  requiredText(idempotencyKey, "idempotencyKey", 200);

  const client = await pool.connect();
  let transactionOpen = false;
  try {
    await client.query("BEGIN");
    transactionOpen = true;

    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [idempotencyKey]);

    const existing = await client.query(
      `SELECT id, merchant_id, member_id, gross_cents, commission_bps,
              commission_cents, merchant_net_cents, status, provider_payment_id
         FROM partner_purchases
        WHERE idempotency_key = $1
        FOR UPDATE`,
      [idempotencyKey]
    );
    if (existing.rows.length) {
      const row = existing.rows[0];
      if (row.merchant_id !== merchantId || row.member_id !== memberId ||
          Number(row.gross_cents) !== grossCents) {
        throw new PurchaseServiceError("IDEMPOTENCY_CONFLICT", "Idempotency key was already used for a different purchase");
      }
      await client.query("COMMIT");
      transactionOpen = false;
      return { ...row, reused: true };
    }

    const merchantResult = await client.query(
      `SELECT id, status, commission_bps, stripe_account_id
         FROM merchants
        WHERE id = $1
        FOR SHARE`,
      [merchantId]
    );
    if (merchantResult.rows.length !== 1) {
      throw new PurchaseServiceError("MERCHANT_NOT_FOUND", "Merchant was not found");
    }
    const merchant = merchantResult.rows[0];
    if (merchant.status !== "active" || typeof merchant.stripe_account_id !== "string" ||
        !merchant.stripe_account_id.startsWith("acct_")) {
      throw new PurchaseServiceError("MERCHANT_NOT_ONBOARDED", "Merchant must be active and connected to Stripe");
    }

    const split = calculateCommission({ grossCents, commissionBps: Number(merchant.commission_bps) });
    const id = randomUUID();
    const inserted = await client.query(
      `INSERT INTO partner_purchases
         (id, merchant_id, member_id, currency, gross_cents, commission_bps,
          commission_cents, merchant_net_cents, payment_provider, provider_payment_id,
          idempotency_key, status)
       VALUES ($1, $2, $3, 'EUR', $4, $5, $6, $7, 'stripe', $8, $9, 'pending')
       RETURNING id, merchant_id, member_id, gross_cents, commission_bps,
                 commission_cents, merchant_net_cents, status, provider_payment_id`,
      [id, merchantId, memberId, grossCents, Number(merchant.commission_bps),
        split.platformCommissionCents, split.merchantNetCents, `pending:${id}`, idempotencyKey]
    );
    await client.query("COMMIT");
    transactionOpen = false;
    return { ...inserted.rows[0], reused: false };
  } catch (error) {
    if (transactionOpen) {
      try { await client.query("ROLLBACK"); } catch { /* preserve original error */ }
    }
    if (error instanceof PurchaseServiceError || error instanceof CommissionError) throw error;
    throw new PurchaseServiceError("PURCHASE_CREATION_FAILED", "Pending purchase could not be created");
  } finally {
    client.release();
  }
}

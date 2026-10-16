import test from "node:test";
import assert from "node:assert/strict";
import { recordVerifiedPayment, PurchaseServiceError } from "./purchase-service.js";

const purchase = {
  id: "00000000-0000-4000-8000-000000000011",
  merchant_id: "merchant-1",
  member_id: null,
  currency: "EUR",
  gross_cents: "10000",
  commission_bps: 200,
  commission_cents: "200",
  merchant_net_cents: "9800",
  payment_provider: "test-provider",
  provider_payment_id: "provider-payment-1",
  status: "pending",
  paid_at: null
};

function makePool({ initialPurchase = { ...purchase }, existingEntry = null } = {}) {
  const calls = [];
  const state = { purchase: { ...initialPurchase }, entry: existingEntry, committed: false, rolledBack: false, released: false };
  const client = {
    async query(sql, values = []) {
      calls.push({ sql, values });
      if (sql === "BEGIN") return { rows: [] };
      if (sql === "COMMIT") { state.committed = true; return { rows: [] }; }
      if (sql === "ROLLBACK") { state.rolledBack = true; return { rows: [] }; }
      if (sql.includes("FROM partner_purchases") && sql.includes("FOR UPDATE")) {
        return { rows: state.purchase ? [{ ...state.purchase }] : [] };
      }
      if (sql.includes("UPDATE partner_purchases")) {
        state.purchase.status = "paid";
        state.purchase.paid_at = "2026-10-16T00:00:00Z";
        return { rows: [] };
      }
      if (sql.includes("INSERT INTO purchase_commission_entries")) {
        const [id, purchaseId, amount, key] = values;
        if (state.entry) return { rows: [] };
        state.entry = { id, purchase_id: purchaseId, entry_type: "commission_accrual", amount_cents: amount, idempotency_key: key };
        return { rows: [{ ...state.entry }] };
      }
      if (sql.includes("FROM purchase_commission_entries")) {
        return { rows: state.entry ? [{ purchase_id: state.entry.purchase_id, entry_type: state.entry.entry_type, amount_cents: state.entry.amount_cents }] : [] };
      }
      throw new Error("Unexpected SQL in test: " + sql);
    },
    release() { state.released = true; }
  };
  return { pool: { connect: async () => client }, calls, state };
}

const validArgs = {
  purchaseId: "00000000-0000-4000-8000-000000000011",
  paymentProvider: "test-provider",
  providerPaymentId: "provider-payment-1",
  amountCents: 10000,
  currency: "EUR"
};

test("verified payment marks purchase paid and records 2% commission atomically", async () => {
  const { pool, calls, state } = makePool();
  const result = await recordVerifiedPayment({ pool, ...validArgs });
  assert.equal(result.status, "paid");
  assert.equal(result.commissionCents, 200);
  assert.equal(result.merchantNetCents, 9800);
  assert.equal(result.duplicateNotification, false);
  assert.equal(state.purchase.status, "paid");
  assert.equal(state.entry.amount_cents, 200);
  assert.equal(state.committed, true);
  assert.equal(state.rolledBack, false);
  assert.equal(state.released, true);
  assert.equal(calls[0].sql, "BEGIN");
  assert.equal(calls.at(-1).sql, "COMMIT");
});

test("duplicate verified notification does not duplicate commission", async () => {
  const existingEntry = {
    id: "commission-1",
    purchase_id: "00000000-0000-4000-8000-000000000011",
    entry_type: "commission_accrual",
    amount_cents: 200,
    idempotency_key: "purchase-commission:00000000-0000-4000-8000-000000000011"
  };
  const { pool, calls, state } = makePool({
    initialPurchase: { ...purchase, status: "paid", paid_at: "2026-10-16T00:00:00Z" },
    existingEntry
  });
  const result = await recordVerifiedPayment({ pool, ...validArgs });
  assert.equal(result.duplicateNotification, true);
  assert.equal(calls.filter((call) => call.sql.includes("INSERT INTO purchase_commission_entries")).length, 1);
  assert.equal(state.entry.amount_cents, 200);
  assert.equal(state.committed, true);
});

test("amount mismatch rolls back without recording payment", async () => {
  const { pool, calls, state } = makePool();
  await assert.rejects(
    recordVerifiedPayment({ pool, ...validArgs, amountCents: 9999 }),
    (error) => error instanceof PurchaseServiceError && error.code === "PAYMENT_AMOUNT_MISMATCH"
  );
  assert.equal(state.committed, false);
  assert.equal(state.rolledBack, true);
  assert.equal(calls.some((call) => call.sql.includes("UPDATE partner_purchases")), false);
  assert.equal(state.released, true);
});

test("payment reference mismatch is rejected and transaction rolled back", async () => {
  const { pool, state } = makePool();
  await assert.rejects(
    recordVerifiedPayment({ pool, ...validArgs, providerPaymentId: "other-payment" }),
    (error) => error instanceof PurchaseServiceError && error.code === "PAYMENT_REFERENCE_MISMATCH"
  );
  assert.equal(state.rolledBack, true);
});

test("cancelled purchase cannot be marked paid", async () => {
  const { pool, state } = makePool({ initialPurchase: { ...purchase, status: "cancelled" } });
  await assert.rejects(
    recordVerifiedPayment({ pool, ...validArgs }),
    (error) => error instanceof PurchaseServiceError && error.code === "PURCHASE_NOT_PAYABLE"
  );
  assert.equal(state.rolledBack, true);
});

test("invalid amount is rejected before opening a database connection", async () => {
  let connected = false;
  const pool = { connect: async () => { connected = true; throw new Error("must not connect"); } };
  await assert.rejects(
    recordVerifiedPayment({ pool, ...validArgs, amountCents: 0 }),
    (error) => error instanceof PurchaseServiceError && error.code === "INVALID_INPUT"
  );
  assert.equal(connected, false);
});

test("sub-cent commission rounds to zero without inserting an invalid ledger row", async () => {
  const tinyPurchase = {
    ...purchase,
    gross_cents: "1",
    commission_cents: "0",
    merchant_net_cents: "1"
  };
  const { pool, calls, state } = makePool({ initialPurchase: tinyPurchase });
  const result = await recordVerifiedPayment({ pool, ...validArgs, amountCents: 1 });
  assert.equal(result.commissionCents, 0);
  assert.equal(result.merchantNetCents, 1);
  assert.equal(calls.some((call) => call.sql.includes("INSERT INTO purchase_commission_entries")), false);
  assert.equal(state.committed, true);
});

test("late duplicate payment webhook is harmless after a full refund", async () => {
  const existingEntry = {
    id: "commission-1",
    purchase_id: "00000000-0000-4000-8000-000000000011",
    entry_type: "commission_accrual",
    amount_cents: 200,
    idempotency_key: "purchase-commission:00000000-0000-4000-8000-000000000011"
  };
  const { pool, calls, state } = makePool({
    initialPurchase: { ...purchase, status: "refunded", paid_at: "2026-10-16T00:00:00Z" },
    existingEntry
  });
  const result = await recordVerifiedPayment({ pool, ...validArgs });
  assert.equal(result.duplicateNotification, true);
  assert.equal(state.purchase.status, "refunded");
  assert.equal(calls.some((call) => call.sql.includes("UPDATE partner_purchases")), false);
  assert.equal(state.committed, true);
});

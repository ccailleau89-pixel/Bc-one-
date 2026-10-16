import test from "node:test";
import assert from "node:assert/strict";
import { createPendingPurchase, PurchaseServiceError } from "./purchase-service.js";

const merchantId = "00000000-0000-4000-8000-000000000010";
const memberId = "00000000-0000-4000-8000-000000000001";
const idempotencyKey = "checkout-order-123";

function setup({ existing = null, merchant = { id: merchantId, status: "active", commission_bps: 200, stripe_account_id: "acct_test123" } } = {}) {
  const state = { calls: [], committed: false, rolledBack: false, released: false };
  const client = {
    async query(sql, values = []) {
      state.calls.push({ sql, values });
      if (sql === "BEGIN") return { rows: [] };
      if (sql === "COMMIT") { state.committed = true; return { rows: [] }; }
      if (sql === "ROLLBACK") { state.rolledBack = true; return { rows: [] }; }
      if (sql.includes("pg_advisory_xact_lock")) return { rows: [] };
      if (sql.includes("FROM partner_purchases") && sql.includes("idempotency_key")) return { rows: existing ? [existing] : [] };
      if (sql.includes("FROM merchants")) return { rows: merchant ? [merchant] : [] };
      if (sql.includes("INSERT INTO partner_purchases")) {
        return { rows: [{
          id: values[0], merchant_id: values[1], member_id: values[2],
          gross_cents: values[3], commission_bps: values[4],
          commission_cents: values[5], merchant_net_cents: values[6],
          provider_payment_id: values[7], status: "pending"
        }] };
      }
      throw new Error("Unexpected SQL: " + sql);
    },
    release() { state.released = true; }
  };
  return { pool: { connect: async () => client }, state };
}

test("creates pending purchase using merchant's server-side commission rate", async () => {
  const { pool, state } = setup();
  const result = await createPendingPurchase({ pool, merchantId, memberId, grossCents: 10000, idempotencyKey });
  assert.equal(result.gross_cents, 10000);
  assert.equal(result.commission_bps, 200);
  assert.equal(result.commission_cents, 200);
  assert.equal(result.merchant_net_cents, 9800);
  assert.equal(result.status, "pending");
  assert.equal(result.provider_payment_id, `pending:${result.id}`);
  assert.equal(result.reused, false);
  assert.equal(state.committed, true);
  assert.equal(state.rolledBack, false);
  assert.equal(state.released, true);
});

test("reuses an idempotent purchase instead of creating a second one", async () => {
  const existing = {
    id: "00000000-0000-4000-8000-000000000011",
    merchant_id: merchantId,
    member_id: memberId,
    gross_cents: "10000",
    commission_bps: 200,
    commission_cents: "200",
    merchant_net_cents: "9800",
    status: "pending",
    provider_payment_id: "pending:00000000-0000-4000-8000-000000000011"
  };
  const { pool, state } = setup({ existing });
  const result = await createPendingPurchase({ pool, merchantId, memberId, grossCents: 10000, idempotencyKey });
  assert.equal(result.id, existing.id);
  assert.equal(result.reused, true);
  assert.equal(state.calls.some((call) => call.sql.includes("INSERT INTO partner_purchases")), false);
  assert.equal(state.committed, true);
});

test("rejects a reused idempotency key with a different amount", async () => {
  const existing = {
    id: "00000000-0000-4000-8000-000000000011",
    merchant_id: merchantId,
    member_id: memberId,
    gross_cents: "10000",
    commission_bps: 200,
    commission_cents: "200",
    merchant_net_cents: "9800",
    status: "pending",
    provider_payment_id: "pending:00000000-0000-4000-8000-000000000011"
  };
  const { pool, state } = setup({ existing });
  await assert.rejects(
    createPendingPurchase({ pool, merchantId, memberId, grossCents: 9999, idempotencyKey }),
    (error) => error instanceof PurchaseServiceError && error.code === "IDEMPOTENCY_CONFLICT"
  );
  assert.equal(state.rolledBack, true);
});

test("refuses a merchant without an active connected Stripe account", async () => {
  const { pool, state } = setup({ merchant: { id: merchantId, status: "pending", commission_bps: 200, stripe_account_id: null } });
  await assert.rejects(
    createPendingPurchase({ pool, merchantId, memberId, grossCents: 10000, idempotencyKey }),
    (error) => error instanceof PurchaseServiceError && error.code === "MERCHANT_NOT_ONBOARDED"
  );
  assert.equal(state.rolledBack, true);
});

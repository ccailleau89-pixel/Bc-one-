import test from "node:test";
import assert from "node:assert/strict";
import { processVerifiedStripeEvent } from "./stripe-webhook.js";

const purchase = {
  id: "00000000-0000-4000-8000-000000000011",
  currency: "EUR",
  gross_cents: "10000",
  commission_bps: 200,
  commission_cents: "200",
  merchant_net_cents: "9800",
  payment_provider: "stripe",
  provider_payment_id: "cs_test123",
  status: "pending",
  paid_at: null
};

function fakePool({ duplicateEvent = false } = {}) {
  const state = { eventInserted: false, paid: false, commission: null, committed: false, rolledBack: false, released: false };
  const client = {
    async query(sql, values = []) {
      if (sql === "BEGIN") return { rows: [] };
      if (sql === "COMMIT") { state.committed = true; return { rows: [] }; }
      if (sql === "ROLLBACK") { state.rolledBack = true; return { rows: [] }; }
      if (sql.includes("INSERT INTO payment_provider_events")) {
        if (duplicateEvent) return { rows: [] };
        state.eventInserted = true;
        return { rows: [{ id: 1 }] };
      }
      if (sql.includes("FROM partner_purchases") && sql.includes("FOR UPDATE")) return { rows: [{ ...purchase }] };
      if (sql.includes("UPDATE partner_purchases")) { state.paid = true; return { rows: [], rowCount: 1 }; }
      if (sql.includes("INSERT INTO purchase_commission_entries")) {
        state.commission = { purchase_id: values[1], amount_cents: values[2] };
        return { rows: [{ id: values[0] }] };
      }
      throw new Error("Unexpected SQL: " + sql);
    },
    release() { state.released = true; }
  };
  return { pool: { connect: async () => client }, state };
}

const paidEvent = {
  id: "evt_test123",
  type: "checkout.session.completed",
  data: { object: {
    id: "cs_test123",
    payment_status: "paid",
    amount_total: 10000,
    currency: "eur",
    metadata: { purchase_id: purchase.id }
  } }
};

test("processes a signed-and-verified paid Checkout event once", async () => {
  const { pool, state } = fakePool();
  const result = await processVerifiedStripeEvent({ pool, event: paidEvent });
  assert.equal(result.processed, true);
  assert.equal(state.eventInserted, true);
  assert.equal(state.paid, true);
  assert.equal(state.commission.amount_cents, 200);
  assert.equal(state.committed, true);
  assert.equal(state.rolledBack, false);
  assert.equal(state.released, true);
});

test("duplicate Stripe event is acknowledged without repeating purchase writes", async () => {
  const { pool, state } = fakePool({ duplicateEvent: true });
  const result = await processVerifiedStripeEvent({ pool, event: paidEvent });
  assert.equal(result.processed, false);
  assert.equal(result.result.status, "duplicate_event");
  assert.equal(state.paid, false);
  assert.equal(state.commission, null);
  assert.equal(state.committed, true);
});

test("does not mark an unpaid asynchronous Checkout session as paid", async () => {
  const { pool, state } = fakePool();
  const event = { ...paidEvent, type: "checkout.session.completed", data: { object: { ...paidEvent.data.object, payment_status: "unpaid" } } };
  const result = await processVerifiedStripeEvent({ pool, event });
  assert.equal(result.processed, false);
  assert.equal(result.reason, "payment_not_completed");
  assert.equal(state.eventInserted, false);
  assert.equal(state.paid, false);
});

test("expired Checkout sessions are acknowledged without writes", async () => {
  const { pool, state } = fakePool();
  const event = { ...paidEvent, type: "checkout.session.expired", data: { object: { ...paidEvent.data.object, payment_status: "unpaid" } } };
  const result = await processVerifiedStripeEvent({ pool, event });
  assert.equal(result.reason, "session_expired");
  assert.equal(state.eventInserted, false);
});

function failedPool({ status = "pending" } = {}) {
  const state = { failed: false, committed: false };
  const client = {
    async query(sql) {
      if (sql === "BEGIN" || sql === "ROLLBACK") return { rows: [] };
      if (sql === "COMMIT") { state.committed = true; return { rows: [] }; }
      if (sql.includes("INSERT INTO payment_provider_events")) return { rows: [{ id: 1 }] };
      if (sql.includes("FROM partner_purchases")) return { rows: [{ ...purchase, status }] };
      if (sql.includes("SET status = 'failed'")) { state.failed = true; return { rows: [], rowCount: 1 }; }
      throw new Error("Unexpected SQL: " + sql);
    },
    release() {}
  };
  return { pool: { connect: async () => client }, state };
}

test("failed asynchronous payments mark a pending purchase as failed", async () => {
  const { pool, state } = failedPool();
  const event = { ...paidEvent, id: "evt_failed", type: "checkout.session.async_payment_failed", data: { object: { ...paidEvent.data.object, payment_status: "unpaid" } } };
  const result = await processVerifiedStripeEvent({ pool, event });
  assert.equal(result.processed, true);
  assert.equal(result.result.status, "failed");
  assert.equal(state.failed, true);
  assert.equal(state.committed, true);
});

test("a failed-payment event never downgrades a paid purchase", async () => {
  const { pool, state } = failedPool({ status: "paid" });
  const event = { ...paidEvent, id: "evt_failed2", type: "checkout.session.async_payment_failed", data: { object: { ...paidEvent.data.object, payment_status: "unpaid" } } };
  const result = await processVerifiedStripeEvent({ pool, event });
  assert.equal(result.processed, false);
  assert.equal(result.result.status, "paid");
  assert.equal(state.failed, false);
});

test("classifies permanent webhook errors separately from transient ones", async () => {
  const { isPermanentWebhookError } = await import("./stripe-webhook.js");
  assert.equal(isPermanentWebhookError({ code: "PAYMENT_AMOUNT_MISMATCH" }), true);
  assert.equal(isPermanentWebhookError({ code: "PURCHASE_NOT_FOUND" }), true);
  assert.equal(isPermanentWebhookError({ code: "PAYMENT_RECORDING_FAILED" }), false);
  assert.equal(isPermanentWebhookError(new Error("connection reset")), false);
});

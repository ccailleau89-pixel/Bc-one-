import test from "node:test";
import assert from "node:assert/strict";
import { createPartnerCheckoutSession } from "./stripe-checkout.js";
import { PurchaseServiceError } from "./purchase-service.js";

const purchaseRow = {
  id: "00000000-0000-4000-8000-000000000011",
  merchant_id: "00000000-0000-4000-8000-000000000010",
  gross_cents: "10000",
  commission_bps: 200,
  commission_cents: "200",
  merchant_net_cents: "9800",
  currency: "EUR",
  payment_provider: "stripe",
  provider_payment_id: "pending:00000000-0000-4000-8000-000000000011",
  status: "pending",
  public_name: "Demo Shop",
  merchant_status: "active",
  stripe_account_id: "acct_test123"
};

function setup({ row = purchaseRow } = {}) {
  const calls = [];
  const pool = {
    async query(sql, values) {
      calls.push({ sql, values });
      if (sql.includes("JOIN merchants")) return { rows: [row] };
      if (sql.includes("UPDATE partner_purchases")) {
        return { rows: [{ id: purchaseRow.id }] };
      }
      throw new Error("Unexpected SQL: " + sql);
    }
  };
  const stripeCalls = [];
  const stripe = {
    checkout: {
      sessions: {
        async create(params, options) {
          stripeCalls.push({ params, options });
          return { id: "cs_test123", url: "https://checkout.stripe.test/session" };
        },
        async retrieve(id) {
          return { id, url: "https://checkout.stripe.test/session", metadata: { purchase_id: purchaseRow.id } };
        }
      }
    }
  };
  return { pool, stripe, calls, stripeCalls };
}

test("creates a server-priced Stripe Connect session with 2% application fee", async () => {
  const { pool, stripe, calls, stripeCalls } = setup();
  const result = await createPartnerCheckoutSession({
    pool, stripe, purchaseId: purchaseRow.id, baseUrl: "https://bc-one.example"
  });
  assert.equal(result.sessionId, "cs_test123");
  assert.equal(result.reused, false);
  const call = stripeCalls[0];
  assert.equal(call.params.line_items[0].price_data.unit_amount, 10000);
  assert.equal(call.params.payment_intent_data.application_fee_amount, 200);
  assert.equal(call.params.payment_intent_data.transfer_data.destination, "acct_test123");
  assert.equal(call.params.metadata.purchase_id, purchaseRow.id);
  assert.equal(call.options.idempotencyKey, `bc-one-checkout-${purchaseRow.id}`);
  assert.equal(calls.some((item) => item.sql.includes("UPDATE partner_purchases")), true);
});

test("rejects inactive merchants before calling Stripe", async () => {
  const { pool, stripe, stripeCalls } = setup({ row: { ...purchaseRow, merchant_status: "suspended" } });
  await assert.rejects(
    createPartnerCheckoutSession({ pool, stripe, purchaseId: purchaseRow.id, baseUrl: "https://bc-one.example" }),
    (error) => error instanceof PurchaseServiceError && error.code === "PURCHASE_NOT_PAYABLE"
  );
  assert.equal(stripeCalls.length, 0);
});

test("rejects an invalid purchase identifier before querying the database", async () => {
  let queried = false;
  const pool = { query: async () => { queried = true; return { rows: [] }; } };
  await assert.rejects(
    createPartnerCheckoutSession({ pool, stripe: { checkout: { sessions: { create: async () => { throw new Error("must not create"); } } } }, purchaseId: "not-a-uuid", baseUrl: "https://bc-one.example" }),
    (error) => error instanceof PurchaseServiceError && error.code === "INVALID_INPUT"
  );
  assert.equal(queried, false);
});

test("rejects non-HTTPS public checkout URLs", async () => {
  const { pool, stripe } = setup();
  await assert.rejects(
    createPartnerCheckoutSession({ pool, stripe, purchaseId: purchaseRow.id, baseUrl: "http://bc-one.example" }),
    (error) => error instanceof PurchaseServiceError && error.code === "CHECKOUT_NOT_CONFIGURED"
  );
});

function withExistingSession(status) {
  const ctx = setup({ row: { ...purchaseRow, provider_payment_id: "cs_old123" } });
  ctx.stripe.checkout.sessions.retrieve = async (id) => ({
    id, status, url: "https://checkout.stripe.test/old", metadata: { purchase_id: purchaseRow.id }
  });
  return ctx;
}

test("reuses an existing Checkout Session only while it is still open", async () => {
  const { pool, stripe, stripeCalls } = withExistingSession("open");
  const result = await createPartnerCheckoutSession({ pool, stripe, purchaseId: purchaseRow.id, baseUrl: "https://bc-one.example" });
  assert.equal(result.reused, true);
  assert.equal(result.sessionId, "cs_old123");
  assert.equal(stripeCalls.length, 0);
});

test("replaces an expired Checkout Session instead of returning a dead link", async () => {
  const { pool, stripe, calls, stripeCalls } = withExistingSession("expired");
  const result = await createPartnerCheckoutSession({ pool, stripe, purchaseId: purchaseRow.id, baseUrl: "https://bc-one.example" });
  assert.equal(result.reused, false);
  assert.equal(result.sessionId, "cs_test123");
  assert.equal(stripeCalls.length, 1);
  assert.equal(stripeCalls[0].options.idempotencyKey, `bc-one-checkout-${purchaseRow.id}-after-cs_old123`);
  const bind = calls.find((item) => item.sql.includes("UPDATE partner_purchases"));
  assert.deepEqual(bind.values, [purchaseRow.id, "cs_test123", "cs_old123"]);
});

test("refuses to create a second session once checkout is completed", async () => {
  const { pool, stripe, stripeCalls } = withExistingSession("complete");
  await assert.rejects(
    createPartnerCheckoutSession({ pool, stripe, purchaseId: purchaseRow.id, baseUrl: "https://bc-one.example" }),
    (error) => error instanceof PurchaseServiceError && error.code === "CHECKOUT_ALREADY_COMPLETED"
  );
  assert.equal(stripeCalls.length, 0);
});

test("accepts an upper-case purchase identifier and normalises it", async () => {
  const { pool, stripe, stripeCalls } = setup();
  await createPartnerCheckoutSession({ pool, stripe, purchaseId: purchaseRow.id.toUpperCase(), baseUrl: "https://bc-one.example" });
  assert.equal(stripeCalls[0].params.metadata.purchase_id, purchaseRow.id);
});

import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./server.js";
import Stripe from "stripe";

async function withServer(app, run) {
  await new Promise((resolve) => app.listen(0, "127.0.0.1", resolve));
  const address = app.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => app.close((error) => error ? reject(error) : resolve()));
  }
}

test("health endpoint returns a minimal status", async () => {
  await withServer(createApp(), async (base) => {
    const response = await fetch(base + "/health");
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok", service: "bc-one-api" });
  });
});

test("benefits endpoint uses parameterized SQL and returns rows", async () => {
  let captured;
  const app = createApp({
    query: async (sql, values) => {
      captured = { sql, values };
      return { rows: [{ slug: "demo", points_cost: 10 }] };
    }
  });
  await withServer(app, async (base) => {
    const response = await fetch(base + "/api/v1/benefits?limit=12");
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      data: [{ slug: "demo", points_cost: 10 }],
      meta: { count: 1, limit: 12 }
    });
  });
  assert.deepEqual(captured.values, [12]);
  assert.match(captured.sql, /status = 'active'/);
});

test("benefits endpoint rejects invalid limits before querying", async () => {
  let called = false;
  const app = createApp({ query: async () => { called = true; return { rows: [] }; } });
  await withServer(app, async (base) => {
    for (const path of [
      "/api/v1/benefits?limit=0",
      "/api/v1/benefits?limit=101",
      "/api/v1/benefits?limit=1%20OR%201=1",
      "/api/v1/benefits?limit=-1"
    ]) {
      const response = await fetch(base + path);
      assert.equal(response.status, 400, path);
    }
  });
  assert.equal(called, false);
});

test("database failures do not leak internal error details", async () => {
  const app = createApp({ query: async () => { throw new Error("secret database details"); } });
  await withServer(app, async (base) => {
    const response = await fetch(base + "/api/v1/benefits");
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: "service_unavailable" });
  });
});

test("readiness endpoint reports database unavailable without details", async () => {
  const app = createApp({ ready: async () => { throw new Error("private details"); } });
  await withServer(app, async (base) => {
    const response = await fetch(base + "/ready");
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { status: "not_ready" });
  });
});

test("unknown paths return JSON 404", async () => {
  await withServer(createApp(), async (base) => {
    const response = await fetch(base + "/not-real");
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: "not_found" });
  });
});

test("Stripe webhook rejects invalid signatures without processing payload", async () => {
  const stripe = new Stripe("sk_test_bc_one");
  const app = createApp({ stripe, stripeWebhookSecret: "whsec_test", pool: { connect: async () => { throw new Error("must not connect"); } } });
  await withServer(app, async (base) => {
    const response = await fetch(base + "/api/v1/webhooks/stripe", {
      method: "POST",
      headers: { "content-type": "application/json", "stripe-signature": "invalid" },
      body: JSON.stringify({ id: "evt_fake", type: "checkout.session.completed", data: { object: {} } })
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "invalid_webhook_signature" });
  });
});

test("Stripe webhook verifies raw-body signature before acknowledging event", async () => {
  const stripe = new Stripe("sk_test_bc_one");
  const secret = "whsec_test";
  const payload = JSON.stringify({ id: "evt_unsupported", type: "customer.updated", data: { object: { id: "cus_test" } } });
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });
  const app = createApp({ stripe, stripeWebhookSecret: secret, pool: {} });
  await withServer(app, async (base) => {
    const response = await fetch(base + "/api/v1/webhooks/stripe", {
      method: "POST",
      headers: { "content-type": "application/json", "stripe-signature": signature },
      body: payload
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { received: true, processed: false, reason: "unsupported_event_type" });
  });
});

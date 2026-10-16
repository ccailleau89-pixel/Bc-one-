import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./server.js";

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

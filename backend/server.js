import { createServer } from "node:http";
import pg from "pg";
import Stripe from "stripe";
import { processVerifiedStripeEvent } from "./stripe-webhook.js";

const { Pool } = pg;
const PORT = Number.parseInt(process.env.PORT ?? "3000", 10);
const DATABASE_URL = process.env.DATABASE_URL;

const BENEFITS_SQL = `
  SELECT id, slug, title, description, points_cost, starts_at, ends_at,
         total_redemption_limit, per_member_limit
  FROM benefits
  WHERE status = 'active'
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())
  ORDER BY points_cost ASC, title ASC
  LIMIT $1
`;

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  response.end(body);
}

export function createApp({ query, ready = async () => true, stripe, stripeWebhookSecret, pool } = {}) {
  return createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");

    if (request.method === "POST" && url.pathname === "/api/v1/webhooks/stripe") {
      if (!stripe || !stripeWebhookSecret || !pool) {
        return sendJson(response, 503, { error: "webhook_unavailable" });
      }
      const signature = request.headers["stripe-signature"];
      if (typeof signature !== "string" || signature.length > 500) {
        return sendJson(response, 400, { error: "invalid_webhook_signature" });
      }
      let rawBody;
      try {
        const chunks = [];
        let size = 0;
        for await (const chunk of request) {
          size += chunk.length;
          if (size > 1_000_000) {
            return sendJson(response, 413, { error: "payload_too_large" });
          }
          chunks.push(chunk);
        }
        rawBody = Buffer.concat(chunks);
      } catch {
        return sendJson(response, 400, { error: "invalid_webhook_body" });
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret);
      } catch {
        return sendJson(response, 400, { error: "invalid_webhook_signature" });
      }

      try {
        const result = await processVerifiedStripeEvent({ pool, event });
        return sendJson(response, 200, result);
      } catch (error) {
        // Return a generic response. A 5xx lets Stripe retry transient failures.
        console.error("Stripe webhook processing failed", error.code ?? "UNKNOWN");
        return sendJson(response, 500, { error: "webhook_processing_failed" });
      }
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return sendJson(response, 200, { status: "ok", service: "bc-one-api" });
    }

    if (request.method === "GET" && url.pathname === "/ready") {
      try {
        const isReady = await ready();
        return sendJson(response, isReady ? 200 : 503, {
          status: isReady ? "ready" : "not_ready"
        });
      } catch {
        return sendJson(response, 503, { status: "not_ready" });
      }
    }

    if (request.method === "GET" && url.pathname === "/api/v1/benefits") {
      if (typeof query !== "function") {
        return sendJson(response, 503, { error: "service_unavailable" });
      }

      const rawLimit = url.searchParams.get("limit") ?? "50";
      if (!/^\d{1,3}$/.test(rawLimit)) {
        return sendJson(response, 400, { error: "invalid_limit" });
      }
      const limit = Number(rawLimit);
      if (limit < 1 || limit > 100) {
        return sendJson(response, 400, { error: "limit_out_of_range", min: 1, max: 100 });
      }

      try {
        const result = await query(BENEFITS_SQL, [limit]);
        return sendJson(response, 200, {
          data: result.rows,
          meta: { count: result.rows.length, limit }
        });
      } catch {
        return sendJson(response, 503, { error: "service_unavailable" });
      }
    }

    return sendJson(response, 404, { error: "not_found" });
  });
}

async function main() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL must be configured before starting the API");
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 3_000,
    ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: true } : undefined
  });

  const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
  const app = createApp({
    pool,
    stripe,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    query: (text, values) => pool.query(text, values),
    ready: async () => {
      await pool.query("SELECT 1");
      return true;
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BC ONE API listening on port ${PORT}`);
  });

  const shutdown = async () => {
    app.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

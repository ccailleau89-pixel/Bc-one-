import { createServer } from "node:http";
import pg from "pg";

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

export function createApp({ query, ready = async () => true } = {}) {
  return createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");

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

  const app = createApp({
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

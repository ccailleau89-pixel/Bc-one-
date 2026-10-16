# BC ONE API — first backend slice

This is a **read-only API foundation**, not a production member-account system. It currently exposes:
- `GET /health`: process liveness.
- `GET /ready`: database connectivity.
- `GET /api/v1/benefits?limit=50`: currently active benefits only, capped at 100 rows.

It intentionally does **not** expose login, account creation, points crediting, redemption, transfers, admin routes, or token transactions. Those require authentication, authorization and transactional/idempotency controls first.

## Local setup

Requires Node.js 20+ and PostgreSQL. Create an empty database, then run:

```sh
npm install
psql "$DATABASE_URL" --set ON_ERROR_STOP=1 --file backend/schema.sql
npm test
npm run check
DATABASE_URL="postgres://user:password@localhost:5432/bc_one" npm start
```

Set `DATABASE_URL` in the environment; never commit credentials. For hosted databases, use the provider's TLS connection settings. The example app uses a small connection pool and does not log database errors to clients.

## Tests

`node --test backend/server.test.js` covers health, read-only benefits, SQL parameterization, limit validation, generic error handling and readiness failures. The CI PostgreSQL workflow separately applies the schema and runs SQL smoke tests.

## Next backend milestones

1. Select managed authentication and define privacy/retention requirements.
2. Add member-owned profile endpoints and enforce access controls.
3. Implement balance reads and immutable ledger writes inside database transactions.
4. Implement redemptions with idempotency, row locking and per-member/global limits.
5. Add audit events and authorization tests for admin actions.
6. Only after review, connect a browser interface to the API.

## Zero-euro launch constraint

The code can be developed and tested with free tools and GitHub Actions. A public API and managed PostgreSQL may have free tiers but are not guaranteed to remain free; limits, sleep behavior, backups, bandwidth and terms must be checked before launch. Do not store real customer data or accept payments in this scaffold.

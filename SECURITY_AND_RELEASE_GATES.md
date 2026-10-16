# BC ONE — quality and production gates

**Zero defects cannot be promised honestly.** The goal is to detect failures early, reduce attack surface, and block production until evidence supports readiness. Passing CI is necessary but not proof of security.

## Current state

- The interface and technical foundation have been merged into `main`; the public GitHub Pages prototype is deployed.
- Public deployment is a demo site, not a production payment platform or production backend.
- Burger ID remains inactive until a shared Supabase project is configured and the reviewed migrations are applied and tested.
- No payment provider, merchant settlement, live customer database, real-money transaction or token issuance is active.
- Commission math is deterministic and expressed in integer cents / basis points.
- Automated checks cover unit tests and a PostgreSQL schema smoke test.

## Non-negotiable production gates

### Money and accounting
- All payment status transitions originate from verified provider events, never browser parameters.
- Idempotency for payment, commission, refund and webhook processing.
- A single database transaction records every confirmed payment and commission entry.
- Refund totals and commission reversals cannot exceed the original transaction; concurrency tests must prove this.
- Append-only financial ledger; corrections are compensating entries, not edits/deletes.
- Daily reconciliation against provider settlement and a documented discrepancy workflow.
- Contract states the commission base, VAT treatment, payment timing, refunds, chargebacks and any pass-through fees.

### Security and privacy
- Proven authentication provider; no homemade password/session system.
- Explicit role-based authorization and object-level access checks.
- Secrets only in environment/secret manager; no keys in repository or browser code.
- TLS in transit, secure session settings, rate limiting, input validation and safe error responses.
- Dependency scanning, secret scanning, static analysis and vulnerability response process.
- Data minimization, retention/deletion rules, access logging and privacy review.
- Backups and a tested restore procedure; incident-response and key-rotation runbooks.

### Testing and release
- Unit tests, integration tests against real PostgreSQL, concurrency tests and negative authorization tests.
- Test duplicate and out-of-order webhooks, partial refunds, chargebacks, network timeouts and provider retries.
- Test that no failed or pending payment generates a commission accrual.
- Test database migration from an empty database and from the previous schema.
- Independent security review before handling real money.
- Testnet and legal/commercial review before any crypto-token launch.
- Signed release checklist and explicit approval before production deployment.

## Zero-personal-capital principle

Use local tools, open-source libraries and free CI where feasible. Do not pretend payment processing, public hosting, legal review, audits, tax/accounting or marketplace payouts are guaranteed free. Choose a payment provider only after checking its current fees and marketplace terms. Do not collect customer money until the provider and legal flow are approved.

## Release decision

The present code is a foundation only. It must not be represented as a complete payment platform, a production-ready ledger, a legal opinion, or an audited crypto-token system.

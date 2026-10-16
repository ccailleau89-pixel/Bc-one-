# BC ONE commerce commissions (draft)

Default commercial assumption: **2% platform commission on paid purchases at partner merchants**. The rate is stored per merchant in basis points (200 = 2.00%) so a signed agreement can override it. Money is integer cents, never floating point.

## Algorithm

For a purchase of gross amount G cents and commission rate R basis points:

- Platform commission = floor(G × R / 10,000)
- Merchant amount before other costs = G − platform commission

Example: €100.00 => €2.00 gross platform commission and €98.00 merchant amount before payment-provider fees, taxes, refunds, chargebacks and operating costs. The split always adds up to the original gross amount.

The calculation functions are pure and covered by tests in `backend/commission.test.js`. The transaction service in `backend/purchase-service.js` locks the pending purchase, checks the verified provider amount and reference, changes the purchase to paid and appends the commission entry in one database transaction. Duplicate payment notifications are idempotent, including retries arriving after a refund. The service is covered by `backend/purchase-service.test.js`.

**Important:** the service deliberately does not verify payment-provider webhook signatures. It must only be called by trusted backend code after signature verification or a server-to-server provider confirmation. No public route currently calls this service, and no payment provider is connected.

## Transaction lifecycle to implement

1. Checkout creates a pending purchase using a server-created idempotency key.
2. A payment provider processes payment; BC ONE stores no card number or security code.
3. A signed webhook is verified server-side (or the provider is queried server-to-server).
4. Within a database transaction, record the verified payment, calculate the agreed commission and append the commission ledger entry exactly once.
5. Refunds/chargebacks create linked reversal records; never edit or delete the original commission history.
6. Reconcile totals against the payment provider's settlement reports.

A browser success redirect is not proof of payment. No public endpoint may mark a purchase paid. Merchant payout and the actual collection of the 2% require a suitable payment provider/marketplace agreement and are not implemented yet.

## Zero-personal-cash constraint

Use free local development tools and GitHub Actions. Before public launch, choose a payment provider whose current fees and marketplace/split-payment features fit the business; payment processing fees will generally exist even if BC ONE's own infrastructure has a free tier. Do not promise free processing or assume a provider will onboard the business. Do not hold or route customer funds until the legal/payment model is reviewed.

## Scope and exclusions

This is a backend design and algorithm, not a live payment service. There is no payment-provider secret, no real merchant account, no live checkout and no real customer data. Before launch, document merchant contracts, VAT/accounting treatment, refund/chargeback rules, consumer disclosures, GDPR obligations and any payment-services regulatory implications.


## Stripe Connect integration status

The feature branch now contains:
- `createPendingPurchase`: records a pending purchase from a server-resolved amount, locks the idempotency key, and snapshots the merchant commission rate;
- `createPartnerCheckoutSession`: creates an idempotent Stripe Checkout Session with a 2% application fee and transfer destination from the merchant's connected Stripe account;
- `POST /api/v1/webhooks/stripe`: verifies the exact raw request body with Stripe's signature and only then processes supported paid Checkout events;
- `recordVerifiedPayment`: updates the purchase and appends the commission ledger entry in the same SQL transaction, while deduplicating provider event IDs;
- `payment_provider_events`: persists Stripe event IDs transactionally so Stripe retries cannot create duplicate accounting entries.

The pending-purchase and checkout services are backend modules, **not public routes**. No authentication/authorization system or product catalogue is currently implemented, so do not expose these services to browser requests yet. The trusted caller must resolve the product price on the server and verify the signed-in user's authorization before creating a purchase. The Checkout Session must be persisted before a customer can finish payment; if a webhook arrives before the session reference is stored, the endpoint returns a retryable 5xx.

### Required test-mode setup

1. Create a Stripe account and enable Connect for the platform; complete the platform's identity/business verification.
2. Onboard each test merchant as a connected account and store its `acct_...` ID in `merchants.stripe_account_id` only after the provider confirms onboarding.
3. Configure `STRIPE_SECRET_KEY` with a test-mode secret and `STRIPE_WEBHOOK_SECRET` with the signing secret for the local/test endpoint. Copy `.env.example`; never commit real values.
4. Configure the webhook endpoint to send `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
5. Use a test database and test cards only. Confirm application fee, connected-account transfer, duplicate delivery, amount mismatch, cancellation, refund and reconciliation behaviour.
6. Before live mode, add authenticated product/purchase routes, account onboarding, a real refund workflow, dispute/chargeback handling, settlement reconciliation, monitoring, secrets management, privacy/terms and legal/accounting review.

No live API key, merchant account, webhook secret, database or production URL has been configured. Adding the SDK does not activate payment processing. The platform's actual eligibility, fees, payout model and legal obligations must be confirmed with Stripe and professional advisers before accepting money.

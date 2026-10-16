# BC ONE commerce commissions (draft)

Default commercial assumption: **2% platform commission on paid purchases at partner merchants**. The rate is stored per merchant in basis points (200 = 2.00%) so a signed agreement can override it. Money is integer cents, never floating point.

## Algorithm

For a purchase of gross amount G cents and commission rate R basis points:

- Platform commission = floor(G × R / 10,000)
- Merchant amount before other costs = G − platform commission

Example: €100.00 => €2.00 gross platform commission and €98.00 merchant amount before payment-provider fees, taxes, refunds, chargebacks and operating costs. The split always adds up to the original gross amount.

The calculation functions are pure and covered by tests in `backend/commission.test.js`. They do not collect money, process card data or integrate a payment provider.

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

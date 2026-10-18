import { calculateCommission } from "./commission.js";
import { PurchaseServiceError } from "./purchase-service.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function appBaseUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new PurchaseServiceError("CHECKOUT_NOT_CONFIGURED", "APP_BASE_URL must be a valid URL");
  }
  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new PurchaseServiceError("CHECKOUT_NOT_CONFIGURED", "APP_BASE_URL must use HTTPS");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new PurchaseServiceError("CHECKOUT_NOT_CONFIGURED", "APP_BASE_URL must be an origin or base path without credentials, query or fragment");
  }
  return url.toString().replace(/\/$/, "");
}

/**
 * Creates a Stripe Connect destination-charge Checkout Session for a pending
 * purchase whose amount and commission were calculated server-side.
 * Call only from an authenticated backend flow; never expose this service
 * directly to unauthenticated clients.
 */
export async function createPartnerCheckoutSession({ pool, stripe, purchaseId: rawPurchaseId, baseUrl }) {
  if (!pool || typeof pool.query !== "function" || !stripe?.checkout?.sessions?.create) {
    throw new PurchaseServiceError("CHECKOUT_NOT_CONFIGURED", "Database and Stripe SDK must be configured");
  }
  if (typeof rawPurchaseId !== "string" || !UUID_RE.test(rawPurchaseId)) {
    throw new PurchaseServiceError("INVALID_INPUT", "purchaseId must be a UUID");
  }
  const purchaseId = rawPurchaseId.toLowerCase();
  const appUrl = appBaseUrl(baseUrl);

  const result = await pool.query(
    `SELECT p.id, p.merchant_id, p.gross_cents, p.commission_bps,
            p.commission_cents, p.merchant_net_cents, p.currency,
            p.payment_provider, p.provider_payment_id, p.status,
            m.public_name, m.status AS merchant_status, m.stripe_account_id
       FROM partner_purchases p
       JOIN merchants m ON m.id = p.merchant_id
      WHERE p.id = $1`,
    [purchaseId]
  );
  if (result.rows.length !== 1) {
    throw new PurchaseServiceError("PURCHASE_NOT_FOUND", "Purchase was not found");
  }
  const purchase = result.rows[0];
  if (purchase.status !== "pending" || purchase.merchant_status !== "active") {
    throw new PurchaseServiceError("PURCHASE_NOT_PAYABLE", "Purchase or merchant is not active");
  }
  if (purchase.currency !== "EUR" || purchase.payment_provider !== "stripe") {
    throw new PurchaseServiceError("CHECKOUT_NOT_CONFIGURED", "Purchase payment provider or currency is invalid");
  }
  if (typeof purchase.stripe_account_id !== "string" || !purchase.stripe_account_id.startsWith("acct_")) {
    throw new PurchaseServiceError("MERCHANT_NOT_ONBOARDED", "Merchant has no connected Stripe account");
  }
  const grossCents = Number(purchase.gross_cents);
  const commissionBps = Number(purchase.commission_bps);
  const split = calculateCommission({ grossCents, commissionBps });
  if (split.platformCommissionCents !== Number(purchase.commission_cents) ||
      split.merchantNetCents !== Number(purchase.merchant_net_cents)) {
    throw new PurchaseServiceError("PURCHASE_SPLIT_INVALID", "Stored purchase commission split is inconsistent");
  }

  const expectedPlaceholder = `pending:${purchaseId}`;
  if (purchase.provider_payment_id !== expectedPlaceholder &&
      !(typeof purchase.provider_payment_id === "string" && purchase.provider_payment_id.startsWith("cs_"))) {
    throw new PurchaseServiceError("CHECKOUT_REFERENCE_CONFLICT", "Purchase already has a different provider reference");
  }

  // The reference the purchase must still hold when the new session is bound.
  let currentReference = expectedPlaceholder;
  let idempotencyKey = `bc-one-checkout-${purchaseId}`;

  if (purchase.provider_payment_id.startsWith("cs_")) {
    const existing = await stripe.checkout.sessions.retrieve(purchase.provider_payment_id);
    if (existing.metadata?.purchase_id !== purchaseId) {
      throw new PurchaseServiceError("CHECKOUT_REFERENCE_CONFLICT", "Existing Checkout Session does not match purchase");
    }
    if (existing.status === "open") {
      return { sessionId: existing.id, url: existing.url, reused: true };
    }
    if (existing.status !== "expired") {
      // "complete": paid or awaiting an asynchronous payment; the webhook settles it.
      throw new PurchaseServiceError("CHECKOUT_ALREADY_COMPLETED", "Checkout Session is already completed");
    }
    // Expired sessions are dead links (Stripe expires them after 24h by default).
    // Replace it; the key is deterministic so concurrent retries share one new session.
    currentReference = existing.id;
    idempotencyKey = `bc-one-checkout-${purchaseId}-after-${existing.id}`;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: purchaseId,
    metadata: { purchase_id: purchaseId, merchant_id: purchase.merchant_id },
    payment_intent_data: {
      application_fee_amount: split.platformCommissionCents,
      transfer_data: { destination: purchase.stripe_account_id },
      metadata: { purchase_id: purchaseId, merchant_id: purchase.merchant_id }
    },
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: grossCents,
        product_data: { name: `Achat chez ${purchase.public_name}` }
      }
    }],
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel?purchase_id=${encodeURIComponent(purchaseId)}`
  }, { idempotencyKey });

  if (typeof session.id !== "string" || !session.id.startsWith("cs_") || typeof session.url !== "string") {
    throw new PurchaseServiceError("STRIPE_CHECKOUT_FAILED", "Stripe did not return a valid Checkout Session");
  }

  const update = await pool.query(
    `UPDATE partner_purchases
        SET provider_payment_id = $2
      WHERE id = $1 AND status = 'pending'
        AND payment_provider = 'stripe'
        AND provider_payment_id = $3
      RETURNING id`,
    [purchaseId, session.id, currentReference]
  );
  if (update.rows.length !== 1) {
    const current = await pool.query(
      "SELECT provider_payment_id, status FROM partner_purchases WHERE id = $1",
      [purchaseId]
    );
    if (current.rows[0]?.provider_payment_id !== session.id || current.rows[0]?.status !== "pending") {
      throw new PurchaseServiceError("CHECKOUT_REFERENCE_CONFLICT", "Could not safely bind Checkout Session to purchase");
    }
  }
  return { sessionId: session.id, url: session.url, reused: false };
}

import { recordVerifiedPayment, recordFailedPayment, PurchaseServiceError } from "./purchase-service.js";

const SUPPORTED_PAYMENT_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded"
]);

// Errors that a retry of the same event can never fix. The HTTP layer acknowledges
// them (so Stripe does not retry for days and disable the endpoint) and logs them
// for manual reconciliation. Anything else is treated as transient.
const PERMANENT_ERROR_CODES = new Set([
  "INVALID_STRIPE_EVENT", "MISSING_PURCHASE_REFERENCE", "INVALID_STRIPE_AMOUNT",
  "CURRENCY_MISMATCH", "INVALID_STRIPE_SESSION", "INVALID_INPUT", "INVALID_EVENT",
  "PURCHASE_NOT_FOUND", "PAYMENT_REFERENCE_MISMATCH", "PAYMENT_AMOUNT_MISMATCH",
  "PURCHASE_NOT_PAYABLE", "PURCHASE_SPLIT_INVALID", "COMMISSION_IDEMPOTENCY_CONFLICT",
  "INVALID_GROSS_AMOUNT", "INVALID_COMMISSION_RATE"
]);

export function isPermanentWebhookError(error) {
  return Boolean(error && typeof error.code === "string" && PERMANENT_ERROR_CODES.has(error.code));
}

/**
 * Call only with an event verified by Stripe's SDK against the exact raw body.
 * The pending purchase must already store payment_provider='stripe' and
 * provider_payment_id equal to the Stripe Checkout Session ID.
 */
export async function processVerifiedStripeEvent({ pool, event }) {
  if (!event || typeof event.id !== "string" || typeof event.type !== "string" || !event.data?.object) {
    throw new PurchaseServiceError("INVALID_STRIPE_EVENT", "Stripe event payload is invalid");
  }
  const session = event.data.object;

  if (event.type === "checkout.session.expired") {
    // Nothing was paid. The purchase stays pending; the next checkout request
    // replaces the expired session with a fresh one.
    return { received: true, processed: false, reason: "session_expired" };
  }

  if (event.type === "checkout.session.async_payment_failed") {
    if (typeof session.metadata?.purchase_id !== "string" || !session.metadata.purchase_id) {
      throw new PurchaseServiceError("MISSING_PURCHASE_REFERENCE", "Stripe session is missing purchase_id metadata");
    }
    if (typeof session.id !== "string" || !session.id.startsWith("cs_")) {
      throw new PurchaseServiceError("INVALID_STRIPE_SESSION", "Stripe Checkout Session ID is invalid");
    }
    const result = await recordFailedPayment({
      pool,
      purchaseId: session.metadata.purchase_id,
      paymentProvider: "stripe",
      providerPaymentId: session.id,
      providerEventId: event.id,
      providerEventType: event.type
    });
    return { received: true, processed: result.status === "failed" && !result.duplicateNotification, result };
  }

  if (!SUPPORTED_PAYMENT_EVENTS.has(event.type)) {
    return { received: true, processed: false, reason: "unsupported_event_type" };
  }

  if (session.payment_status !== "paid") {
    return { received: true, processed: false, reason: "payment_not_completed" };
  }
  if (typeof session.metadata?.purchase_id !== "string" || !session.metadata.purchase_id) {
    throw new PurchaseServiceError("MISSING_PURCHASE_REFERENCE", "Stripe session is missing purchase_id metadata");
  }
  if (!Number.isSafeInteger(session.amount_total) || session.amount_total <= 0) {
    throw new PurchaseServiceError("INVALID_STRIPE_AMOUNT", "Stripe session amount_total is invalid");
  }
  if (session.currency !== "eur") {
    throw new PurchaseServiceError("CURRENCY_MISMATCH", "Only EUR Stripe sessions are supported");
  }
  if (typeof session.id !== "string" || !session.id.startsWith("cs_")) {
    throw new PurchaseServiceError("INVALID_STRIPE_SESSION", "Stripe Checkout Session ID is invalid");
  }

  const result = await recordVerifiedPayment({
    pool,
    purchaseId: session.metadata.purchase_id,
    paymentProvider: "stripe",
    providerPaymentId: session.id,
    amountCents: session.amount_total,
    currency: "EUR",
    providerEventId: event.id,
    providerEventType: event.type
  });
  return { received: true, processed: result.status !== "duplicate_event", result };
}

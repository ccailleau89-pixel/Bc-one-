import { recordVerifiedPayment, PurchaseServiceError } from "./purchase-service.js";

const SUPPORTED_PAYMENT_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded"
]);

/**
 * Handle an event only after Stripe's SDK has verified its signature against
 * the exact raw request body. This function does not create checkout sessions.
 *
 * The pending purchase must already contain payment_provider='stripe' and
 * provider_payment_id equal to the Checkout Session ID returned by Stripe.
 */
export async function processVerifiedStripeEvent({ pool, event }) {
  if (!event || typeof event.id !== "string" || typeof event.type !== "string" || !event.data?.object) {
    throw new PurchaseServiceError("INVALID_STRIPE_EVENT", "Stripe event payload is invalid");
  }

  if (!SUPPORTED_PAYMENT_EVENTS.has(event.type)) {
    return { received: true, processed: false, reason: "unsupported_event_type" };
  }

  const session = event.data.object;
  if (event.type === "checkout.session.completed" && session.payment_status !== "paid") {
    // For delayed payment methods, wait for checkout.session.async_payment_succeeded.
    return { received: true, processed: false, reason: "payment_not_completed" };
  }
  if (event.type === "checkout.session.async_payment_succeeded" && session.payment_status !== "paid") {
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

/**
 * BC ONE partner-purchase commission calculation.
 * Money is represented as integer euro cents; commission rate is basis points.
 * This module calculates accounting splits only. It does not collect payments.
 */
export const BASIS_POINTS = 10_000;
export const DEFAULT_COMMISSION_BPS = 200; // 2.00%

export class CommissionError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "CommissionError";
    this.code = code;
  }
}

export function calculateCommission({ grossCents, commissionBps = DEFAULT_COMMISSION_BPS }) {
  if (!Number.isSafeInteger(grossCents) || grossCents <= 0) {
    throw new CommissionError("INVALID_GROSS_AMOUNT", "Gross amount must be positive integer cents");
  }
  if (!Number.isSafeInteger(commissionBps) || commissionBps < 0 || commissionBps > BASIS_POINTS) {
    throw new CommissionError("INVALID_COMMISSION_RATE", "Commission rate must be between 0% and 100%");
  }

  // Floor to the nearest cent, ensuring merchantNet + platformCommission = gross.
  const platformCommissionCents = Math.floor((grossCents * commissionBps) / BASIS_POINTS);
  if (!Number.isSafeInteger(platformCommissionCents)) {
    throw new CommissionError("AMOUNT_OVERFLOW", "Amount exceeds safe calculation range");
  }

  return {
    grossCents,
    commissionBps,
    platformCommissionCents,
    merchantNetCents: grossCents - platformCommissionCents
  };
}

/**
 * Calculate a refund's commission reversal. A full refund reverses the exact
 * original commission; partial refunds use proportional floor rounding.
 * Callers must enforce cumulative refunds <= original gross transaction.
 */
export function calculateCommissionReversal({ originalGrossCents, originalCommissionCents, refundCents }) {
  if (!Number.isSafeInteger(originalGrossCents) || originalGrossCents <= 0 ||
      !Number.isSafeInteger(originalCommissionCents) || originalCommissionCents < 0 ||
      originalCommissionCents > originalGrossCents ||
      !Number.isSafeInteger(refundCents) || refundCents <= 0 || refundCents > originalGrossCents) {
    throw new CommissionError("INVALID_REFUND", "Refund values are invalid");
  }
  const commissionReversalCents = refundCents === originalGrossCents
    ? originalCommissionCents
    : Math.floor((originalCommissionCents * refundCents) / originalGrossCents);
  return {
    refundCents,
    commissionReversalCents,
    merchantRefundCents: refundCents - commissionReversalCents
  };
}

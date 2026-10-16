import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateCommission,
  calculateCommissionReversal,
  CommissionError
} from "./commission.js";

test("default commission is exactly 2% for a €100 purchase", () => {
  assert.deepEqual(calculateCommission({ grossCents: 10_000 }), {
    grossCents: 10_000,
    commissionBps: 200,
    platformCommissionCents: 200,
    merchantNetCents: 9_800
  });
});

test("cent rounding is deterministic and split always balances", () => {
  const result = calculateCommission({ grossCents: 999, commissionBps: 200 });
  assert.equal(result.platformCommissionCents, 19);
  assert.equal(result.merchantNetCents, 980);
  assert.equal(result.platformCommissionCents + result.merchantNetCents, result.grossCents);
});

test("zero commission is valid and full commission is capped at gross", () => {
  assert.equal(calculateCommission({ grossCents: 500, commissionBps: 0 }).platformCommissionCents, 0);
  assert.equal(calculateCommission({ grossCents: 500, commissionBps: 10_000 }).platformCommissionCents, 500);
});

test("rejects floating-point, zero and negative amounts", () => {
  for (const grossCents of [0, -1, 1.5, NaN, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => calculateCommission({ grossCents }), CommissionError);
  }
});

test("rejects invalid commission rates", () => {
  for (const commissionBps of [-1, 10_001, 2.5, NaN]) {
    assert.throws(() => calculateCommission({ grossCents: 1000, commissionBps }), CommissionError);
  }
});

test("full refund reverses exact original commission", () => {
  assert.deepEqual(calculateCommissionReversal({
    originalGrossCents: 999,
    originalCommissionCents: 19,
    refundCents: 999
  }), {
    refundCents: 999,
    commissionReversalCents: 19,
    merchantRefundCents: 980
  });
});

test("partial refund reverses a proportional commission", () => {
  const result = calculateCommissionReversal({
    originalGrossCents: 10_000,
    originalCommissionCents: 200,
    refundCents: 2_500
  });
  assert.deepEqual(result, {
    refundCents: 2_500,
    commissionReversalCents: 50,
    merchantRefundCents: 2_450
  });
});

test("rejects invalid refund values", () => {
  assert.throws(() => calculateCommissionReversal({
    originalGrossCents: 1000, originalCommissionCents: 20, refundCents: 1001
  }), CommissionError);
});

test("property check: commission split conserves every tested cent amount", () => {
  for (let grossCents = 1; grossCents <= 20_000; grossCents += 37) {
    for (const commissionBps of [0, 1, 25, 100, 200, 333, 999, 5000, 9999, 10_000]) {
      const result = calculateCommission({ grossCents, commissionBps });
      assert.equal(result.platformCommissionCents + result.merchantNetCents, grossCents);
      assert.ok(result.platformCommissionCents >= 0);
      assert.ok(result.merchantNetCents >= 0);
      assert.ok(result.platformCommissionCents <= grossCents);
    }
  }
});

test("commission is monotonic and uses floor-to-cent rounding", () => {
  let previous = 0;
  for (let grossCents = 1; grossCents <= 100_000; grossCents += 1) {
    const commission = calculateCommission({ grossCents }).platformCommissionCents;
    assert.ok(commission >= previous);
    assert.equal(commission, Math.floor((grossCents * 200) / 10_000));
    previous = commission;
  }
});

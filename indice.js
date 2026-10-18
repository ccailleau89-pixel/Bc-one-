// BC ONE community health index — browser copy of token_index/community_index.py.
// An explanatory 0..200 indicator. NOT a token price, quote, value in euros or signal.
export const WEIGHTS = Object.freeze({ users: 0.25, active: 0.30, retention: 0.20, merchants: 0.15, transactions: 0.10 });
export const BASELINE = Object.freeze({ users: 1000, active: 300, merchants: 20, transactions: 500 });

function count(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(`${name} must be a non-negative integer`);
  return value;
}
const saturation = (value, baseline) => Math.min(2, Math.log1p(value) / Math.log1p(baseline));
const round2 = (value) => Math.round(value * 100) / 100;

export function communityIndex({ users, active, retained, merchants, transactions }) {
  count(users, "users"); count(active, "active"); count(retained, "retained");
  count(merchants, "merchants"); count(transactions, "transactions");
  if (active > users) throw new RangeError("active users cannot exceed verified users");
  if (retained > active) throw new RangeError("retained users cannot exceed active users");
  const retention = active ? retained / active : 0;
  const score = 100 * (
    WEIGHTS.users * saturation(users, BASELINE.users) +
    WEIGHTS.active * saturation(active, BASELINE.active) +
    WEIGHTS.retention * Math.min(2, retention / 0.5) +
    WEIGHTS.merchants * saturation(merchants, BASELINE.merchants) +
    WEIGHTS.transactions * saturation(transactions, BASELINE.transactions));
  return round2(Math.min(200, Math.max(0, score)));
}

export function smoothedIndex(current, previous, alpha = 0.25, maxChange = 10) {
  if (!Number.isFinite(current) || current < 0 || current > 200) throw new RangeError("current index outside 0..200");
  if (previous === null || previous === undefined) return round2(current);
  if (!Number.isFinite(previous) || previous < 0 || previous > 200) throw new RangeError("previous index outside 0..200");
  const target = previous + alpha * (current - previous);
  return round2(Math.max(0, Math.min(200, previous + maxChange, Math.max(previous - maxChange, target))));
}

import test from "node:test";
import assert from "node:assert/strict";
import { communityIndex, smoothedIndex } from "../indice.js";

// Reference values computed with token_index/community_index.py (the source of truth).
const cases = [
  [[1000, 300, 150, 20, 500], 100],
  [[0, 0, 0, 0, 0], 0],
  [[1000, 0, 0, 20, 500], 50],
  [[250, 80, 20, 5, 60], 68.53],
  [[5000, 2000, 1500, 60, 3000], 133.91],
  [[1e9, 1e9, 1e9, 1e9, 1e9], 200]
];

test("browser index matches the Python reference implementation", () => {
  for (const [[users, active, retained, merchants, transactions], expected] of cases) {
    assert.equal(communityIndex({ users, active, retained, merchants, transactions }), expected);
  }
});

test("browser smoothing matches the Python reference and is capped at ±10", () => {
  assert.equal(smoothedIndex(130, 100), 107.5);
  assert.equal(smoothedIndex(60, 100), 90);
  assert.equal(smoothedIndex(102, 100), 100.5);
  assert.equal(smoothedIndex(80, null), 80);
});

test("browser index rejects impossible inputs", () => {
  assert.throws(() => communityIndex({ users: 10, active: 20, retained: 0, merchants: 1, transactions: 1 }));
  assert.throws(() => communityIndex({ users: 10, active: 5, retained: 6, merchants: 1, transactions: 1 }));
  assert.throws(() => communityIndex({ users: -1, active: 0, retained: 0, merchants: 0, transactions: 0 }));
  assert.throws(() => communityIndex({ users: 1.5, active: 0, retained: 0, merchants: 0, transactions: 0 }));
});

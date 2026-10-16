import test from "node:test";
import assert from "node:assert/strict";
import { createBurgerIdAdapter } from "./burger-id.js";
function mockSupabase(rows = []) {
  const calls = [];
  const auth = {
    signUp: async (payload) => (calls.push(["signUp", payload]), { data: { user: { id: "user-test" } }, error: null }),
    signInWithPassword: async (payload) => (calls.push(["signInWithPassword", payload]), { data: { session: { access_token: "test-only" } }, error: null }),
    signOut: async () => (calls.push(["signOut"]), { error: null }),
    resetPasswordForEmail: async (...args) => (calls.push(["resetPasswordForEmail", ...args]), { error: null }),
    getSession: async () => (calls.push(["getSession"]), { data: { session: null }, error: null }),
    onAuthStateChange: (callback) => (calls.push(["onAuthStateChange", callback]), { data: { subscription: { unsubscribe() {} } } })
  };
  const client = { auth, from: table => ({ select: fields => ({ order: async (field, options) => {
    calls.push(["select", table, fields, field, options]); return { data: rows, error: null };
  }})}) };
  return { client, calls };
}
test("Burger ID adapter requires an authenticated client", () => {
  assert.throws(() => createBurgerIdAdapter(), /configured Supabase client/);
  assert.throws(() => createBurgerIdAdapter({}), /configured Supabase client/);
});
test("Burger ID adapter normalizes email and forwards sign-up redirect", async () => {
  const { client, calls } = mockSupabase();
  await createBurgerIdAdapter(client).signUp({ email: "  TEST@example.com ", password: "test-password", redirectTo: "https://example.test/auth/callback" });
  assert.deepEqual(calls[0], ["signUp", { email: "test@example.com", password: "test-password", options: { emailRedirectTo: "https://example.test/auth/callback" } }]);
});
test("Burger ID adapter supports sign-in, sign-out, reset, session and auth changes", async () => {
  const { client, calls } = mockSupabase(); const adapter = createBurgerIdAdapter(client);
  await adapter.signIn({ email: "PLAYER@example.com", password: "test-password" }); await adapter.signOut();
  await adapter.requestPasswordReset({ email: "PLAYER@example.com", redirectTo: "https://example.test/reset" }); await adapter.getSession();
  const callback = () => {}; adapter.onAuthStateChange(callback);
  assert.equal(calls[0][0], "signInWithPassword"); assert.equal(calls[0][1].email, "player@example.com");
  assert.equal(calls[1][0], "signOut");
  assert.deepEqual(calls[2], ["resetPasswordForEmail", "player@example.com", { redirectTo: "https://example.test/reset" }]);
  assert.equal(calls[3][0], "getSession"); assert.equal(calls[4][0], "onAuthStateChange"); assert.equal(calls[4][1], callback);
});
test("demo wallet calculates balance from the user's ledger rows", async () => {
  const { client, calls } = mockSupabase([
    { amount: 100, entry_type: "credit", reason: "welcome_bonus", created_at: "2026-10-16T12:00:00Z" },
    { amount: 15, entry_type: "debit", reason: "welcome_bonus", created_at: "2026-10-16T13:00:00Z" }
  ]);
  const result = await createBurgerIdAdapter(client).getDemoWallet();
  assert.equal(result.error, null); assert.equal(result.data.balance, 85); assert.equal(result.data.entries.length, 2);
  assert.deepEqual(calls[0], ["select", "bc_one_demo_ledger", "amount, entry_type, reason, created_at", "created_at", { ascending: false }]);
});
test("Burger ID adapter rejects missing inputs and invalid auth callbacks", async () => {
  const adapter = createBurgerIdAdapter(mockSupabase().client);
  await assert.rejects(adapter.signIn({ email: " ", password: "x" }), /email is required/);
  await assert.rejects(adapter.signUp({ email: "x@example.com", password: "" }), /password is required/);
  await assert.rejects(adapter.requestPasswordReset({ email: "" }), /email is required/);
  assert.throws(() => adapter.onAuthStateChange(null), /callback must be a function/);
});

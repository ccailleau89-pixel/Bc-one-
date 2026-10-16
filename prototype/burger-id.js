/**
 * Shared Burger ID adapter for BC ONE and Burger Crush.
 * Welcome credits are internal test credits only: non-transferable and unrelated
 * to any deployed ERC-20 token or real-money value.
 */
export function createBurgerIdAdapter(supabase) {
  if (!supabase?.auth) throw new TypeError("A configured Supabase client is required");
  return Object.freeze({
    async signUp({ email, password, redirectTo } = {}) {
      requireText(email, "email"); requireText(password, "password");
      return supabase.auth.signUp({ email: email.trim().toLowerCase(), password,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined });
    },
    async signIn({ email, password } = {}) {
      requireText(email, "email"); requireText(password, "password");
      return supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    },
    async signOut() { return supabase.auth.signOut(); },
    async requestPasswordReset({ email, redirectTo } = {}) {
      requireText(email, "email");
      return supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
    },
    async getSession() { return supabase.auth.getSession(); },
    async getDemoWallet() {
      if (typeof supabase.from !== "function") throw new TypeError("Supabase table access is required to read the demo wallet");
      // RLS limits reads to the authenticated user's own ledger; browser clients cannot write credits.
      const { data, error } = await supabase.from("bc_one_demo_ledger")
        .select("amount, entry_type, reason, created_at")
        .order("created_at", { ascending: false });
      if (error) return { data: null, error };
      const entries = Array.isArray(data) ? data : [];
      const balance = entries.reduce((total, row) => {
        const amount = Number(row.amount);
        if (!Number.isSafeInteger(amount)) return total;
        return total + (row.entry_type === "debit" ? -Math.abs(amount) : Math.abs(amount));
      }, 0);
      return { data: { balance: Math.max(0, balance), entries }, error: null };
    },
    onAuthStateChange(callback) {
      if (typeof callback !== "function") throw new TypeError("callback must be a function");
      return supabase.auth.onAuthStateChange(callback);
    }
  });
}
function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${field} is required`);
}

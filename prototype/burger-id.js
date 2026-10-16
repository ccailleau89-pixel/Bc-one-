/**
 * Shared Burger ID adapter for BC ONE and Burger Crush.
 *
 * Pass a configured Supabase client from the host application. This module
 * deliberately contains no project URL, API key, password, or service-role key.
 * It does not persist game scores or credit BC ONE balances.
 *
 * This is an integration scaffold: the current static prototype does not yet
 * initialize a Supabase client or wire these methods into its UI.
 */
export function createBurgerIdAdapter(supabase) {
  if (!supabase?.auth) {
    throw new TypeError("A configured Supabase client is required");
  }

  return Object.freeze({
    async signUp({ email, password, redirectTo } = {}) {
      requireText(email, "email");
      requireText(password, "password");
      return supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined
      });
    },

    async signIn({ email, password } = {}) {
      requireText(email, "email");
      requireText(password, "password");
      return supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
    },

    async signOut() {
      return supabase.auth.signOut();
    },

    async requestPasswordReset({ email, redirectTo } = {}) {
      requireText(email, "email");
      return supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo
      });
    },

    async getSession() {
      return supabase.auth.getSession();
    },

    onAuthStateChange(callback) {
      if (typeof callback !== "function") {
        throw new TypeError("callback must be a function");
      }
      return supabase.auth.onAuthStateChange(callback);
    }
  });
}

function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} is required`);
  }
}

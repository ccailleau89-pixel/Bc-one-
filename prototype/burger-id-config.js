/**
 * Public frontend configuration. Vite injects these values at build time from
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the root .env file.
 * Never use a service_role key in the browser.
 */
const env = import.meta.env ?? {};
export const burgerIdConfig = Object.freeze({
  supabaseUrl: env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY ?? ""
});

import { createClient } from "@supabase/supabase-js";
import { createBurgerIdAdapter } from "./burger-id.js";
import { burgerIdConfig } from "./burger-id-config.js";

const $ = (id) => document.getElementById(id);
const dialog = $("burgerIdDialog"), form = $("burgerIdForm");
const emailInput = $("burgerIdEmail"), passwordInput = $("burgerIdPassword");
const status = $("burgerIdStatus"), submit = $("burgerIdSubmit"), modeSelect = $("burgerIdMode");
const openButton = $("burgerIdOpen"), userName = $("memberName"), userLabel = $("memberLabel");
let adapter = null, configured = false, walletRequest = 0;

function showStatus(text, isError = false) {
  status.textContent = text;
  status.style.color = isError ? "var(--danger)" : "var(--green)";
}
function setBusy(busy) { submit.disabled = busy; submit.textContent = busy ? "Patientez…" : actionLabel(modeSelect.value); }
function actionLabel(mode) { return mode === "signup" ? "Créer mon Burger ID" : mode === "reset" ? "Envoyer le lien" : "Se connecter"; }
function renderMode() {
  const mode = modeSelect.value;
  passwordInput.hidden = mode === "reset"; passwordInput.required = mode !== "reset";
  submit.textContent = actionLabel(mode);
  showStatus(configured
    ? "Un seul Burger ID pour BC ONE et Burger Crush. Toute nouvelle inscription reçoit 100 crédits BC ONE d’essai, non transférables et sans valeur monétaire."
    : "Configuration requise : ajoutez l’URL Supabase et la clé publique dans burger-id-config.js.");
}
function publishWallet(authenticated, balance = 0, entries = []) {
  window.dispatchEvent(new CustomEvent("burger-id-wallet", { detail: { authenticated, balance, entries } }));
}
async function syncWallet(user) {
  const request = ++walletRequest;
  if (!user) { publishWallet(false); return; }
  if (!adapter) return;
  try {
    const result = await adapter.getDemoWallet();
    if (request !== walletRequest) return;
    if (result.error) {
      publishWallet(true, 0, []);
      showStatus("Compte connecté, mais crédits indisponibles. Vérifiez que la migration Supabase a été appliquée.", true);
      return;
    }
    publishWallet(true, result.data.balance, result.data.entries);
  } catch {
    if (request !== walletRequest) return;
    publishWallet(true, 0, []);
    showStatus("Impossible de charger les crédits d’essai. Vérifiez la configuration Supabase.", true);
  }
}
function updateMember(user) {
  if (user && typeof user.email === "string") {
    userName.textContent = user.email.split("@")[0].slice(0, 24) || "Membre";
    userLabel.textContent = "Burger ID connecté";
    openButton.textContent = "Mon compte"; openButton.setAttribute("aria-label", "Gérer mon Burger ID");
    openButton.dataset.signedIn = "true"; void syncWallet(user);
  } else {
    userName.textContent = "Alex Martin"; userLabel.textContent = "Mode démonstration";
    openButton.textContent = "Connexion"; openButton.setAttribute("aria-label", "Se connecter avec Burger ID");
    openButton.dataset.signedIn = "false"; void syncWallet(null);
  }
}

if (typeof burgerIdConfig.supabaseUrl === "string" &&
    /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(burgerIdConfig.supabaseUrl) &&
    typeof burgerIdConfig.supabaseAnonKey === "string" && burgerIdConfig.supabaseAnonKey.trim().length > 20) {
  try {
    const supabase = createClient(burgerIdConfig.supabaseUrl.replace(/\/$/, ""), burgerIdConfig.supabaseAnonKey, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
    });
    adapter = createBurgerIdAdapter(supabase); configured = true;
    adapter.getSession().then(({ data, error }) => { if (!error) updateMember(data?.session?.user ?? null); })
      .catch(() => showStatus("Impossible de vérifier la session. Réessayez.", true));
    adapter.onAuthStateChange((_event, session) => updateMember(session?.user ?? null));
  } catch { showStatus("Configuration Burger ID invalide. Vérifiez les paramètres Supabase.", true); }
}

openButton.addEventListener("click", () => { renderMode(); dialog.showModal(); });
$("burgerIdClose").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
modeSelect.addEventListener("change", renderMode);
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!configured || !adapter) { showStatus("Burger ID n’est pas encore activé. Configurez le projet Supabase d’abord.", true); return; }
  const email = emailInput.value.trim(), password = passwordInput.value, mode = modeSelect.value;
  setBusy(true);
  try {
    let result;
    if (mode === "signup") {
      result = await adapter.signUp({ email, password, redirectTo: window.location.origin + window.location.pathname });
      if (!result.error) {
        if (result.data?.session) {
          updateMember(result.data?.user ?? result.data?.session?.user ?? null);
          showStatus("Compte créé ! 100 crédits BC ONE d’essai sont attribués une seule fois. Ils ne sont pas une cryptomonnaie et ne sont pas transférables.");
        } else {
          showStatus("Compte créé. Confirmez votre e-mail puis connectez-vous : vos 100 crédits BC ONE d’essai seront visibles après connexion.");
        }
      }
    } else if (mode === "reset") {
      result = await adapter.requestPasswordReset({ email, redirectTo: window.location.origin + window.location.pathname });
      if (!result.error) showStatus("Si cette adresse correspond à un compte, un lien de récupération sera envoyé.");
    } else {
      result = await adapter.signIn({ email, password });
      if (!result.error) {
        updateMember(result.data?.user ?? result.data?.session?.user ?? null);
        showStatus("Connexion réussie. Chargement de vos crédits BC ONE d’essai…");
        window.setTimeout(() => { if (dialog.open) dialog.close(); }, 650);
      }
    }
    if (result?.error) showStatus("Action impossible. Vérifiez les informations et les réglages d’authentification.", true);
  } catch { showStatus("Erreur de connexion. Réessayez dans quelques instants.", true); }
  finally { setBusy(false); }
});
$("burgerIdSignOut").addEventListener("click", async () => {
  if (!configured || !adapter) { showStatus("Configuration Supabase requise avant toute connexion réelle.", true); return; }
  try {
    const { error } = await adapter.signOut();
    if (error) showStatus("Déconnexion impossible. Réessayez.", true);
    else { updateMember(null); showStatus("Déconnecté du Burger ID."); }
  } catch { showStatus("Déconnexion impossible. Réessayez.", true); }
});
renderMode();

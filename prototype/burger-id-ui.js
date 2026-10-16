import { createClient } from "@supabase/supabase-js";
import { createBurgerIdAdapter } from "./burger-id.js";
import { burgerIdConfig } from "./burger-id-config.js";

const $ = (id) => document.getElementById(id);
const dialog = $("burgerIdDialog");
const form = $("burgerIdForm");
const emailInput = $("burgerIdEmail");
const passwordInput = $("burgerIdPassword");
const status = $("burgerIdStatus");
const submit = $("burgerIdSubmit");
const modeSelect = $("burgerIdMode");
const openButton = $("burgerIdOpen");
const userName = $("memberName");
const userLabel = $("memberLabel");
let adapter = null;
let configured = false;

function showStatus(text, isError = false) {
  status.textContent = text;
  status.style.color = isError ? "var(--danger)" : "var(--green)";
}
function setBusy(busy) {
  submit.disabled = busy;
  submit.textContent = busy ? "Patientez…" : actionLabel(modeSelect.value);
}
function actionLabel(mode) {
  return mode === "signup" ? "Créer mon Burger ID" : mode === "reset" ? "Envoyer le lien" : "Se connecter";
}
function renderMode() {
  const mode = modeSelect.value;
  passwordInput.hidden = mode === "reset";
  passwordInput.required = mode !== "reset";
  submit.textContent = actionLabel(mode);
  showStatus(configured ? "Un même compte pour BC ONE et Burger Crush." :
    "Configuration requise : ajoutez l’URL Supabase et la clé publique dans burger-id-config.js.");
}
function updateMember(user) {
  if (user && typeof user.email === "string") {
    const label = user.email.split("@")[0].slice(0, 24) || "Membre";
    userName.textContent = label;
    userLabel.textContent = "Burger ID connecté";
    openButton.textContent = "Mon compte";
    openButton.setAttribute("aria-label", "Gérer mon Burger ID");
    openButton.dataset.signedIn = "true";
  } else {
    userName.textContent = "Alex Martin";
    userLabel.textContent = "Mode démonstration";
    openButton.textContent = "Connexion";
    openButton.setAttribute("aria-label", "Se connecter avec Burger ID");
    openButton.dataset.signedIn = "false";
  }
}

if (typeof burgerIdConfig.supabaseUrl === "string" &&
    /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(burgerIdConfig.supabaseUrl) &&
    typeof burgerIdConfig.supabaseAnonKey === "string" &&
    burgerIdConfig.supabaseAnonKey.trim().length > 20) {
  try {
    const supabase = createClient(burgerIdConfig.supabaseUrl.replace(/\/$/, ""), burgerIdConfig.supabaseAnonKey, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
    });
    adapter = createBurgerIdAdapter(supabase);
    configured = true;
    adapter.getSession().then(({ data, error }) => {
      if (!error) updateMember(data?.session?.user ?? null);
    }).catch(() => showStatus("Impossible de vérifier la session. Réessayez.", true));
    adapter.onAuthStateChange((_event, session) => updateMember(session?.user ?? null));
  } catch {
    showStatus("Configuration Burger ID invalide. Vérifiez les paramètres Supabase.", true);
  }
}

openButton.addEventListener("click", () => {
  renderMode();
  dialog.showModal();
});
$("burgerIdClose").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
modeSelect.addEventListener("change", renderMode);
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!configured || !adapter) {
    showStatus("Burger ID n’est pas encore activé. Configurez le projet Supabase d’abord.", true);
    return;
  }
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const mode = modeSelect.value;
  setBusy(true);
  try {
    let result;
    if (mode === "signup") {
      result = await adapter.signUp({ email, password, redirectTo: window.location.origin + window.location.pathname });
      if (!result.error) showStatus(result.data?.session ? "Compte créé et connecté." : "Compte créé. Vérifiez votre e-mail pour confirmer l’inscription.");
    } else if (mode === "reset") {
      result = await adapter.requestPasswordReset({ email, redirectTo: window.location.origin + window.location.pathname });
      if (!result.error) showStatus("Si cette adresse correspond à un compte, un lien de récupération sera envoyé.");
    } else {
      result = await adapter.signIn({ email, password });
      if (!result.error) {
        showStatus("Connexion réussie. Votre Burger ID est prêt.");
        updateMember(result.data?.user ?? result.data?.session?.user ?? null);
        window.setTimeout(() => { if (dialog.open) dialog.close(); }, 650);
      }
    }
    if (result?.error) showStatus("Action impossible. Vérifiez les informations et les réglages d’authentification.", true);
  } catch {
    showStatus("Erreur de connexion. Réessayez dans quelques instants.", true);
  } finally {
    setBusy(false);
  }
});
$("burgerIdSignOut").addEventListener("click", async () => {
  if (!configured || !adapter) {
    showStatus("Configuration Supabase requise avant toute connexion réelle.", true);
    return;
  }
  try {
    const { error } = await adapter.signOut();
    if (error) showStatus("Déconnexion impossible. Réessayez.", true);
    else {
      updateMember(null);
      showStatus("Déconnecté du Burger ID.");
    }
  } catch {
    showStatus("Déconnexion impossible. Réessayez.", true);
  }
});
renderMode();

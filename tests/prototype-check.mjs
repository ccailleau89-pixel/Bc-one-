import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const checks = [
  ["French document language", /<html lang="fr">/.test(html)],
  ["responsive viewport", /name="viewport"/.test(html)],
  ["dashboard section", /id="dashboard"/.test(html)],
  ["wallet preparation state", /Aucun portefeuille connecté/.test(html)],
  ["wallet signing unavailable", /ne permet pas de signer de transaction/.test(html)],
  ["market data not fabricated", /Aucune cotation revendiquée/.test(html)],
  ["project section", /id="project"/.test(html)],
  ["guided test journey", /Votre parcours de test/.test(html)],
  ["offline index action", /href="currency-index\.html"/.test(html)],
  ["test token explicitly undeployed", /Contrat plafonné en revue; il n’est déployé sur aucun réseau/.test(html)],
  ["network decision remains open", /Choix du réseau, plafond final et gouvernance à définir/.test(html)],
  ["index is separate from token issuance", /L’indice ne pilote pas la création de jetons/.test(html)],
  ["algorithm simulation link", /href="crypto-algo\.html"/.test(html)],
  ["mobile layout breakpoint", /@media\s*\(max-width:\s*620px\)/.test(html)],
  ["keyboard-operable navigation buttons", /<button type="button" data-page=/.test(html)],
];
for (const [name, passed] of checks) {
  assert.equal(passed, true, name);
  console.log("PASS", name);
}

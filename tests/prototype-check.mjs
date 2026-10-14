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
  ["mobile layout breakpoint", /@media\s*\(max-width:\s*620px\)/.test(html)],
  ["keyboard-operable navigation buttons", /<button type="button" data-page=/.test(html)],
];
for (const [name, passed] of checks) {
  assert.equal(passed, true, name);
  console.log("PASS", name);
}

import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../prototype.html", import.meta.url), "utf8");

assert.match(html, /<!DOCTYPE html>/i, "DOCTYPE must be present");
assert.match(html, /<html lang="fr">/i, "document language must be French");
assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/i, "responsive viewport must be present");
assert.match(html, /<title>BC ONE — Prototype de l'application<\/title>/, "prototype title must be present");
assert.match(html, /id="portefeuille"/, "wallet section must exist");
assert.match(html, /id="avantages"/, "benefits section must exist");
assert.match(html, /id="projet"/, "project section must exist");
assert.match(html, /aucune fonctionnalité financière active/i, "financial status notice must be present");
assert.match(html, /Aucun jeton n'est déclaré comme émis ou déployé/i, "token status must be transparent");
assert.doesNotMatch(html, /<form\b/i, "prototype must not collect user data");
assert.doesNotMatch(html, /https?:\/\//i, "prototype must not make external network calls");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, "HTML IDs must be unique");

const hrefs = [...html.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
for (const href of hrefs) {
  assert.ok(ids.includes(href), `anchor #${href} must point to an existing ID`);
}

console.log("BC ONE prototype checks passed.");
console.log(`Checked ${ids.length} unique IDs and ${hrefs.length} in-page anchors.`);

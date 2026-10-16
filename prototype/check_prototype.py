#!/usr/bin/env python3
"""Static checks for the BC ONE demo page. No browser or network required."""
from html.parser import HTMLParser
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

HTML_FILE = Path(__file__).with_name("index.html")


class PageInspector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.anchors = []
        self.script_sources = []
        self.text_parts = []
        self.scripts = []
        self.in_script = False
        self.current_script = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "a" and attrs.get("href", "").startswith("#"):
            self.anchors.append(attrs["href"][1:])
        if tag == "script":
            if attrs.get("src"):
                self.script_sources.append(attrs["src"])
            self.in_script = True
            self.current_script = []

    def handle_endtag(self, tag):
        if tag == "script" and self.in_script:
            self.scripts.append("".join(self.current_script))
            self.in_script = False
            self.current_script = []

    def handle_data(self, data):
        self.text_parts.append(data)
        if self.in_script:
            self.current_script.append(data)


def main():
    if not HTML_FILE.exists():
        raise SystemExit(f"FAIL: missing {HTML_FILE}")
    source = HTML_FILE.read_text(encoding="utf-8")
    page = PageInspector()
    page.feed(source)
    errors = []

    duplicates = sorted({item for item in page.ids if page.ids.count(item) > 1})
    if duplicates:
        errors.append("duplicate element IDs: " + ", ".join(duplicates))

    missing_targets = sorted(set(page.anchors) - set(page.ids))
    if missing_targets:
        errors.append("navigation targets missing: " + ", ".join(missing_targets))

    if page.script_sources:
        errors.append("external JavaScript is not allowed in this offline demo: " +
                      ", ".join(page.script_sources))

    required_ids = {
        "accueil", "portefeuille", "profil", "avantages", "activite",
        "burger-crush", "transferDialog", "transferForm", "balance",
        "txcount", "reset", "openTransfer", "exportActivity",
        "openCrush", "crushDialog", "crushTap", "crushScore",
    }
    missing_ids = sorted(required_ids - set(page.ids))
    if missing_ids:
        errors.append("required interface elements missing: " + ", ".join(missing_ids))

    required_copy = [
        "Prototype uniquement",
        "Aucun token",
        "transfert réel",
        "Connexion réelle non activée",
        "Points Crush ≠ BCONE",
    ]
    for phrase in required_copy:
        if phrase.casefold() not in source.casefold():
            errors.append(f"required demo/safety notice missing: {phrase}")

    for marker in [
        'type="number"',
        'min="1"',
        'aria-live="polite"',
        "Number.isSafeInteger(n)",
        "n>balance",
        "Réinitialiser ↺",
        "localStorage",
        "bc-one-activite-demo.csv",
        "Stockage local indisponible",
        "crushRound>=10",
    ]:
        if marker not in source:
            errors.append(f"expected validation/accessibility marker missing: {marker}")

    # Node.js is available on GitHub-hosted Ubuntu runners. Locally, this
    # check is optional so the static checker remains usable without Node.
    if shutil.which("node"):
        for index, script in enumerate(page.scripts, start=1):
            if not script.strip():
                continue
            with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as tmp:
                tmp.write(script)
                js_path = tmp.name
            result = subprocess.run(["node", "--check", js_path], capture_output=True, text=True)
            Path(js_path).unlink(missing_ok=True)
            if result.returncode:
                errors.append(f"inline JavaScript block {index} has a syntax error: " + result.stderr.strip())
    else:
        print("NOTE: JavaScript syntax check skipped (Node.js is not installed).")

    if errors:
        print("BC ONE prototype checks FAILED")
        for error in errors:
            print(f"- {error}")
        return 1

    print("BC ONE prototype checks passed")
    print(f"- {len(page.ids)} IDs checked; no duplicates")
    print(f"- {len(page.anchors)} in-page navigation links resolve")
    print("- safety copy, offline scripts, form validation, local demo persistence, CSV export and accessibility markers checked")
    if shutil.which("node"):
        print(f"- {len(page.scripts)} inline JavaScript block(s) syntax-checked with Node.js")
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Static checks for the BC ONE demo page. No browser or network required."""
from html.parser import HTMLParser
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import re

HTML_FILE = Path(__file__).with_name("index.html")
BURGER_ID_MIGRATION = HTML_FILE.parents[1] / "supabase/migrations/202610160001_burger_id_profiles.sql"
WELCOME_CREDITS_MIGRATION = HTML_FILE.parents[1] / "supabase/migrations/202610160002_bc_one_welcome_test_credits.sql"
JOURNEY_FILE = HTML_FILE.with_name("user-journey.html")


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

    # Only repository-local scripts are allowed. The frontend build bundles
    # dependencies locally; the page must not load executable code from URLs.
    for script_source in page.script_sources:
        if script_source.startswith(("//", "http://", "https://")):
            errors.append("remote JavaScript is not allowed: " + script_source)
            continue
        local_script = (HTML_FILE.parent / script_source.split("?", 1)[0]).resolve()
        try:
            local_script.relative_to(HTML_FILE.parent.resolve())
        except ValueError:
            errors.append("script path escapes prototype directory: " + script_source)
            continue
        if not local_script.is_file():
            errors.append("local script file is missing: " + script_source)

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

    # The Burger ID schema must keep game and membership records private and
    # prevent browser-side score or balance manipulation.
    if not BURGER_ID_MIGRATION.is_file():
        errors.append("Burger ID RLS migration is missing")
    else:
        migration = BURGER_ID_MIGRATION.read_text(encoding="utf-8")
        required_sql = [
            "alter table public.burger_id_profiles enable row level security",
            "alter table public.burger_crush_profiles enable row level security",
            "alter table public.bc_one_member_profiles enable row level security",
            'create policy "read own Burger Crush profile"',
            'create policy "read own BC ONE member profile"',
            "security definer",
            "set search_path = ''",
            "after insert on auth.users",
        ]
        for marker in required_sql:
            if marker.casefold() not in migration.casefold():
                errors.append("Burger ID migration missing security marker: " + marker)
        if re.search(r"grant\s+(?:insert|update|delete|all)\b[^;]*burger_crush_profiles", migration, re.I | re.S):
            errors.append("browser clients must not write Burger Crush scores")
        if re.search(r"grant\s+(?:insert|update|delete|all)\b[^;]*bc_one_member_profiles", migration, re.I | re.S):
            errors.append("browser clients must not write BC ONE membership records")

    # The welcome bonus must be server-created, idempotent and read-only for browser clients.
    if not WELCOME_CREDITS_MIGRATION.is_file():
        errors.append("BC ONE welcome-credit migration is missing")
    else:
        welcome_migration = WELCOME_CREDITS_MIGRATION.read_text(encoding="utf-8")
        for marker in [
            "create table if not exists public.bc_one_demo_ledger",
            "grant select on table public.bc_one_demo_ledger to authenticated",
            'create policy "read own BC ONE demo ledger"',
            "(new.id, 100, 'credit', 'welcome_bonus'",
            "on conflict (idempotency_key) do nothing",
            "set search_path = ''",
        ]:
            if marker.casefold() not in welcome_migration.casefold():
                errors.append("welcome-credit migration missing security marker: " + marker)
        if re.search(r"grant\\s+(?:insert|update|delete|all)\\b[^;]*bc_one_demo_ledger", welcome_migration, re.I | re.S):
            errors.append("browser clients must not write the BC ONE demo ledger")

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

    # Check the complete interactive user-journey prototype as well.
    if not JOURNEY_FILE.is_file():
        errors.append("interactive user-journey prototype is missing")
    else:
        journey_source = JOURNEY_FILE.read_text(encoding="utf-8")
        journey = PageInspector()
        journey.feed(journey_source)
        journey_duplicates = sorted({item for item in journey.ids if journey.ids.count(item) > 1})
        if journey_duplicates:
            errors.append("user journey has duplicate element IDs: " + ", ".join(journey_duplicates))
        journey_missing_targets = sorted(set(journey.anchors) - set(journey.ids))
        if journey_missing_targets:
            errors.append("user journey has missing in-page targets: " + ", ".join(journey_missing_targets))
        journey_required_ids = {
            "page-home", "page-signup", "page-benefits", "page-crush",
            "page-activity", "page-account", "signupForm", "termsCheck",
            "transferDialog", "transferForm", "benefitDialog", "useBenefit",
            "activityFilter", "exportActivity", "marketingToggle", "deleteRequest",
        }
        journey_missing_ids = sorted(journey_required_ids - set(journey.ids))
        if journey_missing_ids:
            errors.append("user journey missing required elements: " + ", ".join(journey_missing_ids))
        for phrase in [
            "Prototype uniquement", "aucun compte réel", "Points Crush",
            "aucun token réel", "données fictives",
        ]:
            if phrase.casefold() not in journey_source.casefold():
                errors.append("user journey missing safety copy: " + phrase)
        for script_source in journey.script_sources:
            if script_source.startswith(("//", "http://", "https://")):
                errors.append("user journey loads remote JavaScript: " + script_source)
        if shutil.which("node"):
            for index, script in enumerate(journey.scripts, start=1):
                if not script.strip():
                    continue
                with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as tmp:
                    tmp.write(script)
                    js_path = tmp.name
                result = subprocess.run(["node", "--check", js_path], capture_output=True, text=True)
                Path(js_path).unlink(missing_ok=True)
                if result.returncode:
                    errors.append(f"user-journey JavaScript block {index} has a syntax error: " + result.stderr.strip())

    if errors:
        print("BC ONE prototype checks FAILED")
        for error in errors:
            print(f"- {error}")
        return 1

    print("BC ONE prototype checks passed")
    print(f"- {len(page.ids)} IDs checked; no duplicates")
    print(f"- {len(page.anchors)} in-page navigation links resolve")
    print("- safety copy, local scripts, form validation, local demo persistence, CSV export and accessibility markers checked")
    print("- interactive user journey: navigation, required screens, safety notices and unique IDs checked")
    if shutil.which("node"):
        print(f"- {len(page.scripts)} inline JavaScript block(s) syntax-checked with Node.js")
    return 0


if __name__ == "__main__":
    sys.exit(main())

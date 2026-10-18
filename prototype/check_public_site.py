#!/usr/bin/env python3
"""Smoke checks for the public GitHub Pages entry points; no network required."""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGES = {
    "index.html": {"title": "BC ONE — The Burger Currency", "required": ["THE BURGER CURRENCY", "Un compte. Deux expériences.", "aucun token", "burger-id.html"]},
    "burger-id.html": {"title": "Burger ID — Un compte, deux univers", "required": ["Ton Burger ID", "tabLogin", "tabSignup", "authForm", "Supabase Auth", "CONFIGURATION À FAIRE"]},
}

class Inspector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.hrefs = []
        self.title_open = False
        self.title = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        if tag == "a" and attrs.get("href"):
            self.hrefs.append(attrs["href"])
        if tag == "title":
            self.title_open = True
    def handle_endtag(self, tag):
        if tag == "title":
            self.title_open = False
    def handle_data(self, data):
        if self.title_open:
            self.title.append(data)

SUPABASE_URL_RE = re.compile(r"^https://[a-z0-9-]+\.supabase\.co/?$", re.I)
PUBLIC_FILES = ("index.html", "burger-id.html", "fidelite.html", "burger-id-config.js")


def _jwt_role(token):
    """Return the `role` claim of a legacy Supabase JWT key, or None if not a JWT."""
    parts = token.split(".")
    if len(parts) != 3:
        return None
    payload = parts[1] + "=" * (-len(parts[1]) % 4)
    try:
        import base64, json
        return json.loads(base64.urlsafe_b64decode(payload)).get("role")
    except Exception:
        return None


def check_supabase_config(config):
    """Blank config = Burger ID inactive. Filled config = public browser key only."""
    errors = []
    values = {}
    for key in ("supabaseUrl", "supabaseAnonKey"):
        match = re.search(rf'{key}\s*:\s*"([^"]*)"', config)
        if not match:
            errors.append(f"burger-id-config.js: {key} must be declared as a string")
        else:
            values[key] = match.group(1).strip()
    if errors:
        return errors
    url, key = values["supabaseUrl"], values["supabaseAnonKey"]
    if not url and not key:
        return errors  # not configured: the page keeps signup disabled
    if not url or not key:
        errors.append("burger-id-config.js: supabaseUrl and supabaseAnonKey must be set together")
        return errors
    if not SUPABASE_URL_RE.match(url):
        errors.append("burger-id-config.js: supabaseUrl must be https://<project-ref>.supabase.co")
    if key.startswith("sb_secret_"):
        errors.append("burger-id-config.js: a secret Supabase key must never be published in the browser")
    elif key.startswith("sb_publishable_"):
        pass
    else:
        role = _jwt_role(key)
        if role == "service_role":
            errors.append("burger-id-config.js: a service_role key must never be published in the browser")
        elif role != "anon":
            errors.append("burger-id-config.js: supabaseAnonKey must be a publishable (sb_publishable_...) or anon key")
    return errors


def main():
    errors = []
    for filename in PUBLIC_FILES:
        path = ROOT / filename
        if path.is_file() and "sb_secret_" in path.read_text(encoding="utf-8"):
            errors.append(f"{filename}: contains a secret Supabase key (sb_secret_...)")
    for filename, spec in PAGES.items():
        path = ROOT / filename
        if not path.is_file():
            errors.append(f"{filename}: file missing")
            continue
        source = path.read_text(encoding="utf-8")
        page = Inspector()
        page.feed(source)
        if "".join(page.title).strip() != spec["title"]:
            errors.append(f"{filename}: unexpected or missing title")
        duplicates = sorted({value for value in page.ids if page.ids.count(value) > 1})
        if duplicates:
            errors.append(f"{filename}: duplicate IDs: {', '.join(duplicates)}")
        for marker in spec["required"]:
            if marker.casefold() not in source.casefold():
                errors.append(f"{filename}: required marker missing: {marker}")
        for href in page.hrefs:
            if href.startswith(("#", "mailto:", "tel:", "https://", "http://")):
                if href.startswith("#") and href[1:] not in page.ids:
                    errors.append(f"{filename}: unresolved in-page link {href}")
                continue
            target = href.split("#", 1)[0].split("?", 1)[0]
            if target:
                resolved = (path.parent / target).resolve()
                if resolved.is_dir():
                    resolved = resolved / "index.html"
                if not resolved.is_file():
                    errors.append(f"{filename}: local link target missing: {href}")

    config_path = ROOT / "burger-id-config.js"
    if not config_path.is_file():
        errors.append("burger-id-config.js: file missing")
    else:
        config = config_path.read_text(encoding="utf-8")
        errors.extend(check_supabase_config(config))

    burger_page = (ROOT / "burger-id.html").read_text(encoding="utf-8")
    profile_migration = ROOT / "supabase" / "migrations" / "202610160001_burger_id_profiles.sql"
    if not profile_migration.is_file():
        errors.append("current Burger ID profile migration is missing")
    else:
        migration_text = profile_migration.read_text(encoding="utf-8")
        for marker in ("user_id uuid primary key", "display_name text not null"):
            if marker.casefold() not in migration_text.casefold():
                errors.append(f"Burger ID profile migration missing expected field: {marker}")
        for marker in (".select('display_name')", ".eq('user_id',currentUser.id)", ".update({display_name:name})"):
            if marker not in burger_page:
                errors.append(f"burger-id.html does not match the current profile schema: {marker}")
        for obsolete in (".eq('id',currentUser.id)", ".select('display_name,city,burger_favorite')"):
            if obsolete in burger_page:
                errors.append(f"burger-id.html contains an obsolete profile query: {obsolete}")

    legacy_schema = ROOT / "burger-id-schema.sql"
    if not legacy_schema.is_file():
        errors.append("burger-id-schema.sql: legacy schema notice missing")
    else:
        legacy_content = legacy_schema.read_text(encoding="utf-8").casefold()
        if "deprecated" not in legacy_content or "create table" in legacy_content:
            errors.append("burger-id-schema.sql must remain a non-executable deprecation notice")

    migrations = ROOT / "supabase" / "migrations"
    versions = {}
    if migrations.is_dir():
        for path in sorted(migrations.glob("*.sql")):
            match = re.match(r"^(\d+)_", path.name)
            if not match:
                errors.append(f"migration filename must start with a numeric version: {path.name}")
                continue
            versions.setdefault(match.group(1), []).append(path.name)
        for version, names in versions.items():
            if len(names) > 1:
                errors.append(f"duplicate migration version {version}: {', '.join(names)}")

    if errors:
        print("Public site smoke checks FAILED")
        for error in errors:
            print(f"- {error}")
        return 1
    print("Public site smoke checks passed")
    print("- homepage and Burger ID HTML titles, required content, IDs and local links checked")
    print("- browser Supabase config is blank or uses a public key only; no secret/service_role key in public files")
    print("- Supabase migration filenames and version uniqueness checked")
    return 0

if __name__ == "__main__":
    sys.exit(main())

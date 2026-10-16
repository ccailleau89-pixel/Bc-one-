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

def main():
    errors = []
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
            if target and not (path.parent / target).resolve().is_file():
                errors.append(f"{filename}: local link target missing: {href}")

    config_path = ROOT / "burger-id-config.js"
    if not config_path.is_file():
        errors.append("burger-id-config.js: file missing")
    else:
        config = config_path.read_text(encoding="utf-8")
        for key in ("supabaseUrl", "supabaseAnonKey"):
            if not re.search(rf'{key}\s*:\s*""', config):
                errors.append(f"burger-id-config.js: {key} must stay blank until an approved Supabase project is configured")
        if re.search(r"service[_-]?role|secret[_-]?key|private[_-]?key", config, re.I):
            errors.append("burger-id-config.js: server/private secret-like value or key name found")

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
    print("- browser Supabase config confirmed blank; no server/private key in config")
    print("- Supabase migration filenames and version uniqueness checked")
    return 0

if __name__ == "__main__":
    sys.exit(main())

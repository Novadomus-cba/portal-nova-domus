#!/usr/bin/env python3
"""Fail if a client proposal shows internal pricing data.

Scope: client-facing proposals, ``propuestas/**/*.html``. Portal code is out
of scope on purpose (it handles these fields legitimately).

Looks only at what the client can read: text nodes and human-readable
attributes (title, alt, placeholder, aria-label, value, meta content). Script
and style bodies are skipped, so tracking code and CSS do not trigger it.

Flags:
  - Internal field names: ``remarque``, ``precio_sin_iva``, ``costo_ars``, and
    ``proveedor`` used as a data field (``proveedor_id``, ``"proveedor":``, or
    a cell/header whose whole text is "Proveedor"). The plain word "proveedor"
    in sales copy ("un solo responsable en vez de varios proveedores") is fine.
  - Names of Nova Domus suppliers, which are confidential.

Usage: pricing_leak.py  (run from the repo root)
"""
import re
import subprocess
import sys
from html.parser import HTMLParser

INTERNAL_FIELDS = re.compile(
    r"\b(remarque|precio_sin_iva|costo_ars)\b"
    r"|\bproveedor(?:es)?_\w+|\b\w+_proveedor\b"
    r"|[\"']proveedor(?:es)?[\"']\s*:"
    r"|^\s*proveedor(?:es)?\s*:?\s*$",
    re.I,
)
CONFIDENTIAL_SUPPLIERS = re.compile(r"\b(Keeper|Masnet|Homiq|Seguridad Centro|Dystech)\b", re.I)
VISIBLE_ATTRS = {"title", "alt", "placeholder", "aria-label", "value", "content"}
HIDDEN_BODIES = {"script", "style", "template", "noscript"}


class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.hits = []  # (line, kind, snippet)

    def _scan(self, text):
        for rx, kind in ((INTERNAL_FIELDS, "internal field"), (CONFIDENTIAL_SUPPLIERS, "supplier name")):
            for m in rx.finditer(text):
                lo, hi = max(0, m.start() - 40), m.end() + 40
                self.hits.append((self.getpos()[0], kind, " ".join(text[lo:hi].split())))

    def _scan_attrs(self, attrs):
        for name, value in attrs:
            if name in VISIBLE_ATTRS and value:
                self._scan(value)

    def handle_starttag(self, tag, attrs):
        if tag in HIDDEN_BODIES:
            self.skip += 1
        self._scan_attrs(attrs)

    def handle_startendtag(self, tag, attrs):
        self._scan_attrs(attrs)

    def handle_endtag(self, tag):
        if tag in HIDDEN_BODIES and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self._scan(data)


def main():
    out = subprocess.run(["git", "ls-files", "-z", "propuestas/*.html", "propuestas/**/*.html"],
                         capture_output=True, check=True).stdout
    files = sorted({p for p in out.decode("utf-8").split("\0") if p})
    total = 0
    for path in files:
        parser = VisibleText()
        with open(path, encoding="utf-8", errors="replace") as fh:
            parser.feed(fh.read())
        for line, kind, snippet in parser.hits:
            total += 1
            print(f"::error file={path},line={line}::{kind} visible to the client: {snippet}")
    print(f"pricing-leak: {len(files)} proposal(s) checked, {total} finding(s)")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())

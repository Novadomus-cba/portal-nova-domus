#!/usr/bin/env python3
"""Basic HTML validation and broken internal links for portal pages and proposals.

For every tracked ``*.html`` file:
  - Structure: unclosed or mismatched non-void elements, duplicate ``id``s.
  - Internal links: ``href``/``src`` that point inside the site must resolve
    to a tracked file. Cloudflare Pages serves ``index.html`` with 200 for
    unknown paths (SPA fallback), so a broken link never shows up as a 404.

External URLs, ``mailto:``/``tel:``/``data:``/``javascript:``, pure fragments
and template placeholders (``${...}``, ``{{...}}``) are skipped.

Usage: html_check.py  (run from the repo root)
"""
import posixpath
import re
import subprocess
import sys
from collections import Counter
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "param", "source", "track", "wbr"}
# Elements whose end tag HTML lets you omit.
OPTIONAL_END = {"p", "li", "dt", "dd", "option", "optgroup", "tr", "td", "th", "thead",
                "tbody", "tfoot", "colgroup", "rt", "rp", "html", "head", "body"}
LINK_ATTRS = {("a", "href"), ("link", "href"), ("img", "src"), ("script", "src"),
              ("source", "src"), ("video", "src"), ("audio", "src"), ("iframe", "src"),
              ("video", "poster")}
SKIP_SCHEMES = ("http:", "https:", "mailto:", "tel:", "sms:", "data:", "javascript:", "blob:", "whatsapp:")
PLACEHOLDER = re.compile(r"\$\{|\{\{|%7B|\+\s*['\"]|['\"]\s*\+")


class PageCheck(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.errors = []
        self.ids = Counter()
        self.id_lines = {}
        self.links = []

    def handle_starttag(self, tag, attrs):
        self._attrs(tag, attrs)
        if tag not in VOID:
            self.stack.append((tag, self.getpos()[0]))

    def handle_startendtag(self, tag, attrs):
        self._attrs(tag, attrs)

    def _attrs(self, tag, attrs):
        for name, value in attrs:
            if name == "id" and value:
                self.ids[value] += 1
                self.id_lines.setdefault(value, self.getpos()[0])
            if (tag, name) in LINK_ATTRS and value is not None:
                self.links.append((self.getpos()[0], value.strip()))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        names = [t for t, _ in self.stack]
        if tag not in names:
            self.errors.append((self.getpos()[0], f"stray </{tag}>"))
            return
        while self.stack:
            open_tag, line = self.stack.pop()
            if open_tag == tag:
                break
            if open_tag not in OPTIONAL_END:
                self.errors.append((line, f"<{open_tag}> not closed before </{tag}>"))

    def finish(self):
        for tag, line in self.stack:
            if tag not in OPTIONAL_END:
                self.errors.append((line, f"<{tag}> never closed"))
        for value, n in self.ids.items():
            if n > 1:
                self.errors.append((self.id_lines[value], f"duplicate id '{value}' ({n}x)"))


def resolve(page, url, files, dirs):
    if not url or url.startswith("#") or url.lower().startswith(SKIP_SCHEMES) or url.startswith("//"):
        return True
    if PLACEHOLDER.search(url):
        return True
    path = unquote(urlsplit(url).path)
    if not path:
        return True
    target = path.lstrip("/") if path.startswith("/") else posixpath.join(posixpath.dirname(page), path)
    target = posixpath.normpath(target)
    if target in (".", ""):
        return True
    if target in files:
        return True
    if target in dirs and posixpath.join(target, "index.html") in files:
        return True
    if target + ".html" in files:  # Cloudflare Pages serves /x as /x.html
        return True
    return False


def main():
    out = subprocess.run(["git", "ls-files", "-z"], capture_output=True, check=True).stdout
    tracked = [p for p in out.decode("utf-8").split("\0") if p]
    files = set(tracked)
    dirs = {posixpath.dirname(p) for p in tracked}
    for d in list(dirs):
        while d:
            d = posixpath.dirname(d)
            dirs.add(d)
    pages = sorted(p for p in tracked if p.endswith(".html"))

    total = 0
    for page in pages:
        with open(page, encoding="utf-8", errors="replace") as fh:
            src = fh.read()
        checker = PageCheck()
        checker.feed(src)
        checker.close()
        checker.finish()
        for line, msg in sorted(checker.errors):
            total += 1
            print(f"::error file={page},line={line}::{msg}")
        for line, url in checker.links:
            if not resolve(page, url, files, dirs):
                total += 1
                print(f"::error file={page},line={line}::broken internal link: {url}")
    print(f"html-check: {len(pages)} page(s) checked, {total} finding(s)")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())

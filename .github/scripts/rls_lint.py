#!/usr/bin/env python3
"""Fail if a SQL statement reads ``app_role`` through ``auth.jwt()``.

``auth.jwt() ->> 'app_role'`` (or via ``app_metadata``) silently returns no
rows under our RLS setup. Policies must call ``current_app_role()`` instead.

Usage: rls_lint.py  (run from the repo root; scans tracked ``*.sql`` files)
"""
import re
import subprocess
import sys

LINE_COMMENT = re.compile(r"--[^\n]*")
BLOCK_COMMENT = re.compile(r"/\*.*?\*/", re.S)
AUTH_JWT = re.compile(r"auth\s*\.\s*jwt\s*\(\s*\)", re.I)
APP_ROLE = re.compile(r"\bapp_role\b", re.I)


def blank(match):
    # Keep newlines so line numbers stay correct.
    return re.sub(r"[^\n]", " ", match.group(0))


def main():
    out = subprocess.run(["git", "ls-files", "-z", "*.sql"], capture_output=True, check=True).stdout
    files = [p for p in out.decode("utf-8").split("\0") if p]
    findings = []
    for path in files:
        with open(path, encoding="utf-8", errors="replace") as fh:
            sql = fh.read()
        code = LINE_COMMENT.sub(blank, BLOCK_COMMENT.sub(blank, sql))
        offset = 0
        for stmt in code.split(";"):
            if AUTH_JWT.search(stmt) and APP_ROLE.search(stmt):
                start = offset + AUTH_JWT.search(stmt).start()
                findings.append((path, code.count("\n", 0, start) + 1))
            offset += len(stmt) + 1

    for path, lineno in findings:
        print(f"::error file={path},line={lineno}::auth.jwt() combined with app_role returns no rows; use current_app_role()")
    print(f"rls-lint: {len(files)} SQL file(s) checked, {len(findings)} finding(s)")
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())

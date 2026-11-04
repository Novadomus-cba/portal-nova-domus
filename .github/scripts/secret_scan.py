#!/usr/bin/env python3
"""Fail if the tree contains secrets.

Checks every tracked file for:
  - Supabase secret keys (prefix ``sb_secret_``).
  - JWTs whose decoded payload has ``"role": "service_role"``.
    Anon / publishable keys are public by design and are ignored.
  - Committed ``.env`` files (``.env`` or ``.env.*``).

Usage: secret_scan.py  (run from the repo root; scans ``git ls-files``)
"""
import base64
import json
import os
import re
import subprocess
import sys

SB_SECRET = re.compile(r"sb_secret_[A-Za-z0-9_\-]{8,}")
JWT = re.compile(r"eyJ[A-Za-z0-9_\-]{5,}\.(eyJ[A-Za-z0-9_\-]{5,})\.[A-Za-z0-9_\-]*")
ENV_FILE = re.compile(r"^\.env(\..+)?$")


def tracked_files():
    out = subprocess.run(["git", "ls-files", "-z"], capture_output=True, check=True).stdout
    return [p for p in out.decode("utf-8").split("\0") if p]


def jwt_role(payload_b64):
    padded = payload_b64 + "=" * (-len(payload_b64) % 4)
    try:
        payload = json.loads(base64.urlsafe_b64decode(padded))
    except (ValueError, json.JSONDecodeError):
        return None
    return payload.get("role") if isinstance(payload, dict) else None


def mask(token):
    return token[:12] + "…" if len(token) > 12 else token


def main():
    findings = []
    for path in tracked_files():
        if ENV_FILE.match(os.path.basename(path)):
            findings.append((path, 0, "committed .env file"))
            continue
        try:
            with open(path, "rb") as fh:
                raw = fh.read()
        except OSError:
            continue
        if b"\0" in raw[:8192]:
            continue  # binary
        text = raw.decode("utf-8", errors="replace")
        for lineno, line in enumerate(text.splitlines(), 1):
            for m in SB_SECRET.finditer(line):
                findings.append((path, lineno, f"Supabase secret key {mask(m.group(0))}"))
            for m in JWT.finditer(line):
                if jwt_role(m.group(1)) == "service_role":
                    findings.append((path, lineno, f"service_role JWT {mask(m.group(0))}"))

    for path, lineno, what in findings:
        loc = f"file={path},line={lineno}" if lineno else f"file={path}"
        print(f"::error {loc}::{what}")
    print(f"secret-scan: {len(findings)} finding(s)")
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())

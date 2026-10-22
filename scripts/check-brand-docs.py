#!/usr/bin/env python3
"""Assert the brand guide's palette still matches the CSS.

    python3 scripts/check-brand-docs.py      # exits 1 on drift

A hand-written palette table drifts from globals.css the first time a token
changes, and a wrong hex in a brand guide is worse than no hex at all — someone
will use it. This parses both and compares.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS = ROOT / "src" / "app" / "globals.css"
DOCS = [
    ROOT / "docs" / "brand" / "foundations" / "colour.md",
    ROOT / "docs" / "brand" / "foundations" / "usage.md",
]

HEX = re.compile(r"#[0-9a-fA-F]{6}\b")


def main() -> int:
    if not CSS.exists():
        print(f"css not found: {CSS}")
        return 1

    css_hexes = {h.lower() for h in HEX.findall(CSS.read_text())}
    print(f"globals.css defines {len(css_hexes)} distinct colours")

    problems = []
    for doc in DOCS:
        if not doc.exists():
            continue
        for raw in HEX.findall(doc.read_text()):
            h = raw.lower()
            if h not in css_hexes:
                problems.append((doc.relative_to(ROOT), raw))

    if problems:
        print("\nColours documented but NOT present in globals.css:")
        for path, h in problems:
            print(f"  {path}: {h}")
        print("\nEither the CSS changed and the guide was not updated, or the")
        print("guide has a typo. Both are worth fixing before anyone uses it.")
        return 1

    checked = sum(len(HEX.findall(d.read_text())) for d in DOCS if d.exists())
    print(f"all {checked} colour references in the brand guide match the CSS")
    return 0


if __name__ == "__main__":
    sys.exit(main())

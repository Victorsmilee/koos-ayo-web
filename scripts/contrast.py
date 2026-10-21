#!/usr/bin/env python3
"""WCAG contrast check for the KOOS design system.

Run after any change to the tokens in apps/marketing/src/app/globals.css:

    python3 scripts/contrast.py        # exits 1 if any pair fails

Two thresholds are in play:
  4.5  text (WCAG 1.4.3 AA)
  3.0  large text, and UI components that convey STATE (WCAG 1.4.11)

Resting card hairlines are deliberately NOT checked. They are decorative.

The selected-option TINT is not checked either, for the same reason: the state
is carried by the accent border and the filled dot, both well over 3:1, and the
tint only reinforces them. Requiring 3:1 from a tint would turn it into a slab
of colour.

What IS checked at 3:1 is anything that alone conveys a control or its state —
above all the outline of an UNCHECKED radio or checkbox, which is the only sign
that a control is there at all.
"""
import sys

LIGHT = {
    "bg": "#F7F9FA", "surface": "#FFFFFF", "raised": "#FFFFFF",
    "line": "#DDE5E7", "line-strong": "#C2CFD3", "control-line": "#7E8D94",
    "accent": "#2F6F6B", "accent-hover": "#22514E",
    "accent-soft": "#E6F0EF", "on-accent": "#FFFFFF",
    "ink": "#16222A", "muted": "#586A74",
    "rose": "#B86B7E", "rose-deep": "#8E4356",
    "white": "#FFFFFF",
}
DARK = {
    "bg": "#0B1013", "surface": "#121A1E", "raised": "#162026",
    "line": "#243038", "line-strong": "#35454E", "control-line": "#6B7B84",
    "accent": "#5FA8A2", "accent-hover": "#7CC0BA",
    "accent-soft": "#15302F", "on-accent": "#0B1013",
    "ink": "#E9F1F2", "muted": "#93A5AD",
    "rose": "#D9909F", "rose-deep": "#8E4356",
    "white": "#FFFFFF",
}

# (description, foreground, background, required ratio)
PAIRS = [
    # --- text ---
    ("body text on the page",          "ink",         "bg",          4.5),
    ("body text on a card",            "ink",         "surface",     4.5),
    ("body text on a control",         "ink",         "raised",      4.5),
    ("body text on a SELECTED option", "ink",         "accent-soft", 4.5),
    ("helper text on the page",        "muted",       "bg",          4.5),
    ("helper text on a card",          "muted",       "surface",     4.5),
    ("eyebrow on the page",            "accent",      "bg",          4.5),
    ("eyebrow on a card",              "accent",      "surface",     4.5),
    ("primary button label",           "on-accent",   "accent",      4.5),
    ("button label, hovered",          "on-accent",   "accent-hover",4.5),
    ("staging banner label",           "white",       "rose-deep",   4.5),

    # --- UI that conveys STATE (WCAG 1.4.11) ---
    ("selected option border vs page",   "accent",    "bg",          3.0),
    ("drawn control, unchecked, on card","control-line","surface",   3.0),
    ("drawn control, unchecked, on L2",  "control-line","raised",    3.0),
    ("drawn control, checked, on card",  "accent",    "surface",     3.0),
    ("dot inside a checked control",     "on-accent", "accent",      3.0),
    ("focus ring on the page",           "accent",    "bg",          3.0),
    ("progress fill vs its track",       "accent",    "line",        3.0),

    # --- display decoration ---
    ("rose display text (LARGE only)",   "rose",      "bg",          3.0),
]


def luminance(hex_colour: str) -> float:
    h = hex_colour.lstrip("#")
    parts = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4 for v in parts]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def ratio(a: str, b: str) -> float:
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def main() -> int:
    failures = []
    for mode_name, tokens in (("LIGHT", LIGHT), ("DARK", DARK)):
        print(f"\n{mode_name} MODE")
        for label, fg, bg, need in PAIRS:
            r = ratio(tokens[fg], tokens[bg])
            ok = r >= need
            if not ok:
                failures.append(f"{mode_name}: {label} ({r:.2f}:1, needs {need})")
            print(f"  {label:<34} {fg:>12} on {bg:<12} {r:5.2f}:1  need {need}  "
                  f"{'pass' if ok else 'FAIL'}")

    print()
    if failures:
        print(f"{len(failures)} pair(s) below threshold:")
        for f in failures:
            print(f"  - {f}")
        return 1
    print(f"All {len(PAIRS) * 2} pairs meet WCAG AA.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

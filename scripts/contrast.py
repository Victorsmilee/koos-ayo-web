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
    "bg": "#FAF6F2", "surface": "#FFFFFF", "raised": "#FFFFFF",
    "line": "#E8DFD6", "line-strong": "#D3C4B4", "control-line": "#8C7C6C",
    "accent": "#6B4EA8", "accent-hover": "#553C87",
    "accent-soft": "#F1ECFB", "on-accent": "#FFFFFF",
    "ink": "#2A2320", "muted": "#655952",
    "rose": "#A05468", "rose-deep": "#8A3F52",
    "white": "#FFFFFF",
    # One per section, eyebrow only. These carry TEXT, so 4.5:1 and not 3.0.
    "sec-1": "#4C6B94", "sec-2": "#A8573A", "sec-3": "#536B4A", "sec-4": "#6E5BA6",
    "sec-5": "#8F6A42", "sec-6": "#4A736F", "sec-7": "#A05468", "sec-8": "#8A6A2E",
}
DARK = {
    "bg": "#17120F", "surface": "#211B17", "raised": "#26201B",
    "line": "#352C25", "line-strong": "#4A3E35", "control-line": "#8E7E70",
    "accent": "#B49BE4", "accent-hover": "#C9B6EE",
    "accent-soft": "#2A2140", "on-accent": "#17120F",
    "ink": "#F3ECE5", "muted": "#AD9E92",
    "rose": "#E0A0AF", "rose-deep": "#8A3F52",
    "white": "#FFFFFF",
    "sec-1": "#9FBBDD", "sec-2": "#E2A184", "sec-3": "#A6C39A", "sec-4": "#B6A5E6",
    "sec-5": "#D9B183", "sec-6": "#8FC0BB", "sec-7": "#E0A0AF", "sec-8": "#D5B570",
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

# One colour per section. Today each is a short rule above the heading, which is
# decoration and would need nothing at all. They are held to 4.5:1 anyway, on
# purpose: a section colour is exactly the sort of thing that ends up carrying a
# label later, and finding out then is more expensive than the headroom now.
# Two failed when the warm palette was first drawn, dusty blue at 4.05 and sage
# at 4.44, and were darkened before the design was shown to anyone.
PAIRS += [
    (f"section {n} colour on the page", f"sec-{n}", "bg", 4.5) for n in range(1, 9)
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

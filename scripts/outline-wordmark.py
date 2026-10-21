#!/usr/bin/env python3
"""Convert <text> in the wordmark SVGs to <path> outlines.

    pip install fonttools brotli
    python3 scripts/outline-wordmark.py

WHY THIS EXISTS
    The standalone wordmark SVGs place letters by advance width from a fixed x,
    while the circles sit at fixed coordinates. Open one on a machine without
    Inter and the letters move but the geometry does not — measured against a
    fallback 15% wider than Inter, "-AY" goes from 10px clear of the sun to 1px
    *inside* it. The word collides, it does not merely restyle.

    Outlining removes the dependency entirely: the result is pure geometry.

WHAT IT DOES NOT TOUCH
    apps/marketing/src/components/wordmark.tsx keeps live text on purpose. Inter
    is self-hosted there by next/font, so it always renders correctly, and live
    text keeps the mark themeable and in the accessibility tree.

OUTPUT
    Written alongside the originals as *.outlined.svg. The live-text files stay
    as the editable source — edit those, then re-run this.
"""
import re
import sys
from pathlib import Path

from fontTools.misc.transform import Transform
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "docs" / "brand" / "logo"

SOURCES = ["07-wordmark-koos-ayo-joy.svg", "06-wordmark-koos-short.svg"]

TEXT_RE = re.compile(
    r'<text\s+(?P<attrs>[^>]*?)>\s*(?P<content>[^<]*?)\s*</text>', re.S
)


def attr(attrs: str, name: str, default=None):
    m = re.search(rf'{name}="([^"]*)"', attrs)
    return m.group(1) if m else default


def outline(font: TTFont, text: str, x: float, y: float,
            size: float, tracking: float) -> str:
    """Glyph outlines for `text`, already positioned in SVG user units."""
    upem = font["head"].unitsPerEm
    scale = size / upem
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    glyphs = font.getGlyphSet()

    commands = []
    pen_x = x
    for ch in text:
        name = cmap.get(ord(ch))
        if name is None:
            raise SystemExit(f"  glyph missing from the font: {ch!r}")

        spen = SVGPathPen(glyphs)
        # Fonts draw y-up, SVG draws y-down, hence the negative y scale.
        glyphs[name].draw(TransformPen(spen, Transform(scale, 0, 0, -scale, pen_x, y)))
        d = spen.getCommands()
        if d:
            commands.append(d)

        advance = hmtx[name][0] * scale
        pen_x += advance + tracking

    return " ".join(commands)


def convert(font: TTFont, src: Path) -> Path:
    svg = src.read_text()
    replaced = 0

    def swap(m: re.Match) -> str:
        nonlocal replaced
        a = m.group("attrs")
        content = m.group("content")
        d = outline(
            font,
            content,
            float(attr(a, "x", 0)),
            float(attr(a, "y", 0)),
            float(attr(a, "font-size", 16)),
            float(attr(a, "letter-spacing", 0)),
        )
        replaced += 1
        fill = attr(a, "fill", "currentColor")
        return f'<path d="{d}" fill="{fill}"/>'

    out_svg = TEXT_RE.sub(swap, svg)
    if replaced == 0:
        raise SystemExit(f"  no <text> found in {src.name} — nothing to outline")

    note = (
        "\n  <!-- Text converted to outlines by scripts/outline-wordmark.py.\n"
        "       This file needs no font. Edit the live-text source instead:\n"
        f"       {src.name} -->\n"
    )
    out_svg = out_svg.replace("</svg>", note + "</svg>")

    dest = src.with_suffix(".outlined.svg")
    dest.write_text(out_svg)
    print(f"  {src.name} -> {dest.name}  ({replaced} text runs outlined)")
    return dest


def main() -> int:
    font_path = None
    for candidate in sys.argv[1:2] or []:
        font_path = Path(candidate)
    if font_path is None:
        raise SystemExit(
            "usage: outline-wordmark.py <inter-bold.woff2|.ttf>\n"
            "  get one with:  npm pack @fontsource/inter  (files/inter-latin-700-normal.woff2)"
        )
    if not font_path.exists():
        raise SystemExit(f"font not found: {font_path}")

    font = TTFont(str(font_path))
    print(f"font: {font_path.name}  upem={font['head'].unitsPerEm}")

    for name in SOURCES:
        src = LOGO / name
        if not src.exists():
            print(f"  skipped (missing): {name}")
            continue
        convert(font, src)
    return 0


if __name__ == "__main__":
    sys.exit(main())

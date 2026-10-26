# Colour

Source of truth: **`apps/marketing/src/app/globals.css`**, one block, both
themes. Everything below is a copy for humans, checked against the CSS by
`scripts/check-brand-docs.py`.

## The idea
**Crispness comes from structure, not colour.** Every surface sits on one of
three levels, and each level is separated by *both* a fill change and a hairline.
That layering is what reads as sharp; the palette itself is quiet on purpose.

| Level | Light | Dark | Used for |
|---|---|---|---|
| L0 `bg` | `#FAF6F2` | `#17120F` | the page |
| L1 `surface` | `#FFFFFF` | `#211B17` | question groups, panels |
| L2 `raised` | `#FFFFFF` | `#26201B` | option rows, inputs |

## Palette

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#FAF6F2` | `#17120F` | page |
| `surface` | `#FFFFFF` | `#211B17` | cards |
| `raised` | `#FFFFFF` | `#26201B` | controls |
| `line` | `#E8DFD6` | `#352C25` | resting hairlines, decorative |
| `line-strong` | `#D3C4B4` | `#4A3E35` | hover, dividers that matter |
| `control-line` | `#8C7C6C` | `#8E7E70` | **unchecked control outline** |
| `accent` | `#6B4EA8` | `#B49BE4` | **the only interactive colour** |
| `accent-hover` | `#553C87` | `#C9B6EE` | hover, active |
| `accent-soft` | `#F1ECFB` | `#2A2140` | selected option fill |
| `on-accent` | `#FFFFFF` | `#17120F` | text on an accent fill |
| `ink` | `#2A2320` | `#F3ECE5` | body text |
| `muted` | `#655952` | `#AD9E92` | helper text |
| `rose` | `#A05468` | `#E0A0AF` | display decoration only |
| `rose-deep` | `#8A3F52` | `#8A3F52` | STAGING banner, white text |

## Three rules that are not style preferences

**1. If it is interactive, it is `accent`.**
Rose keeps the brand from going cold, but it never carries meaning. Large display
text and the odd highlight, never body text, never a control. One accent makes
the selected state unmistakable on a long form.

**2. Never hard-code `text-white` on an accent or rose fill.**
Dark mode lightens the accent so it reads on a dark background, which drops white
text on it to **2.8:1**, a failure. That is what `on-accent` is for. Same story
for the banner: white on plain `rose` is 3.9:1 light and 2.5:1 dark, so it uses
`rose-deep` and reaches 6.8:1 in both.

**3. `control-line` is not a decorative hairline.**
The outline of an *unchecked* radio or checkbox is the only sign a control is
there at all, so WCAG 1.4.11 requires 3:1 against its background. The ordinary
hairline managed 1.6:1. It has its own token precisely so that darkening it never
darkens every card edge. **Do not merge it with `line`.**

## Checking
```bash
python3 scripts/contrast.py      # 38 pairs, both themes, exits non-zero on failure
python3 scripts/check-brand-docs.py   # the hexes above still exist in globals.css
```

Both of the first two rules exist because the checker caught real failures that
the palette table alone hid. Run it; do not eyeball contrast.


## Section colours

One per section, used for a short **rule above the heading**, like the levels
in a card deck.
Added 26 Oct 2026 with the warm purple palette.

| Section | Light | Dark |
|---|---|---|
| 1 | `#4C6B94` | `#9FBBDD` |
| 2 | `#A8573A` | `#E2A184` |
| 3 | `#536B4A` | `#A6C39A` |
| 4 | `#6E5BA6` | `#B6A5E6` |
| 5 | `#8F6A42` | `#D9B183` |
| 6 | `#4A736F` | `#8FC0BB` |
| 7 | `#A05468` | `#E0A0AF` |
| 8 | `#D5B570` | `#D5B570` |

As a rule they are decoration and would need no minimum at all. They are held to
**4.5:1** anyway, deliberately: a section colour is the sort of thing that ends
up carrying a label later, and discovering the problem then costs more than the
headroom does now. Two failed when the palette was first drawn, dusty blue at
4.05:1 and sage at 4.44:1, and were darkened before the design was shown to
anyone. `scripts/contrast.py` asserts all sixteen.

They are never used as a fill, a border or a control. If it is interactive, it
is still `accent`.

## The background wash

The page carries a fixed CSS layer: two soft radial washes and a faint ring
grid echoing the overlapping O's of the wordmark. It is **CSS, never an image**.

A photograph behind text cannot be guaranteed to clear WCAG at every scroll
position, it costs real bytes on a phone partway through an eight minute survey,
and `usage.md` already rules out stock photography of couples as the category
cliche. The wash changes no contrast measurement, because every card, option and
control sits on an opaque fill above it.

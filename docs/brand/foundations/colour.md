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
| L0 `bg` | `#F7F9FA` | `#0B1013` | the page |
| L1 `surface` | `#FFFFFF` | `#121A1E` | question groups, panels |
| L2 `raised` | `#FFFFFF` | `#162026` | option rows, inputs |

## Palette

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#F7F9FA` | `#0B1013` | page |
| `surface` | `#FFFFFF` | `#121A1E` | cards |
| `raised` | `#FFFFFF` | `#162026` | controls |
| `line` | `#DDE5E7` | `#243038` | resting hairlines, decorative |
| `line-strong` | `#C2CFD3` | `#35454E` | hover, dividers that matter |
| `control-line` | `#7E8D94` | `#6B7B84` | **unchecked control outline** |
| `accent` | `#2F6F6B` | `#5FA8A2` | **the only interactive colour** |
| `accent-hover` | `#22514E` | `#7CC0BA` | hover, active |
| `accent-soft` | `#E6F0EF` | `#15302F` | selected option fill |
| `on-accent` | `#FFFFFF` | `#0B1013` | text on an accent fill |
| `ink` | `#16222A` | `#E9F1F2` | body text |
| `muted` | `#586A74` | `#93A5AD` | helper text |
| `rose` | `#B86B7E` | `#D9909F` | display decoration only |
| `rose-deep` | `#8E4356` | `#8E4356` | STAGING banner, white text |

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

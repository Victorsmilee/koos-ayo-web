# Logo

## Chosen

**Primary wordmark — `07-wordmark-koos-ayo-joy.svg`**
Concept 5 with the O of AYO taken from concept 3. The two overlapping O's of
KOOS are *koos* — together, and the lens is the space they share. The O of AYO
carries a halo of short rays — *ayo*, joy. It is the first lockup that holds
**both halves of the name**, which is what makes it worth more than either
parent concept.

**App icon and favicon — `09-favicon-pause-small.svg`**
Concept 4, The Pause. Two circles with a deliberate gap; the negative space is
the Reaction Interrupt.

Live in the app as `src/components/wordmark.tsx`, `src/app/icon.svg` and
`src/app/apple-icon.png`. Next.js wires the last two by filename convention —
no `<link>` tags needed.

## Two things found by rendering, not by looking at the geometry

**The first wordmark stopped saying AYO.** The sun had a filled centre, and a
solid counter stops a ring being a letter — it read as a gear, and the rays
collided with the Y. Fixed by removing the centre dot, matching the ring's radius
and stroke to the two O's of KOOS so the eye reads one glyph repeated, and
pulling the rays short and clear of the Y.

**The Pause lost its gap at favicon size.** A 5px gap inside a 64px canvas is
sub-pixel once scaled to 16. Three weights were rendered side by side and the
middle one chosen: circles pushed apart, stroke 6, gap 9. Wider than that and it
stops reading as two circles; narrower and the gap vanishes.

Both are the same lesson: a logo is only as good as it looks at the size it is
actually used, and that has to be rendered to be known.

## All concepts

| File | Concept | |
|---|---|---|
| `01-overlap.svg` | Two circles meeting, filled lens | |
| `02-heart-two-arcs.svg` | The love sign — a heart from two arcs with a seam | |
| `03-joy-dot.svg` | The O of AYO as a small sun | → folded into 07 |
| `04-pause.svg` | Two circles with a gap | → redrawn as 09 |
| `05-wordmark-double-o.svg` | KOOS-AYO, overlapping O's | → superseded by 07 |
| `06-wordmark-koos-short.svg` | KOOS alone, for in-product use | still in use |
| `07-wordmark-koos-ayo-joy.svg` | **Primary wordmark** | ★ |
| `08-appicon-pause.svg` | The Pause on a rounded field | ★ app store |
| `09-favicon-pause-small.svg` | The Pause, small-size variant | ★ favicon |
| `appicon-512.png` | 512px export of 08 | for stores / PWA |

Open `logo-sheet.png` to see them all light, dark and in one colour.

## Which file to send — this matters

| Going where | Send |
|---|---|
| A printer, fabricator, agency, Figma, anywhere off this repo | **`*.outlined.svg`** |
| Editing the wordmark | the plain `.svg` — then re-run the script below |
| The website | neither — `src/components/wordmark.tsx` is the live version |

**Why.** The plain files place letters by advance width from a fixed `x`, while
the circles sit at fixed coordinates. Substitute the font and the letters move
but the geometry does not. `font-dependency-test.png` shows it: with Inter
blocked, the S crowds into the right circle and the spacing breaks. The outlined
files render **byte-identically** with and without the font, because they contain
no text at all.

The icons were never affected — pure geometry, no text.

## Regenerating the outlined files

```bash
pip install fonttools brotli
npm pack @fontsource/inter          # gives files/inter-latin-700-normal.woff2
python3 scripts/outline-wordmark.py <path-to>/inter-latin-700-normal.woff2
```

Edit the live-text `.svg`, then re-run. Never hand-edit an `.outlined.svg` — it
is generated, and your change will be overwritten.

## Colour
Every mark uses `currentColor` and the theme's CSS custom properties, so it
inherits light and dark automatically and needs no separate variants.

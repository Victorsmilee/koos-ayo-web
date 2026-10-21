# KOOS brand theme

**21 Oct 2026.** Replaces section 8.1 of the infrastructure proposal, which was a
warm terracotta palette explicitly marked `[PROPOSED]` and temporary.

This is a **starting point, not a brand**. Every value lives as a CSS custom
property in one block in `apps/marketing/src/app/globals.css`, so a real identity
later means editing that block, not hunting through components.

## The name
**KOOS-AYO means "together, with joy."**

That is the single most useful thing about the brand, and it should steer the
copy: KOOS is not a conflict-management tool that happens to be pleasant, it is
a *togetherness* product that takes conflict seriously. When a headline or a
microcopy line has to choose between sounding clinical and sounding warm, the
name settles it.

It also reads naturally in the market the company is registering into — "koos"
is Estonian for *together*, and "ayo" carries *joy* in Yoruba. Worth confirming
with the founder before putting that story in public copy, but if it is
deliberate it is a genuinely good origin story and should be used.

In the product: the full wordmark is **KOOS-AYO**; the short form **KOOS** is
used in running copy and as the product name (MVP Brief v2 decision D6). The
tagline "together, with joy" appears beside the wordmark in the header and
footer.

## The study name
The research is **The AYO Relationship Study** (21 Oct 2026). Branding the
research separately from the product is deliberate: respondents are less likely
to read it as a sales form, which matters most for the willingness-to-pay
questions — the signal that is hardest to get and easiest to contaminate.

**"Two People, One Journey"** is the **share line**, used on the marketing page
and in the text you paste when sharing the link. It is deliberately not the
survey's own title: the instrument includes separated, divorced and single
respondents, and a couples framing at the top would filter out exactly the people
the research plan most needs to hear from.

## Logo — chosen
**Wordmark:** the two O's of KOOS overlap (*koos*, together; the lens is the
space they share) and the O of AYO carries a halo of short rays (*ayo*, joy).
The first lockup holding **both halves of the name**.

**App icon and favicon:** The Pause — two circles with a deliberate gap, the
negative space being the Reaction Interrupt. Redrawn for small sizes, because the
original lost its gap below 32px and the gap is the entire idea.

Live as `src/components/wordmark.tsx`, `src/app/icon.svg`,
`src/app/apple-icon.png`. All concepts and the reasoning in
`docs/brand/logo/README.md`.

**The rule that keeps the wordmark legible:** the AYO ring has **no filled
centre**, and its radius and stroke match the two O's of KOOS. A solid counter
stops it being a letter — the first attempt read as a gear and the word stopped
saying AYO.

## Intent — v2
Cool, calm, fresh, quietly romantic, and **crisp**. The first pass was warm but
soft; shown a sharper reference, the diagnosis was that **crispness comes from
structure, not colour**. v2 keeps the palette and rebuilds the structure.

## The three-layer model — the core of it
Every surface sits on one of three levels, and each level is separated by
**both** a fill change and a hairline. That layering is what the eye reads as
sharp.

| Level | Light | Dark | Used for |
|---|---|---|---|
| L0 `bg` | `#F7F9FA` | `#0B1013` | the page |
| L1 `surface` | `#FFFFFF` | `#121A1E` | question groups, panels |
| L2 `raised` | `#FFFFFF` | `#162026` | option rows, inputs |
| `line` | `#DDE5E7` | `#243038` | resting hairlines — decorative |
| `line-strong` | `#C2CFD3` | `#35454E` | hover, dividers that matter |
| `control-line` | `#7E8D94` | `#6B7B84` | **unchecked control outline — must clear 3:1** |

## Palette

| Token | Light | Dark | Use |
|---|---|---|---|
| `accent` | `#2F6F6B` | `#5FA8A2` | **the only interactive colour** |
| `accent-hover` | `#22514E` | `#7CC0BA` | hover, active |
| `accent-soft` | `#E6F0EF` | `#15302F` | selected option fill |
| `on-accent` | `#FFFFFF` | `#0B1013` | text on an accent fill |
| `ink` | `#16222A` | `#E9F1F2` | body text |
| `muted` | `#586A74` | `#93A5AD` | helper text |
| `rose` | `#B86B7E` | `#D9909F` | **display decoration only** |
| `rose-deep` | `#8E4356` | `#8E4356` | STAGING banner, white text |

**The rule: if it is interactive, it is `accent`.** Rose keeps the brand from
going cold but no longer competes for meaning — large display text only, never
body text, never a control.

## Three tokens that exist only to keep things readable
Found by rendering the pages and measuring, not by reading the table:

- **`on-teal` → `on-accent`.** Dark mode lightens the accent so it reads on a
  dark background, which drops *white* text on it to 2.8:1. So this token is
  white in light mode and near-black in dark. Never hard-code `text-white` on an
  accent fill.
- **`rose-deep`.** White on plain rose is 3.9:1 light and 2.5:1 dark. The banner
  needed its own darker fill to reach 6.8:1 in both.
- **`control-line`.** The outline of an *unchecked* radio or checkbox is the only
  sign a control is there, so WCAG 1.4.11 requires 3:1 — the decorative hairline
  managed just 1.6:1. It gets its own token so darkening it never darkens every
  card edge.

Run `python3 scripts/contrast.py` after any change. It asserts 38 pairs across
both modes and exits non-zero on failure.

## Typography — sans only
**Inter throughout**, self-hosted via `next/font`. The serif was dropped: it was
the single biggest reason the pages read soft.

| Role | Weight / size | Tracking |
|---|---|---|
| Page title | 700 · 32px mobile / 48px desktop | `-0.03em` |
| Section heading | 700 · 24px / 30px | `-0.02em` |
| Eyebrow | 600 · 12px · UPPERCASE · `accent` | `+0.08em` |
| Question text | 600 · 17px | `-0.01em` |
| Option label | 400 · 16px — never smaller, these get tapped | normal |
| Helper | 400 · 14px · `muted` | normal |

## Components
- **`<Eyebrow>`** — the uppercase kicker. Gives every section a visible starting
  edge, which is much of why structured pages read as structured.
- **`<OptionRow>`** — the real `<input>` stays `sr-only` (focusable, in the
  accessibility tree); the circle or rounded square is drawn by us so it is
  identical in every browser. Focus shows on the whole row via
  `has-[:focus-visible]`. **Never `display:none` the input** — that removes it
  from the accessibility tree and silently breaks keyboard use.
- **Two-column grid** — automatic when a question has ≥4 options and all are
  ≤24 characters. About two thirds of the survey compresses, and no question
  text changes.
- **`<ThemeToggle>`** — system → light → dark, stored in `localStorage`.

## Question groups use `role="group"`, not `<fieldset>`
`<legend>` cannot be laid out as a normal block. The usual `float:left` hack made
the options wrap beside it and overflow the card. `role="group"` with
`aria-labelledby` gives identical semantics and no layout quirks.

## Theme switching without a flash
The theme is set by a **blocking inline script in `<head>`**, before first paint.
It cannot be a React effect: effects run after paint, so every load would flash
the wrong theme. `color-scheme` is set per theme so scrollbars and native
controls match. `<html>` carries `suppressHydrationWarning` because the script
mutates `data-theme` before React hydrates.

## Mobile-first, still
Single column by default; the grid only engages from `sm:` upward. 16px gutter,
no horizontal scroll, **52px tap targets**, `prefers-reduced-motion` respected.
Crisper must never mean denser on a phone.

**Still a starting point, not a brand.** Every value is in one CSS block, so a
real identity later is one edit.

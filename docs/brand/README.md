# KOOS-AYO brand guide

**v0.1 · working · 21 Oct 2026**

> **Status, stated honestly.** MVP Brief v2 §17 gates the product on survey
> evidence that does not exist yet. So this guide documents what exists so it
> stays consistent, and no more. Over-formalising an identity before
> product-market fit is a known trap. Everything here is deliberately cheap to
> change: the palette is one CSS block, the logo is geometry, the voice rules
> come from documents that are already approved.

## Start here

| If you are | Read |
|---|---|
| Building KOOS | `foundations/colour.md`, `foundations/typography.md`, then `CLAUDE.md` in the repo root |
| Writing anything a user will read | **`foundations/voice.md`**, this one matters most |
| Designing something | `foundations/usage.md` and `logo/README.md` |
| Handing this to an agency | `brand-guide.png`, plus the `.outlined.svg` files from `logo/` |

## Contents

| File | What |
|---|---|
| `foundations/colour.md` | Palette, the three-layer model, the contrast rules that are not optional |
| `foundations/typography.md` | Inter, the scale, why the serif was dropped |
| `foundations/naming.md` | KOOS vs KOOS-AYO vs The AYO Relationship Study |
| `foundations/voice.md` | How KOOS speaks, and what it must never say |
| `foundations/usage.md` | Clear space, minimum sizes, and what not to do |
| `logo/` | Every mark, the chosen ones, and which file to send where |
| `brand-guide.html` · `.png` | The one-pager, for looking at and for sending |

## The one sentence
**KOOS-AYO means "together, with joy."** When any decision is genuinely balanced
,  a colour, a word, a layout, the name settles it. This is a *togetherness*
product that takes conflict seriously, not a conflict tool with a friendly coat
of paint.

## Where the source of truth lives
The palette is **`apps/marketing/src/app/globals.css`**, one block, nothing
duplicated. The hex values in `colour.md` are a copy for humans, and
`scripts/check-brand-docs.py` asserts they still match the CSS so the guide
cannot quietly go stale. Run it after changing a token.

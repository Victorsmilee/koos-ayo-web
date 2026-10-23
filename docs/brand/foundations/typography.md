# Typography

**Inter, everywhere.** Self-hosted by `next/font`, so no request reaches Google,
no third-party connection is made from a visitor's browser, and there is no
layout shift.

## The scale

| Role | Weight / size | Tracking |
|---|---|---|
| Page title | 700 · 32px mobile / 48px desktop | `-0.03em` |
| Section heading | 700 · 24px / 30px | `-0.02em` |
| Eyebrow | 600 · 12px · UPPERCASE · `accent` | `+0.08em` |
| Question text | 600 · 17px | `-0.01em` |
| Option label | 400 · 16px | normal |
| Helper / optional | 400 · 14px · `muted` | normal |
| Button | 600 · 16px | normal |

**16px is the floor for anything tappable.** A 36-question survey on a phone
lives or dies on the option labels; nothing smaller than 16px gets a tap target.

## Why there is no serif
The first pass paired Lora with Inter. It read calm and editorial — and soft.
Against a sharper reference the diagnosis was that the serif was the single
biggest reason the pages lacked bite. Bold sans at negative tracking does the
work instead, and it halves what the browser has to load.

## Eyebrows do real work
The uppercase kicker above each heading is not decoration. It gives every section
a visible starting edge, which is much of why a structured page reads as
structured rather than as a wall of text.

## In the logo
The wordmark uses Inter Bold, but as **outlines** in any file that leaves this
repo — see `../logo/README.md`. Inside the app it stays live text, because Inter
is already loaded there and live text keeps the mark themeable and accessible.

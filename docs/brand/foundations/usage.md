# Usage

## The marks
**Wordmark**, `../logo/07-wordmark-koos-ayo-joy.outlined.svg`
The two O's of KOOS overlap (*koos*, together; the lens is the space they share);
the O of AYO carries a halo (*ayo*, joy).

**Short form**, `../logo/06-wordmark-koos-short.outlined.svg`
KOOS alone, for in-product use. KOOS is the product name (Brief v2, D6);
KOOS-AYO is the company.

**App icon and favicon**, The Pause. Two circles with a deliberate gap; the
negative space is the Reaction Interrupt.

## Clear space and minimum size
- **Clear space:** the height of the O on all four sides. Nothing intrudes.
- **Wordmark minimum:** 120px wide on screen, 24mm in print. Below that the rays
  are dropped automatically in the app; in print, use the short form instead.
- **Honouring that minimum in small type.** `<Wordmark>` sizes itself at 1.6em
  by default, so it scales with the text around it. That is an inline style and
  a Tailwind height class cannot beat it. In small type, pass `width` instead:
  the footer uses `width="128px"`, because at 14px the default lands the mark at
  99px, under the minimum. An end-to-end test measures the rendered width, since
  this is only visible once the page is drawn.
- **Icon minimum:** 16px, and only the small-size variant at that size,
  `09-favicon-pause-small.svg`. The standard icon loses its gap below 32px, and
  the gap is the entire idea.

## Which file to send
| Going where | Send |
|---|---|
| Printer, fabricator, agency, Figma, anywhere outside this repo | **`*.outlined.svg`** |
| Editing the wordmark | the plain `.svg`, then re-run `scripts/outline-wordmark.py` |
| The website | neither, `src/components/wordmark.tsx` is the live version |

## Do not

- **Do not rebuild the sun with a filled centre.** A solid counter stops the ring
  being a letter, the first version read as a gear and the word stopped saying
  AYO. The counter stays empty.
- **Do not recolour the lens.** The overlap is rose; that is the one place the
  accent appears in the mark.
- **Do not stretch, skew, rotate or add effects.** No shadows, no gradients, no
  outlines around the outline.
- **Do not place the wordmark on a busy background.** It is a hairline mark; it
  needs a flat field.
- **Do not use rose for body text** (3.9:1, fails). Display sizes only.
- **Do not send the live-text `.svg`** to anyone without Inter installed. The
  letters move, the geometry does not, and the word breaks. See
  `../logo/font-dependency-test.png`.

## Imagery
**No stock photography of smiling couples.** It is the most clichéd move in this
category, and it directly undercuts a product whose entire proposition is taking
conflict seriously. A beaming pair on a beach says "we will make you happy";
KOOS says "we will help you handle the hard bit."

Preferred: generous white space, the geometry of the marks themselves, and
nothing on the survey route at all, illustration there competes with the
questions.

If photography becomes necessary later, the test is: **would someone mid-argument
feel spoken to, or sold to?**

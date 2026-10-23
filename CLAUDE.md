# KOOS, marketing site and research survey

This is the **public** repository: the marketing site at koos-ayo.com and the
research questionnaire at `/whatdoyouthink`.

## Source of truth
The product baseline (MVP Brief v2, 24 Sep 2026), the GDPR records and the
backlog live in the **private** repository `Victorsmilee/koos-ayo`. Read them
there before adding a feature. Anything not traceable to those documents is
labelled `[PROPOSED]` in code comments and PR descriptions, and needs Product
Owner approval before it becomes baseline.

Nothing in this repository should restate strategy, pricing or roadmap. It is
public: assume anyone can read it.

## Layout
- `src/app`, Next.js App Router; the survey is `src/app/whatdoyouthink`
- `src/lib/questions.ts`, the research instrument, verbatim
- `supabase/migrations`, every table change is a numbered SQL file here
- `docs/brand/`, the brand guide: `foundations/` (colour, type, naming, voice,
  usage) and `logo/`. Read `foundations/voice.md` before writing anything a user
  will see.

There is no Python service. The backend is Next.js route handlers and server
actions. Do not reintroduce a separate API service without an explicit decision.

## Changelog
Every pull request that changes behaviour, the privacy notice, or copy a
respondent sees adds an entry to `CHANGELOG.md` under today's date, in the same
PR. Say what changed and why it mattered, and state explicitly whether the
instrument moved.

## Branches and releases
- Never push directly to `main`. Work on `feature/*` branches.
- `feature/*` → PR → human review → merge to `main` → production.
- Release PRs use **Create a merge commit**, never Squash and merge.
- Never merge or push without the user asking.

## Environments
- local, preview → `staging` schema
- production (`main`) → `public` schema
- Both live in one Supabase project in Frankfurt. `SUPABASE_DB_SCHEMA` has no
  default: missing config must throw, never silently fall back to `public`.

## Nothing ships untested
Product Owner rule, 23 Oct 2026. **Work is not complete until it is tested,
confirmed, and reported.** Automated, not by hand.

- `npm run verify` runs typecheck, unit tests, both guards and the build.
- `npm run e2e` runs Playwright across a phone and a desktop viewport.
- CI (`.github/workflows/ci.yml`) runs all of it on every pull request. A red
  check is the answer, not a comment saying it works.

A change to behaviour needs a test that fails without it. The refresh fix is the
example to copy: the bug deleted saved answers, and nothing caught it because
every test checked structure rather than what a respondent could actually do.

E2E specs that write to the database skip themselves when SUPABASE_URL is unset,
so the UI suite still runs locally without credentials. CI supplies **staging**
credentials. They must never see the production schema: these specs write rows.

Locally the container has its own browser, so run e2e with
`PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.

## Nothing is hardcoded
Product Owner rule, 23 Oct 2026. **Any value that must be hardcoded needs his
approval first.** Derive it instead, from the one place it is defined:

- Question ids come from `questions.ts`. Never write `q35` or `answers.q1`:
  use `EMAIL_QUESTION_ID`, `EMAIL_GATE_QUESTION_ID`, `consentQuestion.id`.
- Table names come from `TABLES` in `supabase-server.ts`, schema names from
  `SCHEMAS`, environment names from `app-env.ts`.
- Selection limits and option lists are already derived from the instrument in
  `validation.ts`. Keep it that way.

`tests/instrument.test.ts` fails the build on a hardcoded question id, table or
schema. This was a real bug, not a style preference: `q35` was spelled out in
`actions.ts` and twice in `survey-client.tsx`, so renumbering the instrument
would have written respondents' email addresses into the answers table.

## Hard rules
- Never log, track or send relationship content, survey answers or emails to
  analytics, error tools or the console.
- Secrets are server-only. Never prefix a secret with `NEXT_PUBLIC_`.
- Row-level security is on for every table. The research tables have **zero
  policies**: RLS on with no policy denies every role, and only the server's
  secret key (which bypasses RLS) writes. Never add an `anon` policy to them.
- Never chain `.select()` onto an insert or update on an RLS-locked table,
  PostgREST will ask for the row back and fail with `42501`.
- Survey emails stay separate from survey answers, with nothing linking them.
  `q35` is stripped from the answers payload on every write.
- Never write code that lets one partner see another's private content.
- KOOS never sends messages on a user's behalf.
- No analytics, tracking pixels or third-party scripts on `/whatdoyouthink`.
- Use product terms exactly as written: Reaction Interrupt, Before You Send,
  Challenge Me, Two Truths, Outcome Feedback, Relationship Playbook.

## The research instrument
`src/lib/questions.ts` reproduces questionnaire v3 verbatim. Do not reword, add
or remove a question, an option or the thank-you text. It is a measuring device:
changing wording invalidates comparison across responses.
`[TEAM TO CONFIRM]` placeholders are launch blockers, never values to invent.
`tests/instrument.test.ts` guards this, run `npm test`.

## The name
KOOS-AYO means "together, with joy." The full wordmark is KOOS-AYO; **KOOS** is
the short form used in running copy and as the product name (Brief v2, D6).
When copy must choose between clinical and warm, the name settles it: this is a
togetherness product that takes conflict seriously, not a conflict tool with a
friendly coat of paint.

## Brand
Tokens live in one block in `src/app/globals.css`; the guide is `docs/brand/`.
After touching a token, run `python3 scripts/check-brand-docs.py` as well, it
asserts every hex in the guide still exists in the CSS, so the docs cannot go
quietly stale.
**Crispness comes from structure, not colour:** three layers (`bg` / `surface` /
`raised`), each separated by both a fill change and a hairline.

- **If it is interactive, it is `accent`.** `rose` is display decoration only,
  large text, never body text, never a control.
- Never hard-code `text-white` on an accent or rose fill. Use `on-accent`, or
  `rose-deep` for the banner. Dark mode lightens the accent and white drops to
  2.8:1.
- `control-line` is for the outline of an **unchecked** control and must stay at
  3:1 (WCAG 1.4.11). It is not a decorative hairline, do not merge it with
  `line`.
- Options use `<OptionRow>`: a `sr-only` real input plus a drawn control. Never
  `display:none` an input.
- Question groups use `role="group"` + `aria-labelledby`, not `<fieldset>`,
  `<legend>` cannot be laid out as a block and overflows the card.
- Run `python3 scripts/contrast.py` after touching any token. It must exit 0.
- Mobile-first: single column by default, 52px tap targets, no horizontal
  scroll.

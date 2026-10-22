# KOOS — marketing site and research survey

The public site at **koos-ayo.com**, including the research questionnaire at
`/whatdoyouthink`.

KOOS-AYO means "together, with joy." It is private relationship coaching — a
togetherness product that takes conflict seriously.

**Right now there is one job:** get the research questionnaire live. Everything
further is gated on evidence from it.

> Product documents, GDPR records and the backlog live in the private
> repository. This repository holds the site and the instrument only.

## Layout
```
src/app/              Next.js App Router
src/app/whatdoyouthink/   the survey — 8 sections, 36 questions
src/lib/questions.ts  the research instrument, verbatim
supabase/migrations/  every table change, numbered
docs/brand/           the brand guide: foundations/ and logo/
docs/brand/logo/      wordmark and icon sources
scripts/contrast.py   the colour-contrast guard
```

There is no Python service. The backend is Next.js route handlers and server
actions.

## Run it locally
```bash
cp .env.example .env.local      # fill with the STAGING values
npm install
npm run dev                     # http://localhost:3000
```

`.env.local` needs five values. `SUPABASE_DB_SCHEMA` must be `staging` locally —
there is deliberately no default, so a missing value throws at startup instead of
silently writing test data into the real research dataset.

Open the survey on your phone too, using the Network address the dev server
prints. Most respondents will be on one.

```bash
npm test                 # instrument integrity + validation (no database needed)
npm run build            # production build
npm run typecheck
python3 scripts/contrast.py   # must exit 0 after any token change
```

## How code ships
`feature/*` → pull request → **a person reviews and merges** → `main` →
production. Every pull request gets its own preview URL.

Nobody pushes directly to `main`. Nothing auto-merges.

```bash
git checkout main && git pull
git checkout -b feature/whatever
git add . && git commit -m "..." && git push -u origin feature/whatever
gh pr create --base main --fill
```

## A note on the instrument
`src/lib/questions.ts` reproduces questionnaire v3 word for word. It is a
measuring device, not copy: rewording a question invalidates comparison across
responses. `tests/instrument.test.ts` enforces this, and `CODEOWNERS` requires a
review on that file specifically.

## Privacy
No analytics, tracking pixels or third-party scripts run on `/whatdoyouthink`.
Survey answers and email addresses are stored in separate tables with nothing
linking them. The privacy notice is published at `/privacy`.

# Changelog

What changed on the marketing site and the research survey, and why. Newest
first.

No version numbers yet: nothing has been released. Dates are the only meaningful
marker until the survey goes live.

**Add an entry in the same pull request as the change.** A changelog written
afterwards is written from memory, and memory is what this file exists to
replace. Entries say what changed and why it mattered, not which files moved:
`git log` already has the files.

**Changes to `src/lib/questions.ts` get special care.** It reproduces
questionnaire v3 verbatim and is a measuring device: if a question, option or the
thank-you text ever changes, early and late respondents answered different
instruments and the two sets cannot be compared. Say explicitly in the entry
whether the instrument moved. So far it never has.

---

## 28 Oct 2026

### A failed save now says why, without saying what
The first live save failure on Vercel produced "Sorry, that didn't save" and no
trace anywhere. `actions.ts` caught every error and returned the generic message
without logging, so the runtime logs were empty and the only way to diagnose it
was curl against Supabase by hand. That cost days.

The rule it was honouring is right: no answer text, no email, no payload, ever.
The implementation was the blunt version of it, logging nothing at all.

`src/lib/save-failure.ts` is the narrow fix, and it is an **allowlist** rather
than a redaction, so a future error shape cannot leak content by being
unanticipated:

- a PostgREST failure logs its **code only**, `42501`, `PGRST106`. The message,
  details and hint are withheld, because PostgREST echoes row values into
  `details` on a constraint violation. That is the actual leak path.
- a configuration failure logs its message, because we wrote it and it names an
  environment variable rather than a value. `ConfigError` is a new type so this
  can be told apart from a database error rather than guessed at.
- anything else logs its type name and nothing more.

Two tests, both verified failing before the fix: one feeds an error whose
message, details and hint all contain answer text and asserts none of it
survives, and one reads `actions.ts` and fails the build if any failure path
swallows its cause silently again.

### Hetzner and Coolify are gone, and the privacy notice says so
The site now runs on Vercel, with functions pinned to Frankfurt, DNS at
Namecheap and no Cloudflare in the path. Cloudflare was planned but never
actually used.

The part that mattered most was not the deletion. **The published privacy
notice named Hetzner and Cloudflare as processors**, and from the moment the
site moved that was not a stale document but an inaccurate disclosure. It now
names Vercel Inc. and Supabase, states that the code handling answers runs in
Frankfurt, and says plainly that Vercel is an American company so access from
outside the EU is possible under standard contractual clauses.

The storage claim is kept and kept **narrow**: answers are stored in the EU,
because Supabase did not move. It is the handling that crosses a border, and
conflating the two would have been the easy way to say something untrue.

An end-to-end test now asserts the processor list, at both viewports, and fails
if Hetzner or Cloudflare reappear. `docs/gdpr/ropa.md` in the private repository
changes in the same pass, because a regulator compares the two.

Deleted with the host: the `Dockerfile`, `.dockerignore` and
`output: 'standalone'`, which existed only to build a small image for Coolify
and had no remaining reader. `CLAUDE.md` gains a Hosting section recording the
canonical host, the `fra1` region, and why the Namecheap nameservers must not
be moved.

**The instrument did not move.**


### How work is done here is now written down
`docs/engineering-standards.md` is the Product Owner's universal project rules:
reason as the senior expert for the discipline the task belongs to, inspect
before acting, verify before concluding, gate the answer before giving it,
challenge your own solution, label what is verified against what is inferred,
and treat infrastructure and production as high impact.

The canonical copy is in the private repository. This copy exists so this
repository is workable on its own, and `CLAUDE.md` carries the operative summary
so it is always loaded rather than only on disk.

No behaviour changed and no copy a respondent sees changed. **The instrument did
not move.**

## 27 Oct 2026

### The instrument can now be exported as JSON
`npm run instrument:json` prints every question, option and selection limit.
Nothing secret: all of it is already served to anyone who opens the survey.

Why it exists: the analysis of responses lives in the private repository,
because what the answers say about what to build is roadmap and this repository
is public. But the instrument lives here, and it is the only place question ids
and option texts are defined. Without an export the analysis would have kept its
own copy, and that copy would have been wrong the first time the instrument
moved. It reads this instead, at runtime.

That analysis tags answer options with the product experience they are evidence
for, and it keys on **option text**. So a reworded option there does not just
change a label, it silently stops counting. A test asserts the export carries
every question and every option in order, which is what turns that silent
failure into a red build.

**The instrument did not move.** The export reads it, it does not touch it.

### `.gitignore` blocks private keys, because this repository is public
No instrument change.

On 24 Oct a `YOUR_SERVER_IP` placeholder from the go-live runbook was pasted
into `ssh-keygen`'s interactive file prompt, which wrote a live ed25519 private
key into the **private** repository's root. Nothing was committed and the
runbook is fixed there.

The guard belongs here more than there. A key committed to a private repository
is a scare and a key rotation; a key committed to this one is public the moment
it is pushed, and rewriting history does not un-publish it, because it is
already in anyone's clone and in GitHub's caches. The patterns cost nothing and
remove the possibility.

Verified no tracked file is shadowed by the new rules.

---


### The data controller is now Eben EIO Global OU
Estonian registration completed, so the controller named in the privacy notice
changes from Victor Ibrahim, a natural person, to the company. Under GDPR that
is a change of controller rather than a correction, so it is dated in the notice
itself and in the ROPA in the private repository, and the two name the same
entity because a regulator compares them.

Why it mattered: the natural-person reading existed only because a company that
is intended but not yet registered is not an identifiable legal person. It was
always meant to be temporary, and leaving it in place after registration would
have published a controller who is no longer the one responsible.

The notice also gains a "Who operates KOOS" section carrying the operator line
and the intellectual-property notice. Neither is a GDPR statement; they sit
beside the notice rather than inside it.

**The instrument did not move.** No question, option, helper line or the
thank-you text changed.

### The footer names the company, and carries the wordmark
A new band under the crisis line: the KOOS-AYO wordmark and the copyright on the
left, "Developed and operated by Eben EIO Global OU" on the right, stacked on a
phone. The plain-text KOOS-AYO that used to head the footer is gone, because the
real wordmark now sits below it.

The company name lives in `src/lib/operator.ts` and nowhere else, and the
no-hardcode guard fails the build on a second spelling of it. The footer and the
published notice disagreeing about who runs the service is precisely the drift
that guard exists to stop.

### A defect the footer work surfaced
`<Wordmark>` sizes itself inline at 1.6em, which beats any Tailwind height
class. In 14px footer type that renders the mark at 99px wide, under the 120px
minimum the brand guide sets. It now takes an explicit `width`, and an
end-to-end test measures the rendered width rather than trusting the markup,
because nothing short of a render catches this.


## 26 Oct 2026

### Warm purple theme, with a background wash
Approved from a preview rather than argued about. The ground moves from cool
grey to warm paper, teal becomes purple, and question text and section titles
take a serif (Fraunces). Options, labels and every control stay Inter, so
legibility at 16px on a phone is untouched.

Each section gets its own colour, carried in the eyebrow: the count in that
colour with a hairline running off to the right, which is the treatment that was
approved from the preview.

That repeats the count already in the progress bar. It used to matter, because a
test located the section by its text and matched two nodes, but the progress bar
now carries `section-indicator` and is addressed directly. So the repetition is
a visual choice rather than a trap, and the duplicated copy is aria-hidden so a
screen reader hears the position once.

**The background is CSS, never an image.** Two soft radial washes and a faint
ring grid echoing the overlapping O's of the wordmark, fixed so it never
repaints on scroll. A photograph behind text cannot be guaranteed to clear WCAG
at every scroll position, it costs real bytes on a phone partway through an
eight minute survey, and the brand guide already rules out stock photography of
couples as the category cliche. It changes no contrast measurement, because
every card and control sits on an opaque fill above it.

Contrast was computed **before** the preview was shown, not after. Two section
colours failed, dusty blue at 4.05:1 and sage at 4.44:1, and were darkened to
5.09 and 5.47. `scripts/contrast.py` now asserts 54 pairs, up from 38, including
all sixteen section colours in both themes.

**The instrument did not move.** Nothing here touches a question, an option or
the thank-you text.

## 23 Oct 2026

### The home page says build, not write
The closing section read "Before writing the product". You write code or copy;
you build a product. Two lines above, the heading already says "We're deciding
what to build", and the privacy notice says "what to build, and what not to
build", so write was the only outlier on the site.

It now reads "Before we build anything", which also avoids repeating "the
product" straight after "what to build" and makes a stronger promise: nothing is
decided yet, so the answer counts. That is the whole argument for filling it in.

Marketing copy, not the instrument. `questions.ts` is untouched, so nothing here
affects comparison across responses.


### The notice says European Union, not Frankfurt
The project was created in Supabase's general **Europe** region, which deploys
to an available EU region by capacity rather than to a named city. The published
notice named Frankfurt twice, which is a claim we cannot stand behind.

It now says the European Union. A narrower claim can be wrong and a broader true
one cannot, and the EU boundary is what the transfer rules actually turn on. No
personal data leaves the EU either way, so nothing about the lawful basis
changes. The matching ROPA change lands in the private repo at the same time.

### The selection-limit spec hung on a disabled option
Second CI run: 19 passed, 2 failed, down from 6. The remaining failure was the
limit spec timing out, and the cause was the spec clicking every option in turn.
Once the maximum is reached the remaining inputs are `disabled`, so Playwright
waited the full timeout for an element that was never going to become
actionable, and reported it as a plain timeout.

It now selects exactly the maximum, asserts the live "3 of 3 selected" counter
a respondent actually sees, and then asserts the next option is disabled rather
than trying to click it. Which question, which section and what the maximum is
all come from the instrument.

The suite timeout went from the 30s default to 90s, because these drive a real
survey against a real database and walking to a later section is several round
trips. The short timeout was turning a hang into something that looked like
slowness.

### The database end-to-end specs failed their first real run, and were wrong
They shipped unproven, as their commit said, because they need a database and
could not be run where they were written. CI ran them for the first time and six
failed.

**The app was fine.** `getByText(/section 3 of 8/i)` matched two nodes, the
eyebrow and the progress bar, and Playwright's strict mode refuses a locator
that resolves to more than one. The only production change here is a
`data-testid` on the progress count, which is the authoritative one.

Rewritten while fixing it:

- Section numbers and the total come from `sections`, not typed into the spec.
  Writing "of 8" into a test is the same mistake as writing it into the app.
- `answerSection` now waits for the indicator to change rather than clicking
  Next and assuming. A slow save looked identical to a broken page, which is
  part of why the first failures were ambiguous.
- The limit and email-gating specs derive which question and which section they
  need from the instrument, so renumbering cannot silently point them at the
  wrong one.


### Navigation sticks to the bottom of the screen
Back used to be a scroll away at the end of a long section. The options
considered were a clickable progress bar and a second Back/Next pair at the top;
both were rejected. Eight clickable segments give about 45px targets at 390px
against the 52px rule, and turn a `role="progressbar"` status element into eight
tab stops. A second pair spends the top of a phone screen duplicating the
primary action.

A sticky footer solves the actual complaint, which was reachability rather than
there being only one Back. Solid `bg` with a top hairline, because the
three-layer rule asks for both and a translucent bar lets option text show
through as the page scrolls under it. The padding clears the iPhone home
indicator.

Two things this turned up, neither of them visible in the code:

- The hint explaining why Start is disabled rendered **after** the nav, so a
  sticky bar pushed it under the pinned footer. Moved above the control it
  explains.
- Three versions of the end-to-end check were wrong before the layout was: it
  picked a paragraph inside the bar, then measured mid-scroll before the scroll
  had settled. The layout was right each time. Verified by regression in the
  end: removing `sticky` fails the check, restoring it passes.

### The concept box no longer counts sections
`screen === 4` pinned the concept description to a section by number, so
reordering or inserting a section would have floated it onto the wrong one
silently. The section now carries its own `conceptBox`, so position comes from
the instrument.

`conceptBox` moved above `sections` in the file, because a const is not hoisted
and referencing it later would fail at module load rather than at build.

Screen 0 became a named `INTRO` for the same reason, and the no-hardcode guard
now flags section indices as well as question ids and table names. Verified by
regression.


### The privacy notice opens in a new tab
Reading it mid-survey used to navigate away from the form. The resume fix would
now bring answers back, but making someone rely on that to read the notice they
are consenting to is the wrong trade.

The link carries `rel="noopener noreferrer"`, which `target="_blank"` requires:
without `noopener` the opened page can reach back through `window.opener`. The
label says "opens in a new tab" out loud, because a link that spawns one
silently is disorienting for screen reader users.

Covered by an end-to-end check, verified by regression: removing `target` fails
the suite, restoring it passes.


### Nothing ships untested: Playwright and CI
Product Owner rule: work is not complete until it is tested, confirmed and
reported, automatically.

Playwright rather than Cypress, decided after flagging that the stack document
already named Playwright and this container has its browsers preinstalled, so it
runs with no download. Revisit if it proves awkward.

Ten end-to-end checks across a **phone and a desktop viewport**, since the survey
is answered on phones. Five need no database and run anywhere: the intro, the
Article 9 and publication consent wording, the consent decline storing nothing,
the complete controller address with no placeholder left, and a chosen theme
surviving a reload with no flash. Five write rows and skip themselves without
credentials, including the regression test for the refresh bug.

CI runs on every pull request: typecheck, unit tests, the contrast and brand
guards, the build, and the full end-to-end suite against **staging**. A red check
is the answer now, not a sentence claiming it works.

One honest note: the theme spec failed on its first run and the **test** was
wrong, not the app. The toggle cycles system, light and dark, which is three
modes but two outcomes, so one click can legitimately leave data-theme unchanged.


### Refreshing the page no longer destroys saved answers
A real data-loss bug, in the one dataset that cannot be re-collected.

State began empty on every page load, and `saveSection` assigned
`answers: payload` outright. So a respondent who answered sections 1 to 4 and
refreshed came back to a blank form, and the moment they re-answered section 1
the update wrote `{section 1 only}` over the row: **sections 2 to 4 were deleted
from the database.** `last_section` also fell from 4 to 1, corrupting the
drop-off measurement that progressive save exists to produce.

The cookie made it worse rather than better. Without it they would have got a
fresh row and the earlier answers would have survived as a partial response; with
it, the overwrite was guaranteed.

Two fixes, either of which would have been enough, both kept because this is
answer data:

- The page now loads the unfinished response by the id in the visitor's own
  cookie and passes it in as initial state, so a refresh resumes where they were.
- Saves merge into what the row already holds instead of replacing it, so a short
  payload cannot truncate a row even if the client is wrong. `last_section` takes
  the furthest section reached, never the most recent saved, so going Back cannot
  make drop-off look shallower than it was.

A completed response is deliberately not resumed: the stale cookie is left
pointing at a finished row and the next save starts a new one, rather than
overwriting a submitted response.

`/whatdoyouthink` is now server-rendered per request rather than static, because
it reads a cookie. Every other route is unchanged.

Also removed two more hardcoded values found on the way: `last_section: 8` in two
places is now `sections.length`, and the cookie name, path and lifetime now live
in one module instead of being spelled out where they are used.


### THE INSTRUMENT MOVED. Two questions added, 36 to 38
**The first and so far only time this has happened.** Done before a single
response was collected, which is the only window in which it is possible: the
rule against changing the instrument exists so early and late respondents answer
the same survey, and with nothing collected there was nothing to break. After the
link is shared this is closed permanently.

**No existing question, option or the thank-you text was reworded.** Two were
added and the tail was renumbered.

New Q34, the price ceiling: "What is the most you would pay per month before it
stops feeling worth it?" Q33 already asked what price feels reasonable, which is
a different thing. A respondent who thinks EUR10 is fair may still stop at EUR5,
and that gap is the number that decides whether this can be a paid product. The
bands share Q33 breakpoints so the two cross-tabulate.

The alternative considered was making Q33 multiple choice with a limit of three.
Rejected: three ticks on a price scale stop measuring price, since adjacent bands
all inflate together and "I would only use a free version" becomes selectable
alongside "EUR10-20 per month".

New Q35, recommendation: "If it genuinely helped you, would you recommend it to a
friend or family member?" on Q32's scale, so willingness to pay and willingness
to advocate cross-tabulate. For this product the gap between them is the finding:
someone may value it highly and still never admit using a relationship app. If
Q32 runs high and Q35 low, that changes acquisition entirely.

A referral programme was considered and deliberately NOT built into the survey.
Incentivised referrals would measure the incentive rather than the product,
collecting a friend's contact details processes a third party who never
consented, and points require an identity the anonymous design does not have.
The question measures intent; the mechanism waits for the answer.

Q34 to Q36 became Q36 to Q38. That renumbering was only safe because the change
below removed every hardcoded question id.

### Nothing is hardcoded any more
Question ids, table names, schema names and environment names are now derived
from their single source. The one that mattered: the email question id was
written out in three places and derived in none, so renumbering the instrument
would have made stripEmail delete a question that no longer existed and write
respondents' email addresses into the answers table.

A test now fails the build on any hardcoded question id, table or schema,
verified by regression rather than inspection.


### Controller address completed
`Paldiski mnt 227c, 13520 Tallinn, Estonia`, closing the last blank in the
notice. Because no placeholder remains, `<Todo>` stops highlighting it and the
address renders as ordinary prose rather than as a draft. The matching ROPA
change landed in the private repo at the same time, because a regulator compares
the published notice against that record.

### Consent now permits publishing aggregates
The privacy box said answers were "used only for this research", which forbade a
public results page. Respondents are anonymous, so consent cannot be obtained
after the fact: anything collected under the old wording could never have been
published, with no way back. It now says we may publish anonymous summary
statistics, and names the three exclusions: individual answers, anything typed in
free text, and the faith question (Article 9 data). Tests guard that sentence.

**Instrument unchanged.** This is helper copy in the privacy box, the same class
of change as the Article 9 line.

### Respondents told to answer on instinct
The closing line now says to go with your first instinct "rather than the answer
that sounds best", aimed at social desirability editing, which contaminates the
willingness to pay questions worst. **Instrument unchanged.**

### "Not judging you" removed
The privacy box said we are "not in judging you or your relationship". Denying
judgement is what raises it. Replaced with what the research is actually about:
what happens in relationships, and patterns across many people.
**Instrument unchanged.**

### Sentence case, and no em dashes
Section titles moved from "Support You Use Today" to "Support you use today", and
43 em dashes were removed from `src`, replaced with a comma, colon or full stop
depending on what the sentence was doing. Both read as machine written.

A test now fails on any em dash in `src`. It allows an en dash between digits:
`18-24` and `6-12 months` are answer options from v3, where an en dash is correct
typography for a range, and they are instrument text regardless. That exception
was found by the guard on its first run.

**Instrument unchanged.** Section titles are headings, not questions, options or
the thank-you text.

### Brand guide arrived
The 22 Oct split carried `docs/brand/logo` over but not the rest of the guide, so
this repo kept a `docs/brand.md` the guide had already replaced. Added
`docs/brand/` with `foundations/` (colour, typography, naming, voice, usage) and
the rendered guide; removed the superseded file.

`scripts/check-brand-docs.py` came with it, with its CSS path corrected for this
repo's flat layout. It asserts every hex in the guide is a real token in
`globals.css`, so the palette table cannot drift.

---

## 22 Oct 2026

### Split out of the monorepo
This repository became the public home of the marketing site and the survey. The
product documents, GDPR records and backlog stayed in the private
`Victorsmilee/koos-ayo`. Nothing here should restate strategy, pricing or
roadmap: it is public.

`supabase/migrations/0001_research.sql` exists in both repositories. **The copy
in the private repo is canonical**; this one is for local development.

### Controller set to a natural person
Estonian registration of Koos-Ayo is in progress, and an intended company is not
an identifiable legal person, so it cannot be the controller. Set to Victor
Ibrahim, matching the ROPA.

`<Todo>` also stopped highlighting unconditionally. It had marked every value,
including ones already filled in, which made the notice look like a draft and
made the highlight useless as a signal. It now keys off the `[TEAM TO CONFIRM]`
marker itself.

### Initial site and survey
Marketing home page, the 36 question survey at `/whatdoyouthink`, and the privacy
notice. Progressive save so drop-off is measurable, skip logic on Q1 and Q34,
selection limits, and a honeypot.

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

## 23 Oct 2026

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

/**
 * Print the research instrument as JSON on stdout.
 *
 * The analysis of survey responses lives in the PRIVATE repository, because
 * what the answers say about what to build is roadmap, and this repository is
 * public. But the instrument lives here, and it is the only place question ids,
 * option texts and selection limits are defined.
 *
 * Rather than copying any of that into the private repository, where it would
 * drift the first time the instrument moved, this exports it. The analysis
 * script runs this through `npx tsx` and reads the JSON, so every id and option
 * it works with comes from the live instrument at the moment it runs.
 *
 * Nothing secret is exported. Every field here is already served to anyone who
 * opens the survey.
 *
 *   npm run instrument:json > instrument.json
 */
import {
  CONSENT_DECLINE,
  EMAIL_GATE_QUESTION_ID,
  EMAIL_QUESTION_ID,
  EMAIL_SHOWN_WHEN,
  SURVEY_VERSION,
  TOTAL_SECTIONS,
  allQuestions,
  consentQuestion,
  sections,
} from '../src/lib/questions'

const payload = {
  surveyVersion: SURVEY_VERSION,
  totalSections: TOTAL_SECTIONS,
  // Counts the consent gate, which sits outside `sections` and is exported
  // separately under `consent`. So this is the section questions plus one.
  totalQuestions: allQuestions.length,

  // The consent gate is not inside a section, so it would be missed by walking
  // `sections` alone. It is the one question that cannot be skipped.
  consent: {
    id: consentQuestion.id,
    text: consentQuestion.text,
    options: consentQuestion.options ?? [],
    declineOption: CONSENT_DECLINE,
  },

  // The email question and the answer that reveals it. The analysis must know
  // these to assert it is never reading an address out of the answers payload.
  email: {
    questionId: EMAIL_QUESTION_ID,
    gateQuestionId: EMAIL_GATE_QUESTION_ID,
    shownWhen: EMAIL_SHOWN_WHEN,
  },

  sections: sections.map((s) => ({
    index: s.index,
    title: s.title,
    questions: s.questions.map((q) => ({
      id: q.id,
      number: q.number,
      text: q.text,
      kind: q.kind,
      options: q.options ?? [],
      maxSelections: q.maxSelections ?? null,
      hasOther: q.hasOther ?? false,
      optional: q.optional ?? false,
    })),
  })),
}

process.stdout.write(JSON.stringify(payload, null, 2) + '\n')

/**
 * "Your pattern", the onboarding quiz at /your-pattern.
 *
 * THIS IS NOT THE RESEARCH INSTRUMENT. `questions.ts` is the measuring device:
 * 38 questions, reproduced verbatim, guarded so a single reworded option fails
 * the build, because comparison across responses depends on the wording never
 * moving. This is a funnel. It can and will be edited.
 *
 * Keeping them apart matters in both directions. If the quiz re-asked the
 * survey's ground you would hold two datasets that disagree and a respondent
 * who answered the same thing twice. And if the quiz were held to the
 * instrument's rules, nobody could improve the funnel without invalidating the
 * study.
 *
 * WHY EIGHT, AND WHY THESE
 * Every question here changes what KOOS does on someone's first day. The
 * fifteen-question draft was cut on that test alone: duration, past challenges,
 * feelings during conversations, habit to improve and what progress looks like
 * all overlapped something kept, or changed nothing.
 *
 * `escalates` is the longitudinal baseline. It is behavioural rather than
 * attitudinal, which is the point: "how would you describe your relationship"
 * barely moves in eight weeks, while how often a disagreement turns into
 * something worse does, and it is exactly what Reaction Interrupt targets. It
 * is the question to re-ask at week 4 and week 12.
 *
 * WHAT IS DELIBERATELY ABSENT
 * Faith. The draft asked whether KOOS should offer faith-based perspectives.
 * That is special-category data under Article 9, which needs EXPLICIT consent
 * and raises the bar on the whole processing record, as docs/gdpr/ in the
 * private repository sets out for the survey's own faith question. An ad
 * landing page, reached before anyone has read anything or holds an account,
 * is the worst place to ask it. It belongs in the product, after sign-in, as a
 * setting with its own consent. Do not add it here.
 *
 * FOUR OR FIVE OPTIONS, NEVER TEN. One screen, one question, instant advance.
 * A ten-option list is survey grammar and it is what makes a funnel feel long.
 */

/**
 * Not 'q1'. That collides with the survey's question id namespace, where ids
 * are q1 to q38, and the hardcoded-identifier guard in tests/instrument.test.ts
 * flagged it on the first run. The guard was right: a version string that is
 * indistinguishable from a question id is a trap for whoever reads a row next.
 */
export const QUIZ_VERSION = 'quiz-v1'

export type QuizQuestion = {
  id: string
  /** Shown as the screen's heading. Short enough to read at a glance. */
  text: string
  /** One line under the heading, where the question needs framing. */
  help?: string
  options: readonly string[]
  /** Multi-select questions take up to `maxSelections` answers. */
  multiple?: boolean
  maxSelections?: number
}

export const QUESTIONS = [
  {
    id: 'status',
    text: 'Where are you right now?',
    options: [
      'Dating someone',
      'In a committed relationship',
      'Married or engaged',
      'Single at the moment',
      'Separated or divorced',
    ],
  },
  {
    id: 'state',
    text: 'How does it feel at the moment?',
    options: [
      'Good, most of the time',
      'Good, with some hard patches',
      'A real mix',
      'Harder than it has been',
      'I would rather not say',
    ],
  },
  {
    id: 'escalates',
    text: 'When a disagreement happens, how often does it end up being about something worse than the thing it started as?',
    help: 'This is the one we will ask you again later, so you can see it change.',
    options: ['Almost always', 'Often', 'Sometimes', 'Rarely', 'Almost never'],
  },
  {
    id: 'reaction',
    text: 'In the moment, what do you usually do?',
    options: [
      'Answer straight away, sometimes heated',
      'Explain myself, or defend my side',
      'Go quiet, or walk away',
      'Try to fix it right there',
      'Take time before I say anything',
    ],
  },
  {
    id: 'challenge',
    text: 'What is hardest for you?',
    options: [
      'Saying what I actually mean',
      'Staying steady when it gets heated',
      'Understanding where they are coming from',
      'Stopping a disagreement escalating',
      'The same thing happening again and again',
    ],
  },
  {
    id: 'goal',
    text: 'If one thing changed, what would it be?',
    options: [
      'We talk more openly',
      'We argue without it turning into a wound',
      'We feel close again',
      'I understand myself better',
      'We break the pattern we keep repeating',
    ],
  },
  {
    id: 'when',
    text: 'When would you want KOOS there?',
    help: 'Choose up to three.',
    multiple: true,
    maxSelections: 3,
    options: [
      'When I am upset and need to settle',
      'Before a conversation I am dreading',
      'Before I send a message I might regret',
      'After an argument, to work out what happened',
      'When I notice the same problem returning',
    ],
  },
  {
    id: 'guide',
    text: 'How should KOOS talk to you?',
    options: [
      'Short questions that make me think',
      'Clear steps to follow',
      'A conversation, where I explain the situation',
      'Practical suggestions I can use straight away',
    ],
  },
] as const satisfies readonly QuizQuestion[]

/**
 * The same list, widened.
 *
 * `QUESTIONS` is `as const` so that `QuestionId` is a union of the real ids
 * rather than `string`. The cost is that TypeScript then types each entry by
 * exactly the keys it has, and `multiple` is absent from the seven
 * single-select questions, so reading it anywhere is an error. Iterate over
 * this; read ids and options from `QUESTIONS`.
 */
export const QUIZ: readonly QuizQuestion[] = QUESTIONS

export const TOTAL_QUESTIONS = QUESTIONS.length

/** Every id, derived. Nothing downstream may spell one out. */
export const QUESTION_IDS = QUESTIONS.map((q) => q.id)
export type QuestionId = (typeof QUESTIONS)[number]['id']

/** Answers in progress. A single-select holds one string, a multi holds many. */
export type QuizAnswers = Partial<Record<string, string[]>>

/**
 * The result paths.
 *
 * Product terms are fixed and spelled exactly as the brief defines them:
 * Reaction Interrupt, Before You Send, Challenge Me, Two Truths, Outcome
 * Feedback, Relationship Playbook. They are never paraphrased in copy.
 */
export const PATHS = {
  interrupt: {
    id: 'interrupt',
    name: 'Reaction Interrupt',
    headline: 'You answer fast, and you pay for it afterwards',
    body:
      'The gap between feeling something and saying it is where most of the damage happens. ' +
      'KOOS starts there: a short pause, two questions, and the thing you actually meant.',
  },
  beforeYouSend: {
    id: 'beforeYouSend',
    name: 'Before You Send',
    headline: 'The message you are about to send is the one to look at',
    body:
      'Written words land harder than spoken ones and they stay there. ' +
      'KOOS reads it with you first, and asks what you want them to feel when they read it.',
  },
  twoTruths: {
    id: 'twoTruths',
    name: 'Two Truths',
    headline: 'You are both right about something',
    body:
      'Most arguments are two reasonable people describing different halves of the same thing. ' +
      'KOOS helps you hold both at once, which is harder than it sounds and changes everything.',
  },
  playbook: {
    id: 'playbook',
    name: 'Relationship Playbook',
    headline: 'It is the same argument, wearing different clothes',
    body:
      'A pattern you can name is a pattern you can interrupt. ' +
      'KOOS keeps track of what keeps coming back, and what actually worked last time.',
  },
} as const

export type PathId = keyof typeof PATHS

/**
 * Which path someone lands on.
 *
 * Deliberately simple and deliberately readable. This is a funnel, not a
 * diagnosis, and a result nobody can explain is a result nobody trusts. The
 * order matters: the first rule that matches wins, so the most specific signal
 * is checked first.
 *
 * It never returns "nothing". Someone who skipped every question still gets a
 * path, because a blank result screen after eight questions is a broken promise.
 */
export function resultPath(answers: QuizAnswers): PathId {
  const has = (id: string, text: string) => (answers[id] ?? []).includes(text)
  const first = (id: string) => (answers[id] ?? [])[0]

  // Said outright that the same thing keeps returning. Nothing beats being told.
  if (
    has('challenge', 'The same thing happening again and again') ||
    has('goal', 'We break the pattern we keep repeating')
  ) {
    return 'playbook'
  }

  // Asked for help with messages specifically.
  if (has('when', 'Before I send a message I might regret')) {
    return 'beforeYouSend'
  }

  // Reacts fast, or escalation is frequent: the gap before speaking is the work.
  const reaction = first('reaction')
  const escalates = first('escalates')
  if (
    reaction === 'Answer straight away, sometimes heated' ||
    reaction === 'Explain myself, or defend my side' ||
    escalates === 'Almost always' ||
    escalates === 'Often'
  ) {
    return 'interrupt'
  }

  // Withdrawing, or struggling to see their side, is a different problem.
  if (
    reaction === 'Go quiet, or walk away' ||
    has('challenge', 'Understanding where they are coming from')
  ) {
    return 'twoTruths'
  }

  return 'interrupt'
}

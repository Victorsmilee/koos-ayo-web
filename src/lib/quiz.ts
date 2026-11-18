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
 * Every question here changes what KooS does on someone's first day. The
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
 * Faith. The draft asked whether KooS should offer faith-based perspectives.
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
    text: 'When would you want KooS there?',
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
    text: 'How should KooS talk to you?',
    options: [
      'Short questions that make me think',
      'Clear steps to follow',
      'A conversation, where I explain the situation',
      'Practical suggestions I can use straight away',
    ],
  },
] as const satisfies readonly QuizQuestion[]

/**
 * THE SOLO PATH.
 *
 * Someone who answers the first question with "Single at the moment" or
 * "Separated or divorced" does not get the rest of the main path. They used
 * to, and it was the worst thing about the quiz: six screens asking how a
 * relationship feels, ending on "If one thing changed, what would it be?"
 * whose options all begin with "We". Offering those two answers and then
 * ignoring them is worse than not offering them.
 *
 * Four questions instead of seven, about patterns rather than a partner, and
 * all of it in the past tense. The last one ends where the Product Owner's
 * original question 9 ended, on preparing for a healthier future relationship,
 * because that is the honest version of what KooS offers someone who is not
 * with anyone right now.
 *
 * Separate ids, not reworded versions of the main ones. "What was hardest"
 * answered about a relationship that ended is not the same measurement as
 * "what is hardest" answered about one that is happening, and putting both
 * under one id would quietly average two different questions together.
 */
export const SOLO_QUESTIONS = [
  {
    id: 'soloLooking',
    text: 'Looking back, what came up most often?',
    options: [
      'Not being able to talk about the hard things',
      'Trust, once it was damaged',
      'The same argument, over and over',
      'Drifting apart without a row',
      'I could not say what I actually needed',
    ],
  },
  {
    id: 'soloReaction',
    text: 'When it got difficult, what did you usually do?',
    options: [
      'Answered straight away, sometimes heated',
      'Explained myself, or defended my side',
      'Went quiet, or walked away',
      'Tried to fix it right there',
      'Took time before I said anything',
    ],
  },
  {
    id: 'soloPattern',
    text: 'Has any of that shown up with more than one person?',
    help: 'An honest answer here is more useful than a flattering one.',
    options: [
      'Yes, more than once',
      'Once or twice',
      'Not that I have noticed',
      'I have not thought about it that way',
    ],
  },
  {
    id: 'soloGoal',
    text: 'What would you want to be different next time?',
    options: [
      'Say what I mean, earlier',
      'Stay steady when it gets heated',
      'Notice a pattern before it repeats',
      'Understand myself and what I need',
      'Prepare myself for a healthier future relationship',
    ],
  },
] as const satisfies readonly QuizQuestion[]

/**
 * The answers to the first question that send someone down the solo path.
 *
 * Derived from the instrument rather than written out: these strings are
 * options on `status`, and a test asserts each one still exists there. If an
 * option is reworded and this is not, the branch silently stops firing and
 * everybody gets the partnered path again.
 */
export const SOLO_STATUSES = [
  'Single at the moment',
  'Separated or divorced',
] as const

/** Whether an answer to the first question means the solo path. */
export function isSolo(answers: QuizAnswers): boolean {
  const status = (answers[QUESTIONS[0].id] ?? [])[0]
  return (SOLO_STATUSES as readonly string[]).includes(status ?? '')
}

/**
 * The questions actually asked, given what has been answered so far.
 *
 * The first question is always the same one; everything after it depends on
 * the answer to it. The client reads its length for "3 of 5", so a branch
 * cannot leave the counter claiming a total nobody will reach.
 */
export function questionsFor(answers: QuizAnswers): readonly QuizQuestion[] {
  return isSolo(answers)
    ? [QUESTIONS[0] as QuizQuestion, ...(SOLO_QUESTIONS as readonly QuizQuestion[])]
    : (QUESTIONS as readonly QuizQuestion[])
}

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

/** The solo path: the first question, then four. */
export const TOTAL_SOLO_QUESTIONS = 1 + SOLO_QUESTIONS.length

/** Every id, derived. Nothing downstream may spell one out. */
export const QUESTION_IDS = [...QUESTIONS, ...SOLO_QUESTIONS].map((q) => q.id)

/** Every question on either path, for validating an answers payload. */
export const ALL_QUESTIONS: readonly QuizQuestion[] = [
  ...(QUESTIONS as readonly QuizQuestion[]),
  ...(SOLO_QUESTIONS as readonly QuizQuestion[]),
]
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
/*
 * [PROPOSED] `does` and `gives` are new product claims, written for the result
 * screen so that someone reads what they actually get rather than a feature
 * name they have never heard. The six feature NAMES come from MVP Brief v2 and
 * are fixed. These descriptions of them do not, and need Product Owner
 * approval before they count as baseline.
 *
 * They are deliberately concrete and small. "Understand your patterns" is the
 * kind of promise that sounds like every other app; "a warning when it starts
 * again" is something a person can picture happening to them on a Tuesday.
 */
export const PATHS = {
  interrupt: {
    id: 'interrupt',
    name: 'Reaction Interrupt',
    does: 'Catches you in the ten seconds before you say the thing you cannot take back.',
    gives: [
      'A pause, right when you feel it rising',
      'Two questions that get you to what you actually mean',
      'The sentence you meant, ready to say',
    ],
    headline: 'You answer fast, and you pay for it afterwards',
    body:
      'The gap between feeling something and saying it is where most of the damage happens. ' +
      'KooS starts there: a short pause, two questions, and the thing you actually meant.',
  },
  beforeYouSend: {
    id: 'beforeYouSend',
    name: 'Before You Send',
    does: 'Reads the message with you before it goes, while you can still change it.',
    gives: [
      'How it is likely to land when they read it',
      'What it says that you did not mean to say',
      'The same point, without the part that wounds',
    ],
    headline: 'The message you are about to send is the one to look at',
    body:
      'Written words land harder than spoken ones and they stay there. ' +
      'KooS reads it with you first, and asks what you want them to feel when they read it.',
  },
  twoTruths: {
    id: 'twoTruths',
    name: 'Two Truths',
    does: 'Separates what actually happened from what you concluded about it.',
    gives: [
      'Your side, written down clearly',
      'Their side, taken seriously',
      'The part you both already agree on',
    ],
    headline: 'You are both right about something',
    body:
      'Most arguments are two reasonable people describing different halves of the same thing. ' +
      'KooS helps you hold both at once, which is harder than it sounds and changes everything.',
  },
  playbook: {
    id: 'playbook',
    name: 'Relationship Playbook',
    does: 'Keeps track of the argument you keep having, and what ended it last time.',
    gives: [
      'The pattern, named, so you can see it coming',
      'What worked last time, and what made it worse',
      'A quiet warning when it starts again',
    ],
    headline: 'It is the same argument, wearing different clothes',
    body:
      'A pattern you can name is a pattern you can interrupt. ' +
      'KooS keeps track of what keeps coming back, and what actually worked last time.',
  },
} as const

export type PathId = keyof typeof PATHS

/**
 * The result copy for the solo path.
 *
 * The partnered version says "your next disagreement" and "your partner",
 * which is the wrong tense and the wrong person for somebody who is not with
 * anyone. Same four destinations, because they are product features and they
 * apply either way; different sentences, because the situation is different.
 */
export const SOLO_PATHS: Record<PathId, { headline: string; body: string }> = {
  interrupt: {
    headline: 'The gap between feeling it and saying it',
    body:
      'That gap is where most of the damage happened, and it is the most practical thing to change ' +
      'before the next relationship rather than during it. KooS starts there: a short pause, two ' +
      'questions, and the thing you actually meant.',
  },
  beforeYouSend: {
    headline: 'The message you are about to send is the one to look at',
    body:
      'Written words land harder than spoken ones and they stay there. KooS reads it with you ' +
      'first, and asks what you want them to feel when they read it.',
  },
  twoTruths: {
    headline: 'Going quiet is a position too',
    body:
      'Withdrawing feels like avoiding a fight, and it usually reads as leaving. KooS helps you ' +
      'say the thing that is actually true for you while there is still a conversation to have.',
  },
  playbook: {
    headline: 'It followed you, and that is worth knowing',
    body:
      'A pattern that turns up with more than one person is the most useful thing you can bring ' +
      'to the next relationship. A pattern you can name is one you can interrupt.',
  },
}

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

  /*
   * The solo path first, and separately, because the same words mean different
   * things in the past tense. "Went quiet, or walked away" about a
   * relationship that ended is a pattern to notice; the present-tense version
   * is a conversation to get through tonight.
   */
  if (isSolo(answers)) {
    if (
      first('soloPattern') === 'Yes, more than once' ||
      has('soloLooking', 'The same argument, over and over') ||
      has('soloGoal', 'Notice a pattern before it repeats')
    ) {
      return 'playbook'
    }
    const past = first('soloReaction')
    if (
      past === 'Answered straight away, sometimes heated' ||
      past === 'Explained myself, or defended my side'
    ) {
      return 'interrupt'
    }
    if (
      past === 'Went quiet, or walked away' ||
      has('soloLooking', 'Drifting apart without a row')
    ) {
      return 'twoTruths'
    }
    return 'playbook'
  }

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

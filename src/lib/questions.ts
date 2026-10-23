/**
 * The AYO Relationship Study, questionnaire v3.
 *
 * SOURCE OF TRUTH. Every intro line, question, option and the thank-you text is
 * reproduced verbatim from the approved instrument. Do not reword, add or remove
 * anything here without Product Owner sign-off: this is a research instrument and
 * changing wording invalidates comparison across responses.
 *
 * [TEAM TO CONFIRM] placeholders are deliberately left visible. They are launch
 * blockers (INF-63), not defaults to invent.
 */

export type QuestionKind = 'one' | 'many' | 'text' | 'email'

export interface Question {
  /** Stable key used as the JSON key in research_responses.answers */
  id: string
  /** Number as printed on the instrument */
  number: number
  text: string
  kind: QuestionKind
  /** Printed instruction, e.g. "(Select one)" */
  instruction?: string
  /** Italic helper printed under the question */
  helper?: string
  options?: string[]
  /** Max selections for "Select up to N" questions */
  maxSelections?: number
  /** Whether an "Other: ____" free-text field is revealed by the last option */
  hasOther?: boolean
  optional?: boolean
}

export interface Section {
  index: number
  title: string
  helper?: string
  questions: Question[]
}

export const SURVEY_VERSION = 'v3'

// Confirmed 21 Oct 2026. These are promises to respondents, published in the
// privacy box and the privacy notice. Changing them needs PO sign-off.
export const RETENTION_PERIOD = '24 months'
export const CONTACT_EMAIL = 'hello@koos-ayo.com'

export const intro = {
  // Framing only. The study was renamed on 21 Oct 2026; no question, option,
  // helper or the thank-you text changed. "AYO" rather than "KOOS" keeps the
  // research identity separate from the product, so respondents are less likely
  // to read it as a sales form, which matters most for Q32/Q33.
  eyebrow: 'KOOS-AYO',
  title: 'The AYO Relationship Study',
  subtitle:
    'Help us understand what helps relationships become happier, healthier and last longer.',
  body:
    'We want to learn how people experience misunderstandings, conflict and emotionally difficult moments in romantic relationships, what they actually do in those moments, and what kind of support would help them respond better over time.',
  privacyHeading: 'Your privacy comes first',
  privacyPoints: [
    'This survey is anonymous. Please do not include names or identifying details about yourself, your partner or anyone else.',
    'We are interested in what actually happens in relationships, and in patterns across many people. There are no right or wrong answers.',
    `Your answers are seen only by the KOOS research team. We use them for this research, and we may publish anonymous summary statistics: counts and percentages across all respondents, never your individual answers, never anything you typed, and never the faith question. They are kept for ${RETENTION_PERIOD}, then deleted.`,
    'You can skip any question and stop at any time.',
    'If you leave your email at the end, it is stored separately from your answers and used only to contact you about follow-up research.',
    `Questions about your data: ${CONTACT_EMAIL}`,
  ],
  /**
   * GDPR Article 9 explicit-consent line (INF-61). Q6 asks about religious
   * belief, which is special-category data. This is helper copy in the privacy
   * box, it does not reword any question or option.
   */
  articleNineNotice:
    'One question asks how important faith or religion is to you. That counts as sensitive personal data under GDPR. Answering it is optional: you can select "Prefer not to say" or skip it, and by continuing you consent to us processing it for this research.',
  closing:
    'Honest answers, including negative experiences, are the most useful. Go with your first instinct rather than the answer that sounds best. The survey takes about 8 minutes; the three open-text questions are optional.',
}

export const consentQuestion: Question = {
  id: 'q1',
  number: 1,
  text: 'I am 18 or older and agree to take part in this research.',
  kind: 'one',
  instruction: '(Select one)',
  options: ['Yes, continue', 'No (thank you, the survey ends here)'],
}

/** Selecting this on Q1 ends the survey immediately. */
export const CONSENT_DECLINE = 'No (thank you, the survey ends here)'

export const sections: Section[] = [
  {
    index: 1,
    title: 'About you',
    questions: [
      {
        id: 'q2',
        number: 2,
        text: 'What is your age range?',
        kind: 'one',
        instruction: '(Select one)',
        options: ['18–24', '25–34', '35–44', '45–54', '55–64', '65 or older', 'Prefer not to say'],
      },
      {
        id: 'q3',
        number: 3,
        text: 'What is your current relationship status?',
        kind: 'one',
        instruction: '(Select one)',
        helper:
          'If you are not in a relationship right now, please answer the rest of the survey thinking about your most recent relationship.',
        options: [
          'Dating',
          'In a committed relationship',
          'Engaged',
          'Married',
          'Separated',
          'Divorced',
          'Single',
          'Prefer not to say',
        ],
      },
      {
        id: 'q4',
        number: 4,
        text: 'How long have you been in your current (or most recent) relationship?',
        kind: 'one',
        instruction: '(Select one)',
        options: [
          'Less than 6 months',
          '6–12 months',
          '1–2 years',
          '3–5 years',
          '6–10 years',
          '11–20 years',
          'More than 20 years',
          'Prefer not to say',
        ],
      },
      {
        id: 'q5',
        number: 5,
        text: 'Do you have children?',
        kind: 'many',
        instruction: '(Select all that apply)',
        options: [
          'No',
          'Expecting a child',
          'Yes, under 5 years old',
          'Yes, 5 years or older',
          'Prefer not to say',
        ],
      },
      {
        id: 'q6',
        number: 6,
        text: 'How important is faith or religion in how you approach your relationship?',
        kind: 'one',
        instruction: '(Select one)',
        // INF-61: inline optional marker for Article 9 special-category data.
        helper:
          'Optional. This question asks about religious belief, which is sensitive personal data under GDPR. You can skip it or select "Prefer not to say".',
        options: ['Very important', 'Somewhat important', 'Not important', 'Prefer not to say'],
      },
    ],
  },
  {
    index: 2,
    title: 'Your real relationship experience',
    helper: 'This section is about what actually happens, not what should happen.',
    questions: [
      {
        id: 'q7',
        number: 7,
        text: 'How often do you experience misunderstandings, disagreements or emotionally difficult moments in your relationship?',
        kind: 'one',
        instruction: '(Select one)',
        options: ['Very frequently', 'Frequently', 'Sometimes', 'Rarely', 'Almost never'],
      },
      {
        id: 'q8',
        number: 8,
        text: 'Do the same disagreements come up again and again?',
        kind: 'one',
        instruction: '(Select one)',
        options: ['Yes, often', 'Sometimes', 'Rarely', 'Never', 'Not sure'],
      },
      {
        id: 'q9',
        number: 9,
        text: 'When a difficult moment happens, what do you actually do in the moment?',
        kind: 'many',
        instruction: '(Select all that apply)',
        hasOther: true,
        options: [
          'Raise my voice',
          'Criticise or blame',
          'Get defensive',
          'Go quiet or withdraw',
          'Leave the room',
          'Give the silent treatment',
          'Send a message I later regret',
          'Keep pushing until it is resolved',
          'Take time to calm down first',
          'Stay calm and talk it through',
          'Other',
        ],
      },
      {
        id: 'q10',
        number: 10,
        text: 'How do difficult moments usually end?',
        kind: 'many',
        instruction: '(Select all that apply)',
        hasOther: true,
        options: [
          'We talk it through and resolve it',
          'One of us apologises',
          'We move on without discussing it',
          'It comes back in a later argument',
          'It stays unresolved',
          'Other',
        ],
      },
      {
        id: 'q11',
        number: 11,
        text: 'After a difficult moment, how long does it usually take until things feel okay again?',
        kind: 'one',
        instruction: '(Select one)',
        options: [
          'Within an hour',
          'The same day',
          '1–2 days',
          'Several days',
          'A week or more',
          'It often never fully feels okay',
        ],
      },
      {
        id: 'q12',
        number: 12,
        text: 'How often do you later think, "I wish I had handled that differently"?',
        kind: 'one',
        instruction: '(Select one)',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'],
      },
      {
        id: 'q13',
        number: 13,
        text: 'In those moments, what do you wish you could do differently?',
        kind: 'many',
        instruction: '(Select up to 3)',
        maxSelections: 3,
        hasOther: true,
        options: [
          'Stay calm instead of reacting',
          'Explain what I need clearly',
          "Understand my partner's side",
          'Not say things I regret',
          'Repair faster afterwards',
          'Raise issues before they build up',
          'Nothing, I am usually happy with how I respond',
          'Other',
        ],
      },
      {
        id: 'q14',
        number: 14,
        text: 'Think about the last difficult situation in your relationship. What was the hardest part?',
        kind: 'text',
        instruction: '(Optional)',
        optional: true,
      },
    ],
  },
  {
    index: 3,
    title: 'Support you use today',
    questions: [
      {
        id: 'q15',
        number: 15,
        text: 'When you need help with a relationship problem, where do you currently turn?',
        kind: 'many',
        instruction: '(Select all that apply)',
        hasOther: true,
        options: [
          'Partner',
          'Friends or family',
          'Therapist or counsellor',
          'Religious or faith leader',
          'Books, podcasts or YouTube',
          'Google or other search engines',
          'ChatGPT or another AI tool',
          'Relationship apps',
          'I usually deal with it myself',
          'Other',
        ],
      },
      {
        id: 'q16',
        number: 16,
        text: 'In the past 12 months, have you tried anything to improve how you handle relationship difficulties (for example a book, course, counselling, coaching or an app)?',
        kind: 'one',
        instruction: '(Select one)',
        options: ['No', 'Yes, only free things', 'Yes, and I paid for at least one of them'],
      },
      {
        id: 'q17',
        number: 17,
        text: 'How satisfied are you with the support currently available to you?',
        kind: 'one',
        instruction: '(Select one)',
        options: [
          'Very dissatisfied',
          'Dissatisfied',
          'Neutral',
          'Satisfied',
          'Very satisfied',
          "I don't use any support",
        ],
      },
      {
        id: 'q18',
        number: 18,
        text: 'What is missing from the support you use today?',
        kind: 'text',
        instruction: '(Optional)',
        optional: true,
      },
    ],
  },
  {
    index: 4,
    title: 'A new kind of support',
    questions: [
      {
        id: 'q19',
        number: 19,
        text: 'How useful would this type of support be to you?',
        kind: 'one',
        instruction: '(Select one)',
        options: [
          'Not useful at all',
          'Slightly useful',
          'Moderately useful',
          'Very useful',
          'Extremely useful',
        ],
      },
      {
        id: 'q20',
        number: 20,
        text: 'Which parts would be most useful to you?',
        kind: 'many',
        instruction: '(Select up to 3)',
        maxSelections: 3,
        hasOther: true,
        options: [
          'Understanding my feelings and my automatic reaction',
          'Separating facts from my assumptions',
          "Seeing my partner's possible perspective",
          'Being challenged on my own thinking',
          'Preparing or reviewing what I want to say',
          'Reflecting after a difficult interaction',
          'Spotting patterns that keep repeating',
          'Learning over time what works for me',
          'Short guided relationship exercises',
          'Other',
        ],
      },
      {
        id: 'q21',
        number: 21,
        text: 'When would you realistically open it?',
        kind: 'many',
        instruction: '(Select all that apply)',
        options: [
          'Before a difficult conversation',
          'During a difficult moment, while I am still upset',
          'Right after a difficult moment',
          'Later that day or the next day',
          'Regularly, not only when something goes wrong',
          'Not sure',
        ],
      },
      {
        id: 'q22',
        number: 22,
        text: 'How comfortable would you be using a short guided process such as: What happened? → What are you feeling? → What are you assuming? → What outcome do you want? → How do you want to respond?',
        kind: 'one',
        instruction: '(Select one)',
        options: [
          'Very uncomfortable',
          'Uncomfortable',
          'Neutral',
          'Comfortable',
          'Very comfortable',
        ],
      },
      {
        id: 'q23',
        number: 23,
        text: 'After using it, would you come back later to note what happened and whether it helped, so it can learn what works for you?',
        kind: 'one',
        instruction: '(Select one)',
        options: [
          'Yes, regularly',
          'Sometimes',
          'Only if it takes less than a minute',
          'Probably not',
          'Not sure',
        ],
      },
      {
        id: 'q24',
        number: 24,
        text: 'Would you use it even if your partner never did?',
        kind: 'one',
        instruction: '(Select one)',
        options: ['Yes', 'Probably', 'Only if my partner used it too', 'No', 'Not sure'],
      },
      {
        id: 'q25',
        number: 25,
        text: 'Do you think your partner would be open to using something like this?',
        kind: 'one',
        instruction: '(Select one)',
        options: ['Yes', 'Maybe', 'No', 'Not sure', 'I would prefer to use it privately'],
      },
    ],
  },
  {
    index: 5,
    title: 'Trust, privacy and safety',
    helper:
      'Relationship experiences are personal. Privacy and control would be central to this product.',
    questions: [
      {
        id: 'q26',
        number: 26,
        text: 'What would make you trust a relationship-support app like this?',
        kind: 'many',
        instruction: '(Select all that apply)',
        hasOther: true,
        options: [
          'Strong privacy and security controls',
          'Clear explanation of how my data is used',
          'Being able to see, correct and delete what the app remembers',
          'Private use without involving my partner',
          'No judgement',
          'Balanced perspectives rather than automatically taking my side',
          'Being open about what AI can and cannot do',
          'Evidence-based exercises',
          'Human or professional support when needed',
          'Other',
        ],
      },
      {
        id: 'q27',
        number: 27,
        text: 'What would be your biggest concerns about using an AI-powered relationship-support app?',
        kind: 'many',
        instruction: '(Select up to 3)',
        maxSelections: 3,
        hasOther: true,
        options: [
          'Privacy',
          'Data security',
          'AI giving bad advice',
          'AI misunderstanding my situation',
          "AI taking my partner's side",
          'AI taking my side without enough context',
          'Becoming too dependent on the app',
          'My partner accessing my information',
          'Information being sold or shared',
          'The app being too generic',
          'Cost',
          'Other',
        ],
      },
      {
        id: 'q28',
        number: 28,
        text: 'How comfortable would you be sharing private relationship experiences with an AI-powered app if you had clear control over what it remembers?',
        kind: 'one',
        instruction: '(Select one)',
        options: [
          'Very uncomfortable',
          'Uncomfortable',
          'Neutral',
          'Comfortable',
          'Very comfortable',
        ],
      },
    ],
  },
  {
    index: 6,
    title: 'How you would use it',
    questions: [
      {
        id: 'q29',
        number: 29,
        text: 'How often do you think you would realistically use something like this?',
        kind: 'one',
        instruction: '(Select one)',
        options: [
          'Several times a week',
          'About once a week',
          'A few times a month',
          'Once a month or less',
          'Only during serious relationship problems',
          'I probably would not use it',
        ],
      },
      {
        id: 'q30',
        number: 30,
        text: 'What would make you come back to it regularly?',
        kind: 'many',
        instruction: '(Select up to 2)',
        maxSelections: 2,
        hasOther: true,
        options: [
          'It helped in a real situation',
          'It remembered my situation, so I did not have to repeat myself',
          'It showed my patterns or progress over time',
          'Short exercises I can do quickly',
          'Gentle reminders or check-ins',
          'Other',
        ],
      },
      {
        id: 'q31',
        number: 31,
        text: 'What would make you stop using it?',
        kind: 'many',
        instruction: '(Select up to 2)',
        maxSelections: 2,
        hasOther: true,
        options: [
          'Advice felt generic',
          'It felt like it was taking sides',
          'It took too much time',
          'Privacy worries',
          'I did not see any improvement',
          'My partner found out I was using it',
          'Cost',
          'Other',
        ],
      },
    ],
  },
  {
    index: 7,
    title: 'Value',
    questions: [
      {
        id: 'q32',
        number: 32,
        text: 'If it genuinely helped you handle difficult situations better and improve your relationship over time, would you consider paying for it?',
        kind: 'one',
        instruction: '(Select one)',
        options: [
          'Definitely yes',
          'Probably yes',
          'Maybe',
          'Probably not',
          'Definitely not',
        ],
      },
      {
        id: 'q33',
        number: 33,
        text: 'What monthly price would feel reasonable if it delivered that value?',
        kind: 'one',
        instruction: '(Select one)',
        options: [
          'I would only use a free version',
          'Less than €5 per month',
          '€5–10 per month',
          '€10–20 per month',
          'More than €20 per month',
          'Not sure',
        ],
      },
      {
        id: 'q34',
        number: 34,
        text: 'What is the most you would pay per month before it stops feeling worth it?',
        kind: 'one',
        instruction: '(Select one)',
        options: [
          'I would not pay anything',
          'Up to €5 per month',
          'Up to €10 per month',
          'Up to €20 per month',
          'More than €20 per month',
          'Not sure',
        ],
      },
      {
        id: 'q35',
        number: 35,
        text: 'If it genuinely helped you, would you recommend it to a friend or family member?',
        kind: 'one',
        instruction: '(Select one)',
        options: [
          'Definitely yes',
          'Probably yes',
          'Maybe',
          'Probably not',
          'Definitely not',
        ],
      },
    ],
  },
  {
    index: 8,
    title: 'One last thing',
    questions: [
      {
        id: 'q36',
        number: 36,
        text: 'Would you be interested in a short follow-up interview or testing an early version?',
        kind: 'one',
        instruction: '(Select one)',
        options: ['Yes', 'Maybe', 'No'],
      },
      {
        id: 'q37',
        number: 37,
        text: 'If yes, please leave your email address.',
        kind: 'email',
        instruction:
          '(Optional. Stored separately from your answers and used only for follow-up research)',
        optional: true,
      },
      {
        id: 'q38',
        number: 38,
        text: 'Is there anything else you would like to tell us?',
        kind: 'text',
        instruction: '(Optional)',
        optional: true,
      },
    ],
  },
]

/** Shown above Q19. Verbatim concept description from the instrument. */
export const conceptBox = {
  paragraphs: [
    'Imagine a private relationship-support app that helps you slow down before reacting. It helps you understand what happened, identify what you are feeling and what you are tempted to do, separate facts from assumptions, consider another perspective, clarify what you actually want, choose how to respond, and later learn from what happened.',
    'The goal is not to decide who is right. It is to help you respond more intentionally and, over time, build healthier relationship patterns.',
  ],
}

export const thankYou = {
  heading: 'Thank you.',
  body: 'Your answers will help us understand what people genuinely need to build happier, healthier relationships that last, and what should not be built.',
  safety:
    'If anything in this survey raised concerns about your safety or wellbeing, please contact your local emergency services or a support service in your country.',
}

/** Shown when Q1 is declined. */
export const declineMessage = {
  heading: 'Thank you.',
  body: 'The survey ends here. Thank you for your time.',
}

/** Q35 is shown only when Q34 is one of these. */
export const EMAIL_SHOWN_WHEN = ['Yes', 'Maybe']

export const allQuestions: Question[] = [
  consentQuestion,
  ...sections.flatMap((s) => s.questions),
]

export const TOTAL_SECTIONS = sections.length

/**
 * The email question, found by its kind rather than written down. Nothing else
 * in the codebase may name it by id: it is the one answer that must never reach
 * the answers table, and a renumbered instrument silently breaking that promise
 * is the failure this derivation exists to prevent.
 */
const emailQuestion = allQuestions.find((q) => q.kind === 'email')!

export const EMAIL_QUESTION_ID = emailQuestion.id

/**
 * The email question is shown only when the question immediately before it was
 * answered with one of EMAIL_SHOWN_WHEN. That adjacency is not an assumption
 * about ordering: the email question's own text begins "If yes", which only
 * refers to the question before it. A test asserts both halves.
 */
export const EMAIL_GATE_QUESTION_ID =
  allQuestions[allQuestions.indexOf(emailQuestion) - 1].id

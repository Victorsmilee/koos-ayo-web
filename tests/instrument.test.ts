import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import {
  CONSENT_DECLINE,
  CONTACT_EMAIL,
  Q35_SHOWN_WHEN,
  RETENTION_PERIOD,
  allQuestions,
  consentQuestion,
  intro,
  sections,
  thankYou,
} from '../src/lib/questions'
import { answersSchema } from '../src/lib/validation'

/**
 * Guards on the research instrument itself.
 *
 * These exist because the questionnaire is a measuring device: silently
 * dropping a question or loosening a selection limit would invalidate
 * comparison across responses without anything visibly breaking.
 */

test('the instrument has exactly 36 questions, q1 to q36, no duplicates', () => {
  assert.equal(allQuestions.length, 36)
  const ids = allQuestions.map((q) => q.id)
  assert.equal(new Set(ids).size, 36, 'duplicate question id')
  for (let n = 1; n <= 36; n++) {
    assert.ok(ids.includes(`q${n}`), `missing q${n}`)
  }
})

test('question numbers match their ids', () => {
  for (const q of allQuestions) {
    assert.equal(`q${q.number}`, q.id, `${q.id} is numbered ${q.number}`)
  }
})

test('there are 8 sections, indexed 1 to 8', () => {
  assert.equal(sections.length, 8)
  assert.deepEqual(
    sections.map((s) => s.index),
    [1, 2, 3, 4, 5, 6, 7, 8],
  )
})

test('selection limits match the printed instrument', () => {
  const limits = Object.fromEntries(
    allQuestions.filter((q) => q.maxSelections).map((q) => [q.id, q.maxSelections]),
  )
  assert.deepEqual(limits, { q13: 3, q20: 3, q27: 3, q30: 2, q31: 2 })
})

test('Q1 is the only required question and offers exactly two options', () => {
  assert.equal(consentQuestion.id, 'q1')
  assert.equal(consentQuestion.options?.length, 2)
  assert.ok(consentQuestion.options?.includes(CONSENT_DECLINE))
  // Every other question is skippable: none is marked required anywhere.
  const required = allQuestions.filter((q) => q.id !== 'q1' && q.optional === false)
  assert.equal(required.length, 0)
})

test('Q35 is gated on Q34 being Yes or Maybe, and those are real Q34 options', () => {
  const q34 = allQuestions.find((q) => q.id === 'q34')!
  for (const value of Q35_SHOWN_WHEN) {
    assert.ok(q34.options?.includes(value), `${value} is not an option on Q34`)
  }
  assert.ok(!Q35_SHOWN_WHEN.includes('No'))
})

test('Q35 is the email question and the only one of its kind', () => {
  const emails = allQuestions.filter((q) => q.kind === 'email')
  assert.equal(emails.length, 1)
  assert.equal(emails[0].id, 'q35')
})

test('the three optional free-text questions are q14, q18 and q36', () => {
  const text = allQuestions.filter((q) => q.kind === 'text').map((q) => q.id)
  assert.deepEqual(text, ['q14', 'q18', 'q36'])
  assert.ok(allQuestions.filter((q) => q.kind === 'text').every((q) => q.optional))
})

test('the survey makes no unfilled promises to respondents', () => {
  // INF-63. These two values are published in the privacy box and the privacy
  // notice, so a placeholder reaching production would be a broken promise, not
  // a cosmetic bug. This test is what stops that regressing.
  for (const [name, value] of [
    ['RETENTION_PERIOD', RETENTION_PERIOD],
    ['CONTACT_EMAIL', CONTACT_EMAIL],
  ] as const) {
    assert.ok(!value.includes('TEAM TO CONFIRM'), `${name} is still a placeholder`)
    assert.ok(value.trim().length > 0, `${name} is empty`)
  }

  assert.equal(RETENTION_PERIOD, '24 months')
  assert.match(CONTACT_EMAIL, /^[^@\s]+@koos-ayo\.com$/)
})

test('no [TEAM TO CONFIRM] placeholder survives anywhere in the instrument', () => {
  const surfaces = [
    ...intro.privacyPoints,
    intro.body,
    intro.closing,
    intro.articleNineNotice,
    ...allQuestions.flatMap((q) => [q.text, q.helper ?? '', ...(q.options ?? [])]),
  ]
  const offenders = surfaces.filter((t) => t.includes('TEAM TO CONFIRM'))
  assert.deepEqual(offenders, [], 'unfilled placeholder shown to respondents')
})

test('consent covers publishing aggregates, and excludes what must never be published', () => {
  // INF-108. Respondents are anonymous, so consent cannot be obtained after the
  // fact: if this sentence is ever dropped, nothing collected afterwards can
  // lawfully appear on the public results page. The three exclusions are the
  // substance of the promise, not decoration - Q6 is Article 9 data and the
  // open-text answers are the one place someone may have identified themselves.
  const consent = intro.privacyPoints.join(' ')
  assert.match(consent, /publish anonymous summary statistics/)
  assert.match(consent, /never your individual answers/)
  assert.match(consent, /never anything you typed/)
  assert.match(consent, /never the faith question/)
})

test('respondents are told to answer on instinct rather than presentably', () => {
  // Aimed at social-desirability editing, which contaminates Q32 and Q33 worst.
  assert.match(intro.closing, /first instinct rather than the answer that sounds best/)
})

test('the study is named, and the instrument text is untouched by it', () => {
  // The rename on 21 Oct 2026 was framing only. These two assertions are what
  // stop a future copy tweak quietly altering the instrument: the title may be
  // branding, but the thank-you text is part of what respondents consented to.
  assert.equal(intro.title, 'The AYO Relationship Study')
  assert.equal(intro.eyebrow, 'KOOS-AYO')

  assert.equal(
    intro.subtitle,
    'Help us understand what helps relationships become happier, healthier and last longer.',
  )
  assert.equal(thankYou.heading, 'Thank you.')
  assert.equal(
    thankYou.body,
    'Your answers will help us understand what people genuinely need to build happier, healthier relationships that last, and what should not be built.',
  )
  assert.match(thankYou.safety, /^If anything in this survey raised concerns about your safety/)
})

test('Q1 and Q6 read exactly as approved', () => {
  assert.equal(
    consentQuestion.text,
    'I am 18 or older and agree to take part in this research.',
  )
  const q6 = allQuestions.find((q) => q.id === 'q6')!
  assert.equal(
    q6.text,
    'How important is faith or religion in how you approach your relationship?',
  )
  assert.deepEqual(q6.options, [
    'Very important',
    'Somewhat important',
    'Not important',
    'Prefer not to say',
  ])
})

/* ----------------------------- validation ------------------------------ */

test('accepts a well-formed answer set', () => {
  const result = answersSchema.safeParse({
    q1: 'Yes, continue',
    q2: '25–34',
    q13: ['Stay calm instead of reacting', 'Repair faster afterwards'],
    q14: 'Free text is allowed here.',
  })
  assert.ok(result.success, JSON.stringify(result.error?.issues))
})

test('rejects more selections than the instrument allows', () => {
  const result = answersSchema.safeParse({
    q13: [
      'Stay calm instead of reacting',
      'Explain what I need clearly',
      'Not say things I regret',
      'Repair faster afterwards',
    ],
  })
  assert.equal(result.success, false)
})

test('rejects an option that is not on the instrument', () => {
  const result = answersSchema.safeParse({ q2: 'Not a real age range' })
  assert.equal(result.success, false)
})

test('allows free text in an Other field without matching an option', () => {
  const result = answersSchema.safeParse({
    q9: ['Other'],
    q9_other: 'I go for a walk.',
  })
  assert.ok(result.success, JSON.stringify(result.error?.issues))
})

test('rejects a key that is not a question id', () => {
  const result = answersSchema.safeParse({ email: 'someone@example.com' })
  assert.equal(result.success, false)
})

test('Q30 and Q31 allow at most two selections', () => {
  const twoOk = answersSchema.safeParse({
    q30: ['It helped in a real situation', 'Short exercises I can do quickly'],
  })
  assert.ok(twoOk.success)

  const threeNotOk = answersSchema.safeParse({
    q31: ['Advice felt generic', 'Privacy worries', 'Cost'],
  })
  assert.equal(threeNotOk.success, false)
})

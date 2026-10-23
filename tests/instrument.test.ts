import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  CONSENT_DECLINE,
  CONTACT_EMAIL,
  EMAIL_GATE_QUESTION_ID,
  EMAIL_QUESTION_ID,
  EMAIL_SHOWN_WHEN,
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

test('the instrument has exactly 38 questions, q1 to q38, no duplicates', () => {
  // 36 in questionnaire v3. Two were added on 23 Oct 2026, before any response
  // was collected: a price ceiling and a recommendation question. Nothing was
  // reworded. After the link is shared this number must never change again.
  assert.equal(allQuestions.length, 38)
  const ids = allQuestions.map((q) => q.id)
  assert.equal(new Set(ids).size, allQuestions.length, 'duplicate question id')
  for (let n = 1; n <= allQuestions.length; n++) {
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
  const required = allQuestions.filter(
    (q) => q.id !== consentQuestion.id && q.optional === false,
  )
  assert.equal(required.length, 0)
})

test('declining the follow-up never reveals the email question', () => {
  // The positive cases live in the derivation test below. This is the negative
  // one, and it is the one that matters: a respondent who said No must never be
  // shown the email field.
  assert.ok(!EMAIL_SHOWN_WHEN.includes('No'))
  const gate = allQuestions.find((q) => q.id === EMAIL_GATE_QUESTION_ID)!
  assert.ok(gate.options?.includes('No'), 'the gate must offer No at all')
})

test('the three optional free-text questions are q14, q18 and the last one', () => {
  const text = allQuestions.filter((q) => q.kind === 'text').map((q) => q.id)
  assert.deepEqual(text, ['q14', 'q18', allQuestions[allQuestions.length - 1].id])
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

test('no em or en dashes in src, docs, or the root markdown', () => {
  // Product Owner decision, 23 Oct 2026: these dashes read as machine writing.
  // Enforced here rather than remembered, because they return one paste at a
  // time. Use a comma, a colon or a full stop instead.
  //
  // En dashes BETWEEN DIGITS are allowed: '18-24' and '6-12 months' are answer
  // options reproduced from questionnaire v3, where an en dash is correct
  // typography for a range rather than the thing being removed. They are also
  // instrument text, so they must not be retyped regardless.
  const offenders: string[] = []
  const scan = (file: string) => {
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        const stripped = line.replace(/(?<=\d)–(?=\d)/g, '')
        if (stripped.includes('—') || stripped.includes('–')) {
          offenders.push(`${file}:${i + 1}`)
        }
      })
  }
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name)
      if (e.isDirectory()) walk(full)
      else if (/\.(ts|tsx|css|md)$/.test(e.name)) scan(full)
    }
  }
  walk('src')
  walk('docs')
  for (const f of ['CLAUDE.md', 'README.md', 'CHANGELOG.md']) scan(f)
  assert.deepEqual(offenders, [], 'em or en dash found')
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

test('the email question and its gate are derived, not written down', () => {
  const emails = allQuestions.filter((q) => q.kind === 'email')
  assert.equal(emails.length, 1, 'exactly one email question')
  assert.equal(EMAIL_QUESTION_ID, emails[0].id)

  // The gate is the question immediately before it, because the email
  // question's text begins "If yes" and that can only refer to its neighbour.
  const gateIndex = allQuestions.indexOf(emails[0]) - 1
  assert.equal(EMAIL_GATE_QUESTION_ID, allQuestions[gateIndex].id)
  assert.match(emails[0].text, /^If yes/i)

  // Every value that reveals the email question must be a real option on the
  // gate. A typo here would hide the question from everyone, silently.
  for (const value of EMAIL_SHOWN_WHEN) {
    assert.ok(
      allQuestions[gateIndex].options?.includes(value),
      `${value} is not an option on the gate question`,
    )
  }
})

test('no question id, table name or schema is hardcoded outside its source', () => {
  // Product Owner rule, 23 Oct 2026: nothing is hardcoded without approval.
  // questions.ts defines the instrument and supabase-server.ts defines the
  // database names; everywhere else must derive from them. This existed as a
  // real bug: 'q35' was spelled out in actions.ts and twice in
  // survey-client.tsx, so renumbering the instrument would have written
  // respondents' email addresses into the answers table.
  const sources = ['src/lib/questions.ts', 'src/lib/supabase-server.ts']
  const offenders: string[] = []
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name)
      if (e.isDirectory()) walk(full)
      else if (/\.(ts|tsx)$/.test(e.name) && !sources.includes(full)) {
        readFileSync(full, 'utf8')
          .split('\n')
          .forEach((line, i) => {
            const code = line.replace(/\/\/.*$/, '').replace(/^\s*\*.*$/, '')
            if (
              /'q\d+'|answers\.q\d+|'research_(responses|contacts)'/.test(code)
            ) {
              offenders.push(`${full}:${i + 1}`)
            }
          })
      }
    }
  }
  walk('src')
  assert.deepEqual(offenders, [], 'hardcoded identifier; derive it instead')
})

import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import {
  PATHS,
  QUESTIONS,
  QUIZ,
  QUIZ_VERSION,
  TOTAL_QUESTIONS,
  resultPath,
  type QuizAnswers,
} from '../src/lib/quiz'

/**
 * The quiz is a funnel, not the research instrument, so these do NOT freeze
 * wording. They assert the things that would be expensive to get wrong: that
 * it never asks about faith, that everyone reaches a result, that the options
 * stay short enough to work on a phone, and that answers and the study stay
 * apart.
 */

test('eight questions, four or five options each', () => {
  assert.equal(TOTAL_QUESTIONS, 8)
  for (const q of QUIZ) {
    assert.ok(
      q.options.length >= 4 && q.options.length <= 5,
      `${q.id} has ${q.options.length} options; a ten-option list is survey grammar and makes a funnel feel long`,
    )
  }
})

test('question ids are unique', () => {
  const ids = QUESTIONS.map((q) => q.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('the quiz never asks about faith or religion', () => {
  // Special category data under Article 9. It needs explicit consent and it
  // raises the bar on the whole record, which is why the survey treats its own
  // faith question the way it does. A public landing page, reached before
  // anyone has read anything, is the worst place to ask. If this ever fails,
  // the answer is to delete the question, not to relax the test.
  const banned = /faith|religio|belief|spiritual|church|god/i
  for (const q of QUIZ) {
    assert.ok(!banned.test(q.text), `${q.id} asks about faith`)
    assert.ok(!banned.test(q.help ?? ''), `${q.id} help text mentions faith`)
    for (const o of q.options) {
      assert.ok(!banned.test(o), `${q.id} has a faith option: ${o}`)
    }
  }
})

test('every combination of answers reaches a result', () => {
  // A blank result screen after eight questions is a broken promise, so the
  // fallback matters more than the branching. Exhaustive over every
  // single-select answer, plus the empty case.
  assert.ok(resultPath({}) in PATHS, 'no answers must still produce a path')

  for (const q of QUIZ) {
    for (const option of q.options) {
      const answers: QuizAnswers = { [q.id]: [option] }
      assert.ok(resultPath(answers) in PATHS, `${q.id}=${option} produced nothing`)
    }
  }
})

test('the stated signals reach the path they promise', () => {
  // These are the rules a reader of the result would expect to hold. If the
  // branching is reordered, this says which promise broke.
  assert.equal(
    resultPath({ challenge: ['The same thing happening again and again'] }),
    'playbook',
  )
  assert.equal(
    resultPath({ when: ['Before I send a message I might regret'] }),
    'beforeYouSend',
  )
  assert.equal(
    resultPath({ reaction: ['Answer straight away, sometimes heated'] }),
    'interrupt',
  )
  assert.equal(resultPath({ reaction: ['Go quiet, or walk away'] }), 'twoTruths')
})

test('every branch references an option that actually exists', () => {
  // The branching matches on option TEXT, so a reworded option silently stops
  // matching and the path quietly dies. Same failure mode as the feature
  // tagging in the private repository, and the same guard.
  //
  // Only the strings that are COMPARED against an answer are checked: the
  // second argument of has(), and the right-hand side of an equality. A naive
  // sweep for quoted strings also picks up the path ids being returned, which
  // are not options and never were.
  const all = new Set(QUIZ.flatMap((q) => [...q.options]))
  const body = readFileSync('src/lib/quiz.ts', 'utf8')
    .slice(readFileSync('src/lib/quiz.ts', 'utf8').indexOf('export function resultPath'))
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')

  const compared = [
    ...[...body.matchAll(/has\(\s*'[^']+'\s*,\s*'([^'\n]+)'\s*\)/g)].map((m) => m[1]),
    ...[...body.matchAll(/[=!]==\s*'([^'\n]+)'/g)].map((m) => m[1]),
  ]
  assert.ok(compared.length > 0, 'found no comparisons; the guard is not reading the code')
  for (const text of compared) {
    assert.ok(all.has(text), `resultPath matches on "${text}", which is not an option`)
  }
})

test('result copy uses the product terms exactly as defined', () => {
  const allowed = [
    'Reaction Interrupt',
    'Before You Send',
    'Challenge Me',
    'Two Truths',
    'Outcome Feedback',
    'Relationship Playbook',
  ]
  for (const p of Object.values(PATHS)) {
    assert.ok(allowed.includes(p.name), `"${p.name}" is not a product term`)
  }
})

test('the version string cannot be mistaken for a question id', () => {
  // Survey ids are q1 to q38. 'q1' as a quiz version would be unreadable in a
  // database row and was caught by the hardcoded-identifier guard.
  assert.ok(!/^q\d+$/.test(QUIZ_VERSION), `${QUIZ_VERSION} looks like a question id`)
})

test('no analytics or third-party script on the quiz route', () => {
  // The survey found data security and privacy were respondents' first and
  // second objections. A pixel on the page where we ask how someone argues
  // would be the cheapest possible way to prove them right.
  const banned =
    /googletagmanager|google-analytics|gtag\(|facebook\.net|fbq\(|connect\.facebook|hotjar|segment\.com|posthog|plausible|mixpanel/i
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
    )
  for (const file of walk('src/app/your-pattern')) {
    assert.ok(!banned.test(readFileSync(file, 'utf8')), `third-party script in ${file}`)
  }
})

test('the quiz stores no email beside the answers, and logs nothing typed', () => {
  const actions = readFileSync('src/app/your-pattern/actions.ts', 'utf8')
  const code = actions.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
  assert.ok(!/console\./.test(code), 'the quiz must never write to the console')
  assert.ok(!/\bemail\b/i.test(code), 'no email column belongs beside quiz answers')
  // RLS is on with zero policies, so a chained .select() fails with 42501.
  assert.ok(!/\.insert\([^)]*\)[\s.]*\.select\(/.test(code))
  assert.ok(!/\.update\([^)]*\)[\s.]*\.select\(/.test(code))
})

test('the migration locks the quiz table the same way as the research tables', () => {
  const sql = readFileSync('supabase/migrations/0002_quiz.sql', 'utf8')
  assert.ok(/enable row level security/i.test(sql))
  assert.ok(/revoke all on .*quiz_responses from anon, authenticated/i.test(sql))
  // RLS on with zero policies denies every role. One policy would open it.
  assert.ok(!/create policy/i.test(sql), 'the quiz table must have no policies')
  for (const schema of ['public', 'staging']) {
    assert.ok(sql.includes(`'${schema}'`), `${schema} is missing from the migration`)
  }
})

test('the published notice describes the quiz as its own activity', () => {
  // The notice covered the study only. Storing quiz answers under it would be
  // processing beyond the purpose a respondent was told about.
  const notice = readFileSync('src/app/privacy/page.tsx', 'utf8')
  assert.ok(notice.includes('Your pattern'), 'the notice does not name the quiz')
  assert.ok(notice.includes('6(1)(a)'), 'the quiz section states no lawful basis')
  assert.ok(
    /your-pattern/.test(notice),
    'the notice does not say which page the quiz section is about',
  )
})

test('the claim token is returned only on completion, and only when a row exists', () => {
  // The token is a handle on a row. Handing one out when the write failed
  // would send someone to a sign-up screen promising answers that were never
  // saved, which is a worse outcome than a quiet link.
  const actions = readFileSync('src/app/your-pattern/actions.ts', 'utf8')
  const code = actions.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

  // saveProgress must never return one: it is called on every step, and a
  // token before the quiz is finished is a token for an incomplete row.
  const progress = code.slice(code.indexOf('export async function saveProgress'), code.indexOf('export async function complete'))
  assert.ok(!/claimToken/.test(progress), 'progress saves must not hand out a token')

  const complete = code.slice(code.indexOf('export async function complete'))
  // Returned on the success path, withheld on the failure path.
  assert.ok(/return \{ ok: true, path, claimToken \}/.test(complete))
  assert.ok(/return \{ ok: true, path \}/.test(complete), 'no token when the write failed')
})

test('the token is generated, never read back from the row', () => {
  // Reading it back means chaining .select() onto a write, and with RLS on and
  // zero policies PostgREST answers 42501. This is the rule that has already
  // cost a day once.
  const code = readFileSync('src/app/your-pattern/actions.ts', 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
  assert.ok(/crypto\.randomUUID\(\)/.test(code))
  assert.ok(!/\.insert\([^)]*\)[\s.]*\.select\(/.test(code))
  assert.ok(!/\.update\([^)]*\)[\s.]*\.select\(/.test(code))
})

test('the result link carries the token to the app, and survives its absence', () => {
  const client = readFileSync('src/app/your-pattern/quiz-client.tsx', 'utf8')
  assert.ok(client.includes('app.koos-ayo.com/signin?quiz='))
  // Encoded, not interpolated raw: it is a value in a query string.
  assert.ok(client.includes('encodeURIComponent(claimToken)'))
  // And a plain link when there is no token, rather than `?quiz=null`.
  assert.ok(/'https:\/\/app\.koos-ayo\.com\/signin'/.test(client))
})

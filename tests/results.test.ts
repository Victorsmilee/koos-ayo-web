import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { results, share, showFigures } from '../src/lib/results'

/**
 * The published results page, INF-109.
 *
 * These are not formatting tests. Each one is a promise the privacy notice
 * makes to respondents, asserted against the file that actually ships, so a
 * hand-edited or wrongly generated `results.json` fails the build rather than
 * reaching the web. The survey runs once; a figure published wrongly cannot be
 * unpublished.
 */

const FAITH =
  'How important is faith or religion in how you approach your relationship?'

test('the committed file parses, which is what the build depends on', () => {
  // results.ts parses at module load. Importing it here is the assertion.
  assert.ok(results.surveyVersion.length > 0)
  assert.ok(Array.isArray(results.questions))
})

test('the faith question is absent, in any form', () => {
  const body = readFileSync('src/data/results.json', 'utf8')
  assert.ok(!body.includes(FAITH), 'Article 9 data must never be published')
  assert.equal(results.questions.filter((q) => q.text === FAITH).length, 0)
})

test('no free text reaches the file', () => {
  // Free-text questions have no options, so they would appear with an empty
  // counts object. The generator drops them; this is the check that it did.
  for (const q of results.questions) {
    assert.ok(
      Object.keys(q.counts).length > 0,
      `Q${q.number} has no options, which means a text question was published`,
    )
  }
})

test('every question carries its own base', () => {
  // A percentage over the wrong denominator reads as a finding rather than a
  // bug, and the whole page is percentages.
  for (const q of results.questions) {
    assert.equal(typeof q.base, 'number')
    assert.ok(q.base >= 0)
    for (const n of Object.values(q.counts)) {
      if (n !== null) assert.ok(n <= q.base, `Q${q.number} count exceeds its base`)
    }
  }
})

test('no published cell sits below the suppression threshold', () => {
  for (const q of results.questions) {
    for (const [option, n] of Object.entries(q.counts)) {
      if (n !== null && n > 0) {
        assert.ok(
          n >= results.minCell,
          `Q${q.number} "${option}" publishes ${n}, below ${results.minCell}`,
        )
      }
    }
  }
})

test('a suppressed cell is null, never zero', () => {
  // Zero is a finding: nobody chose this. Null is "we are not telling you".
  // Collapsing them publishes a false finding, which is worse than silence.
  const body = JSON.parse(readFileSync('src/data/results.json', 'utf8'))
  for (const q of body.questions) {
    for (const [option, n] of Object.entries(q.counts)) {
      if (n === 0) {
        assert.ok(
          q.base > 0,
          `Q${q.number} "${option}" publishes 0 on an empty base; that is a ` +
            `suppression, which must be null`,
        )
      }
    }
  }
})

test('figures stay hidden while the survey is open', () => {
  // The methodological rule, enforced rather than remembered. Later
  // respondents anchoring on published results is worst on willingness to pay,
  // which is the hardest signal in the instrument to get and the easiest to
  // contaminate.
  if (results.status === 'open') {
    assert.equal(showFigures, false)
  }
  // And an empty dataset never renders as a page of zeroes.
  if (results.responsesStarted === 0) {
    assert.equal(showFigures, false)
  }
})

test('share() divides by the base, and refuses to invent a percentage', () => {
  assert.equal(share(2, 5), 40)
  assert.equal(share(5, 6), 83.3)
  assert.equal(share(0, 10), 0)
  // No base is not zero percent. It is no answer.
  assert.equal(share(3, 0), null)
  // A suppressed cell has no percentage either; publishing one would leak the
  // count the suppression exists to hide.
  assert.equal(share(null, 10), null)
})

test('the page never ships a database credential', () => {
  const page = readFileSync('src/app/results/page.tsx', 'utf8')
  const lib = readFileSync('src/lib/results.ts', 'utf8')
  for (const source of [page, lib]) {
    assert.ok(!/SUPABASE|createClient|service_role/.test(source))
  }
})

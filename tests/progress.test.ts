import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'

/**
 * The survey progress counter, Product Owner 29 Oct 2026: 150 people, closing
 * 15 November, count shown from 10.
 *
 * `progress.ts` is server-only, so it cannot be imported here. These assert the
 * published commitments and the two rules that are easy to break silently: the
 * floor below which a count is hidden, and that the page never falls over when
 * the count cannot be read.
 */

const source = readFileSync('src/lib/progress.ts', 'utf8')
const page = readFileSync('src/app/results/page.tsx', 'utf8')

test('the published commitments are what the Product Owner approved', () => {
  // These are shown to respondents, so they are not values to drift.
  assert.match(source, /export const TARGET = 150\b/)
  assert.match(source, /export const CLOSES_ON = '2026-11-15'/)
  assert.match(source, /export const SHOW_COUNT_FROM = 10\b/)
})

test('a count below the floor is hidden, not drawn as an empty bar', () => {
  // "3 of 150" tells a visitor nobody is doing this, which is the opposite of
  // what the bar is for. The closing date still shows.
  assert.match(page, /count !== null && count >= SHOW_COUNT_FROM/)
  assert.match(page, /showCount=\{showCount\}/)
  assert.match(readFileSync("src/components/charts.tsx", "utf8"), /showCount \? \(/)
})

test('an unreadable count never takes down the page', () => {
  // A results page that cannot say how many people took part is still worth
  // showing. The catch is the whole point, so assert it exists.
  assert.match(source, /count: number \| null/)
  assert.match(source, /\} catch \{/)
})

test('the count reads no rows, only a count', () => {
  // This is the one place the results page touches the research table. It must
  // stay a count: head: true means PostgREST returns no row at all, so no
  // answer and nothing about any individual leaves the database.
  assert.match(source, /count: 'exact', head: true/)
  assert.ok(!/\.select\('\*'\)(?!,)/.test(source))
})

test('the page revalidates rather than querying on every visit', () => {
  assert.match(page, /export const revalidate = 3600/)
})

test('published figures are still gated on the study being closed', () => {
  // The live count is allowed because a count is not an answer. The figures
  // themselves must not become live by accident.
  const results = readFileSync('src/lib/results.ts', 'utf8')
  assert.match(results, /results\.status === 'closed'/)
})

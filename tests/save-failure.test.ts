import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { describeSaveFailure } from '../src/lib/save-failure'
import { ConfigError } from '../src/lib/config-error'

/**
 * The point of these tests is the privacy guarantee, not the formatting.
 *
 * Logging was previously nothing at all, which honoured "never log answer
 * content" by making every production failure undiagnosable. The fix only
 * holds if it is an allowlist: a new error shape must leak nothing by being
 * unanticipated. That is what is asserted here.
 */

// Stand-ins for the two things that must never reach a log.
const ANSWER = 'he said something cruel about my mother'
const EMAIL = 'respondent@example.com'

test('a PostgREST failure logs its code and nothing else', () => {
  const line = describeSaveFailure('save-section', {
    code: '42501',
    message: `new row violates row-level security policy, answers: ${ANSWER}`,
    details: `Failing row contains (${ANSWER})`,
    hint: EMAIL,
  })
  assert.match(line, /42501/)
  assert.match(line, /save-section/)
  // message, details and hint are all withheld. PostgREST echoes row values
  // into details on a constraint violation, which is the actual leak path.
  assert.ok(!line.includes(ANSWER))
  assert.ok(!line.includes(EMAIL))
  assert.ok(!line.includes('Failing row'))
})

test('a configuration failure logs its message, because we wrote it', () => {
  const line = describeSaveFailure(
    'save-section',
    new ConfigError('Missing required environment variable SUPABASE_DB_SCHEMA.'),
  )
  assert.match(line, /SUPABASE_DB_SCHEMA/)
  assert.match(line, /configuration/)
})

test('an unanticipated error logs only its type', () => {
  // The allowlist case that matters: something we have not seen before must
  // reduce to a type name, never to its message.
  const line = describeSaveFailure('submit-survey', new TypeError(ANSWER))
  assert.match(line, /TypeError/)
  assert.ok(!line.includes(ANSWER))

  const thrown = describeSaveFailure('save-email', EMAIL)
  assert.ok(!thrown.includes(EMAIL))
  assert.match(thrown, /unexpected string/)
})

test('a malformed code is treated as no code at all', () => {
  // A long "code" is not a code. Refusing it stops a payload arriving in that
  // field and being logged verbatim.
  const line = describeSaveFailure('save-section', { code: ANSWER })
  assert.ok(!line.includes(ANSWER))
  assert.match(line, /unexpected object/)
})

test('every failure path in actions.ts reports, none swallows silently', () => {
  // The regression this file exists for: the first live save failure on
  // Vercel produced the generic message and no trace anywhere, so the only
  // way to diagnose it was curl against Supabase.
  const source = readFileSync('src/app/whatdoyouthink/actions.ts', 'utf8')
  assert.ok(
    !/catch\s*\{/.test(source),
    'a bare `catch {` swallows the cause with no log; bind it and call logSaveFailure',
  )
  // Every early return on a database error is preceded by a log call.
  const returns = source.split('\n').filter((l) => /if \(error\)/.test(l))
  assert.ok(returns.length > 0)
  for (const line of returns) {
    assert.match(line.trim(), /^if \(error\) \{$/, `unlogged: ${line.trim()}`)
  }
})

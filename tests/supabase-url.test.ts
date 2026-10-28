import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'

/**
 * The PGRST125 regression, 28 Oct 2026.
 *
 * `SUPABASE_URL` was set in Vercel with `/rest/v1` already on the end.
 * supabase-js appends `/rest/v1` itself, so every request went to
 * `/rest/v1/rest/v1`, PostgREST answered PGRST125 (unrecognised path), and the
 * survey showed "Sorry, that didn't save" for three days. The same variable was
 * correct in GitHub Actions, so the keep-alive stayed green the whole time and
 * pointed away from the real cause.
 *
 * These tests do not need a database: they check the shape of the value, which
 * is the thing that was wrong.
 */

// Mirrors the guard in supabase-server.ts. Kept here as the specification of
// what a valid value looks like, so the rule is readable without the client.
function pathOf(url: string): string {
  return new URL(url).pathname.replace(/\/+$/, '')
}

const PROJECT = 'https://tgygfnngjqgviujqqjrf.supabase.co'

test('a bare project URL is accepted, with or without a trailing slash', () => {
  assert.equal(pathOf(PROJECT), '')
  assert.equal(pathOf(`${PROJECT}/`), '')
})

test('a URL carrying the REST path is rejected, which is the actual bug', () => {
  assert.equal(pathOf(`${PROJECT}/rest/v1`), '/rest/v1')
  assert.equal(pathOf(`${PROJECT}/rest/v1/`), '/rest/v1')
  // Any path at all, not just this one. The next person will paste something
  // else, and the client appends regardless.
  assert.equal(pathOf(`${PROJECT}/rest`), '/rest')
  assert.equal(pathOf(`${PROJECT}/graphql/v1`), '/graphql/v1')
})

test('the guard is in supabase-server.ts and names the variable', () => {
  const source = readFileSync('src/lib/supabase-server.ts', 'utf8')
  assert.match(source, /SUPABASE_URL must be the project URL with no path/)
  assert.match(source, /PGRST125/, 'the message should name the code it prevents')
  assert.match(source, /new URL\(url\)\.pathname/)
})

test('the function region is pinned in the repository, not a dashboard', () => {
  // The privacy notice and docs/gdpr/ropa.md both tell respondents where the
  // code handling their answers runs. On 28 Oct 2026 it was running in
  // Stockholm while the dashboard setting said Frankfurt, which is exactly the
  // kind of claim that should not depend on a checkbox nobody can review.
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
  assert.deepEqual(config.regions, ['fra1'])
})

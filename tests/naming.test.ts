import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

/**
 * The product is written KooS.
 *
 * Product Owner rule, 16 Nov 2026. Capital K, two lower-case o's, capital S.
 * This is a test rather than a note in the brand guide because a spelling rule
 * that lives only in prose drifts back within a month: one person writes KOOS
 * in a new component, nobody notices, and six months later the site spells its
 * own name two ways.
 *
 * The exceptions below are each deliberate, and each has a reason that is not
 * "we forgot".
 */

const WORDMARK = 'src/components/wordmark.tsx'
const INSTRUMENT = 'src/lib/questions.ts'

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? sources(join(dir, e.name))
      : /\.(ts|tsx)$/.test(e.name)
        ? [join(dir, e.name)]
        : [],
  )
}

test('the product is written KooS, never KOOS', () => {
  const offenders: string[] = []
  for (const file of sources('src')) {
    if (file === WORDMARK || file === INSTRUMENT) continue
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        // KOOS-AYO is the wordmark: a lockup, not running copy. It keeps its
        // own letterforms wherever the brand is named formally.
        if (/KOOS(?!-AYO)/.test(line)) offenders.push(`${file}:${i + 1}`)
      })
  }
  assert.deepEqual(offenders, [], 'write KooS, not KOOS')
})

test('the logo keeps its own letterforms', () => {
  // The wordmark DRAWS the name, and the two overlapping O's of KOOS are the
  // whole idea of the mark. Respelling it there would delete the logo.
  const mark = readFileSync(WORDMARK, 'utf8')
  assert.ok(mark.includes('KOOS'), 'the wordmark must still draw KOOS')
  assert.ok(!mark.includes('KooS'), 'the drawn mark is not running copy')
})

test('the instrument is untouched, and the exception is recorded', () => {
  // questions.ts reproduces questionnaire v3 verbatim. Its privacy box says
  // "the KOOS research team", and respondents have already answered under that
  // wording. Changing respondent-facing text mid-collection is exactly what
  // the instrument rules exist to prevent. It stays until the Product Owner
  // decides otherwise knowing that cost.
  assert.ok(readFileSync(INSTRUMENT, 'utf8').includes('KOOS research team'))
  const guide = readFileSync('docs/brand/foundations/naming.md', 'utf8')
  assert.ok(
    guide.includes('KooS'),
    'the brand guide must carry the rule this test enforces',
  )
  assert.ok(
    guide.includes('research instrument'),
    'the brand guide must record why the instrument is exempt',
  )
})

test('the quiz does not describe someone by how they argue', () => {
  // Brand guide, voice rule 2: describe behaviour and impact, never character.
  // "how you argue" labels the person rather than the moment, which is the
  // wrong footing for the first sentence someone reads.
  for (const file of sources('src/app/your-pattern')) {
    const text = readFileSync(file, 'utf8')
    assert.ok(!/how (you|they) argue/i.test(text), `"how you argue" in ${file}`)
  }
})

test('the sound is off until someone asks for it', () => {
  const src = readFileSync('src/components/quiet-sound.tsx', 'utf8')
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
  assert.ok(/useState\(false\)/.test(code), 'sound must default to off')
  // No autoplay, and nothing starts from an effect: browsers block audio
  // without a gesture, so an autoplaying version would fail silently on most
  // first loads and surprise everyone else.
  assert.ok(!/autoplay/i.test(code))
  assert.ok(!/useEffect\([^)]*start\(/.test(code), 'sound must not start on mount')
  // Generated in the browser. A hosted audio file would be the only
  // third-party connection on this page.
  assert.ok(!/\.(mp3|ogg|wav|m4a)\b/i.test(code), 'no audio file on this route')
  // Case-sensitive, and the tag must be followed by whitespace or a close.
  // A careless /<audio/i also matches `useRef<AudioContext>`, which is the
  // very API that makes the file unnecessary.
  assert.ok(!/<audio[\s/>]/.test(code), 'no <audio> element on this route')
})

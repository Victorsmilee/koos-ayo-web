import { expect, test } from '@playwright/test'
import { PATHS, QUIZ, TOTAL_QUESTIONS } from '../src/lib/quiz'

/**
 * The quiz at /your-pattern.
 *
 * These run WITHOUT a database. The quiz saves in the background and never
 * blocks on it, which is deliberate: a save failure must not stop someone
 * finishing. That property is what makes the whole funnel testable here, and
 * the specs that would need credentials are the ones asserting a row landed,
 * which belong with the survey specs rather than here.
 *
 * Counts and option text come from `quiz.ts`, never written out. The quiz is
 * not the instrument and its wording will change; a spec that hardcoded an
 * option would fail on every copy edit and teach everyone to ignore it.
 */

/** Walk from the consent screen to the first question. */
async function start(page: import('@playwright/test').Page) {
  await page.goto('/your-pattern')
  await page.getByRole('button', { name: 'I agree, start' }).click()
  await expect(page.getByText(`1 of ${TOTAL_QUESTIONS}`)).toBeVisible()
}

/** Answer the question on screen by its index in the instrument. */
async function answer(
  page: import('@playwright/test').Page,
  index: number,
  choice = 0,
) {
  const question = QUIZ[index]
  await page.getByText(question.options[choice], { exact: true }).click()
  if (question.multiple) {
    await page.getByRole('button', { name: /Continue|See where to start/ }).click()
  }
}

test('nothing is stored before someone agrees', async ({ page, context }) => {
  // Consent is given by starting, and the notice says nothing is stored before
  // that. The cookie is how a row is identified, so its absence is the
  // observable form of that promise.
  await page.goto('/your-pattern')
  await expect(page.getByRole('button', { name: 'I agree, start' })).toBeVisible()
  expect(
    (await context.cookies()).some((c) => c.name === 'koos-quiz'),
    'a quiz cookie existed before consent',
  ).toBe(false)
})

test('the consent screen says what is kept and links the notice', async ({ page }) => {
  await page.goto('/your-pattern')
  await expect(page.getByText(/No advertising, no tracking, nothing sold/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /How we handle your answers/i })).toHaveAttribute(
    'href',
    '/privacy',
  )
})

test('all eight questions answer through to a result', async ({ page }) => {
  await start(page)
  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    await expect(page.getByText(`${i + 1} of ${TOTAL_QUESTIONS}`)).toBeVisible()
    await answer(page, i)
  }
  await expect(page.getByText('Where to start')).toBeVisible()
  await expect(page.getByRole('link', { name: /Create an account/i })).toBeVisible()
})

test('the result matches the answers, rather than being decorative', async ({ page }) => {
  // The single most valuable assertion here. The branching is plain code and
  // easy to reorder, and a result that silently stops following the answers
  // would look completely normal on screen.
  await start(page)
  const challenge = QUIZ.findIndex((q) => q.id === 'challenge')

  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    // "The same thing happening again and again" is the signal that outranks
    // every other rule, so the Relationship Playbook must come back.
    await answer(page, i, i === challenge ? 4 : 0)
  }
  await expect(page.getByText(PATHS.playbook.name, { exact: true })).toBeVisible()
  await expect(page.getByText(PATHS.interrupt.name, { exact: true })).toHaveCount(0)
})

test('back returns the previous answer rather than losing it', async ({ page }) => {
  await start(page)
  await answer(page, 0)
  await expect(page.getByText(`2 of ${TOTAL_QUESTIONS}`)).toBeVisible()
  await page.getByRole('button', { name: 'Back' }).click()

  await expect(page.getByText(`1 of ${TOTAL_QUESTIONS}`)).toBeVisible()
  // The radio behind the drawn control is the real state. If this is ever
  // false, someone going back has silently lost what they chose.
  await expect(page.getByRole('radio', { name: QUIZ[0].options[0] })).toBeChecked()
})

test('the multi-select question stops at its limit', async ({ page }) => {
  const index = QUIZ.findIndex((q) => q.multiple)
  expect(index, 'no multi-select question in the quiz').toBeGreaterThan(-1)
  const question = QUIZ[index]
  const limit = question.maxSelections ?? question.options.length

  await start(page)
  for (let i = 0; i < index; i++) await answer(page, i)

  for (let i = 0; i < limit; i++) {
    await page.getByText(question.options[i], { exact: true }).click()
  }
  // One past the limit: the remaining options must be unavailable rather than
  // silently accepting a selection the server would then drop.
  await expect(
    page.getByRole('checkbox', { name: question.options[limit] }),
  ).toBeDisabled()
})

test('no analytics or advertising script loads on the quiz', async ({ page }) => {
  // The survey found data security and privacy were respondents' first and
  // second objections. A unit test checks the source; this checks what the
  // browser actually fetched, which is the claim the notice makes.
  const thirdParty: string[] = []
  page.on('request', (r) => {
    const host = new URL(r.url()).host
    if (host && !host.includes('127.0.0.1') && !host.includes('localhost')) {
      thirdParty.push(r.url())
    }
  })
  await start(page)
  await answer(page, 0)
  expect(thirdParty, 'the quiz reached a third-party host').toEqual([])
})

test('the sound is off by default and actually starts when asked', async ({ page }) => {
  // This exists because the first version was silent: it played at 110Hz under
  // a 420Hz low-pass at -27dBFS, and never called resume(). Nothing errored,
  // so nothing caught it. Asserting on the audio graph is the only way to see
  // the difference between "playing quietly" and "not playing".
  await page.addInitScript(() => {
    const w = window as unknown as { __audio?: Record<string, unknown> }
    w.__audio = { created: 0, resumed: 0, oscillators: 0, gains: [] as number[] }
    const Real = window.AudioContext
    class Spy extends Real {
      constructor() {
        super()
        ;(w.__audio as { created: number }).created++
      }
      resume() {
        ;(w.__audio as { resumed: number }).resumed++
        return super.resume()
      }
      createOscillator() {
        ;(w.__audio as { oscillators: number }).oscillators++
        return super.createOscillator()
      }
      createGain() {
        const g = super.createGain()
        const setTarget = g.gain.setTargetAtTime.bind(g.gain)
        g.gain.setTargetAtTime = (v: number, t: number, c: number) => {
          ;(w.__audio as { gains: number[] }).gains.push(v)
          return setTarget(v, t, c)
        }
        return g
      }
    }
    window.AudioContext = Spy as unknown as typeof AudioContext
  })

  await page.goto('/your-pattern')
  const toggle = page.getByRole('button', { name: /Sound/ })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')

  // Off by default means no context is built at all, not a muted one.
  expect(
    await page.evaluate(() => (window as unknown as { __audio: { created: number } }).__audio.created),
  ).toBe(0)

  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')

  const audio = await page.evaluate(
    () =>
      (window as unknown as {
        __audio: { created: number; resumed: number; oscillators: number; gains: number[] }
      }).__audio,
  )
  expect(audio.created, 'no AudioContext was created').toBe(1)
  expect(audio.oscillators, 'no voices were started').toBeGreaterThan(1)
  // Audible, not merely non-zero. 0.045 was the value that produced silence.
  expect(Math.max(...audio.gains), 'the level is below what a phone reproduces').toBeGreaterThanOrEqual(0.08)

  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
})

test('the sound is music: it moves on rather than holding one chord', async ({ page }) => {
  // A held chord was the first version and it read as a test signal, which is
  // the opposite of calming. This asserts the thing that makes it music: the
  // harmony changes on its own, and stopping stops the scheduler rather than
  // merely muting it, which would leave notes queued into a closing context.
  test.slow() // one bar is nine seconds, so this one deliberately waits.

  await page.addInitScript(() => {
    const w = window as unknown as { __m: { freqs: number[]; osc: number } }
    w.__m = { freqs: [], osc: 0 }
    const Real = window.AudioContext
    class Spy extends Real {
      createOscillator() {
        const o = super.createOscillator()
        w.__m.osc++
        const start = o.start.bind(o)
        o.start = (t?: number) => {
          w.__m.freqs.push(Math.round(o.frequency.value * 100) / 100)
          return start(t)
        }
        return o
      }
    }
    window.AudioContext = Spy as unknown as typeof AudioContext
  })

  await page.goto('/your-pattern')
  const toggle = page.getByRole('button', { name: /Sound/ })
  await toggle.click()
  await page.waitForTimeout(1500)

  const read = () =>
    page.evaluate(
      () => JSON.parse(JSON.stringify((window as unknown as { __m: unknown }).__m)) as { freqs: number[]; osc: number },
    )

  const first = await read()
  expect(first.osc, 'a chord is more than one voice').toBeGreaterThan(2)

  // Past the bar boundary: the next chord must not be the first one again.
  await page.waitForTimeout(10_000)
  const second = await read()
  const opening = new Set(first.freqs)
  const next = second.freqs.slice(first.freqs.length)
  expect(next.length, 'nothing was scheduled for the next bar').toBeGreaterThan(0)
  expect(
    next.some((f) => !opening.has(f)),
    'the next bar repeated the opening chord, so it is a loop rather than a progression',
  ).toBe(true)

  // Stopping must clear the scheduler, not just drop the volume.
  await toggle.click()
  const atStop = (await read()).osc
  await page.waitForTimeout(10_000)
  expect((await read()).osc, 'the scheduler kept running after stop').toBe(atStop)
})

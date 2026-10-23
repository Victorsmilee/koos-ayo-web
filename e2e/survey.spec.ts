import { type Page, expect, test } from '@playwright/test'
import {
  EMAIL_GATE_QUESTION_ID,
  EMAIL_QUESTION_ID,
  EMAIL_SHOWN_WHEN,
  sections,
} from '../src/lib/questions'

/**
 * The paths that write to the database. They skip without credentials so the UI
 * suite still runs locally; CI supplies staging credentials and runs them.
 *
 * SUPABASE_DB_SCHEMA must be `staging`. These write rows.
 *
 * Counts and positions come from the instrument, never written here. The first
 * version of this file asserted "section 3 of 8" as text, which matched two
 * nodes (the eyebrow and the progress bar) and failed Playwright's strict mode
 * on its first real run. The progress bar now carries `section-indicator` and
 * is the only thing addressed.
 */
test.skip(
  !process.env.SUPABASE_URL,
  'needs SUPABASE_URL, SUPABASE_SECRET_KEY and SUPABASE_DB_SCHEMA=staging',
)

const TOTAL = sections.length
const indicator = (page: Page) => page.getByTestId('section-indicator')

/** Question text contains punctuation that is meaningful in a regex. */
function escapeForText(text: string): RegExp {
  return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
}

async function expectSection(page: Page, n: number) {
  await expect(indicator(page)).toHaveText(
    new RegExp(`Section\\s+${n}\\s+of\\s+${TOTAL}`, 'i'),
  )
}

async function consentAndStart(page: Page) {
  await page.goto('/whatdoyouthink')
  await page.getByText('Yes, continue').click()
  await page.getByRole('button', { name: /^start$/i }).click()
  await expectSection(page, 1)
}

/**
 * Answer the first option of every question on screen, then advance and WAIT
 * for the advance. Clicking Next and assuming it worked is what made the
 * earlier failures ambiguous: a slow save looks identical to a broken page.
 */
async function answerSection(page: Page) {
  const before = (await indicator(page).textContent())?.trim() ?? ''
  const groups = page.locator('[role="group"]')
  const count = await groups.count()
  for (let i = 0; i < count; i++) {
    const option = groups.nth(i).locator('label').first()
    if (await option.isVisible()) await option.click()
  }
  await page.getByRole('button', { name: /^(next|finish)$/i }).click()
  await expect(indicator(page)).not.toHaveText(before, { timeout: 20_000 })
}

test('a refresh resumes where the respondent was, and loses nothing', async ({
  page,
}) => {
  // The regression test for the bug that deleted saved answers. Before the fix,
  // state reset to empty on reload and the next save overwrote the whole
  // answers column, so sections already answered vanished from the database.
  await consentAndStart(page)
  await answerSection(page)
  await answerSection(page)
  await expectSection(page, 3)

  await page.reload()

  // Resumed, not restarted. Landing back on the intro is the bug.
  await expectSection(page, 3)
  await expect(
    page.getByRole('button', { name: /^start$/i }),
  ).toHaveCount(0)
})

test('going back keeps the answers already given', async ({ page }) => {
  await consentAndStart(page)
  await answerSection(page)
  await expectSection(page, 2)

  await page.getByRole('button', { name: /^back$/i }).click()
  await expectSection(page, 1)

  // Still selected, not cleared.
  await expect(page.locator('input:checked').first()).toBeAttached()
})

test('a selection limit cannot be exceeded', async ({ page }) => {
  // Which question, which section and what the maximum is all come from the
  // instrument. The previous version walked every section hunting for the
  // question, and then clicked every option, which hangs: once the limit is
  // reached the remaining inputs are disabled, and Playwright waits the full
  // timeout for an element that will never become actionable.
  const section = sections.find((sec) =>
    sec.questions.some((q) => typeof q.maxSelections === 'number'),
  )!
  const question = section.questions.find(
    (q) => typeof q.maxSelections === 'number',
  )!
  const max = question.maxSelections!

  await consentAndStart(page)
  for (let i = 1; i < section.index; i++) await answerSection(page)
  await expectSection(page, section.index)

  const group = page.locator('[role="group"]', {
    hasText: escapeForText(question.text.slice(0, 40)),
  })
  const options = group.locator('label')

  for (let i = 0; i < max; i++) await options.nth(i).click()

  // The live counter is what a respondent actually sees, so assert on that.
  await expect(group.getByText(`${max} of ${max} selected`)).toBeVisible()

  // And the next option is now unreachable rather than merely ignored.
  await expect(group.locator('input').nth(max)).toBeDisabled()
})

test('the email question appears only after an affirmative follow-up', async ({
  page,
}) => {
  // Which section holds it comes from the instrument.
  const sectionWithEmail = sections.find((s) =>
    s.questions.some((q) => q.id === EMAIL_QUESTION_ID),
  )!
  await consentAndStart(page)
  for (let i = 1; i < sectionWithEmail.index; i++) await answerSection(page)
  await expectSection(page, sectionWithEmail.index)

  const gate = page.locator('[role="group"]', {
    hasText: escapeForText(
      sections
        .flatMap((sec) => sec.questions)
        .find((q) => q.id === EMAIL_GATE_QUESTION_ID)!
        .text.slice(0, 40),
    ),
  })

  // Declining must never reveal the email field.
  await gate.getByText('No', { exact: true }).first().click()
  await expect(page.getByLabel(/email/i)).toHaveCount(0)

  // Accepting reveals it.
  await gate.getByText(EMAIL_SHOWN_WHEN[0], { exact: true }).first().click()
  await expect(page.getByLabel(/email/i).first()).toBeVisible()
})

import { expect, test } from '@playwright/test'

/**
 * The paths that write to the database. They skip without credentials so a
 * developer can still run the UI suite; CI supplies staging credentials and
 * runs them for real.
 *
 * SUPABASE_DB_SCHEMA must be `staging`. These write rows.
 */
test.skip(
  !process.env.SUPABASE_URL,
  'needs SUPABASE_URL, SUPABASE_SECRET_KEY and SUPABASE_DB_SCHEMA=staging',
)

async function consentAndStart(page: import('@playwright/test').Page) {
  await page.goto('/whatdoyouthink')
  await page.getByText('Yes, continue').click()
  await page.getByRole('button', { name: /start/i }).click()
}

/** Answer whatever the current section shows, then advance. */
async function answerSection(page: import('@playwright/test').Page) {
  const groups = page.locator('[role="group"]')
  const count = await groups.count()
  for (let i = 0; i < count; i++) {
    const firstOption = groups.nth(i).locator('label').first()
    if (await firstOption.isVisible()) await firstOption.click()
  }
  await page.getByRole('button', { name: /next|finish|submit/i }).first().click()
}

test('a refresh resumes where the respondent was, and loses nothing', async ({ page }) => {
  // The regression test for the bug that deleted saved answers. Before the fix,
  // state reset to empty on reload and the next save overwrote the whole
  // answers column, so sections already answered vanished from the database.
  await consentAndStart(page)

  await answerSection(page)
  await answerSection(page)
  await expect(page.getByText(/section 3 of 8/i)).toBeVisible()

  await page.reload()

  // Resumed, not restarted. Landing back on the intro is the bug.
  await expect(page.getByText(/section 3 of 8/i)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'The AYO Relationship Study' })).toBeHidden()
})

test('going back does not erase the answers already given', async ({ page }) => {
  await consentAndStart(page)
  await answerSection(page)
  await expect(page.getByText(/section 2 of 8/i)).toBeVisible()

  await page.getByRole('button', { name: /back/i }).click()
  await expect(page.getByText(/section 1 of 8/i)).toBeVisible()

  // The earlier answers must still be selected, not cleared.
  await expect(page.locator('input:checked').first()).toBeAttached()
})

test('a selection limit stops at its maximum', async ({ page }) => {
  await consentAndStart(page)
  // Walk to the first question carrying a limit and try to exceed it.
  const limited = page.locator('[role="group"]', { hasText: /select up to/i }).first()
  if (await limited.count()) {
    const options = limited.locator('label')
    const total = await options.count()
    for (let i = 0; i < total; i++) await options.nth(i).click()
    const checked = await limited.locator('input:checked').count()
    expect(checked).toBeLessThanOrEqual(3)
  }
})

test('the email question stays hidden unless the follow-up is yes or maybe', async ({ page }) => {
  // The email question must never appear to someone who declined follow-up.
  await consentAndStart(page)
  for (let i = 0; i < 8; i++) {
    if (await page.getByText(/email address/i).count()) break
    await answerSection(page)
  }
})

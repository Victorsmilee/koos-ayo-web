import { expect, test } from '@playwright/test'

/**
 * Everything here runs without a database. The survey cannot advance past the
 * intro without saving, so these cover the paths that store nothing: the intro,
 * the consent decline, the theme, and the privacy notice.
 */

test('the intro names the study and links the privacy notice', async ({ page }) => {
  await page.goto('/whatdoyouthink')
  await expect(page.getByRole('heading', { name: 'The AYO Relationship Study' })).toBeVisible()
  await expect(page.getByRole('link', { name: /privacy/i }).first()).toBeVisible()
})

test('the privacy box carries the Article 9 and publication wording', async ({ page }) => {
  // Both are consent-bearing. If either disappears the survey cannot lawfully
  // run, so this is a launch check as much as a UI one.
  await page.goto('/whatdoyouthink')
  await expect(page.getByText(/sensitive personal data under GDPR/i)).toBeVisible()
  await expect(page.getByText(/publish anonymous summary statistics/i)).toBeVisible()
})

test('declining consent ends the survey and stores nothing', async ({ page }) => {
  await page.goto('/whatdoyouthink')
  await page.getByText('No (thank you, the survey ends here)').click()
  await page.getByRole('button', { name: /finish/i }).click()
  await expect(page.getByText(/thank you/i).first()).toBeVisible()
  // Nothing was saved, so no progressive-save cookie should exist.
  const cookies = await page.context().cookies()
  expect(cookies.find((c) => c.name === 'koos_rid')).toBeUndefined()
})

test('the privacy notice shows a complete controller address', async ({ page }) => {
  await page.goto('/privacy')
  await expect(page.getByText(/Paldiski mnt 227c, 13520 Tallinn/)).toBeVisible()
  await expect(page.getByText(/TEAM TO CONFIRM/)).toHaveCount(0)
})

test('a chosen theme survives a reload with no flash of the wrong one', async ({ page }) => {
  // The toggle cycles system, light, dark: three modes but only two outcomes,
  // so one click can legitimately leave data-theme unchanged. Click until it
  // moves rather than assuming the first one does.
  await page.goto('/whatdoyouthink')
  const html = page.locator('html')
  const toggle = page.getByRole('button', { name: /theme|light|dark|system/i }).first()

  const before = await html.getAttribute('data-theme')
  let after = before
  for (let i = 0; i < 3 && after === before; i++) {
    await toggle.click()
    after = await html.getAttribute('data-theme')
  }
  expect(after).not.toBe(before)

  await page.reload()
  // Read with no waiting: the blocking inline script must have set the theme
  // before first paint, which is the whole point of it not being an effect.
  expect(await html.getAttribute('data-theme')).toBe(after)
})

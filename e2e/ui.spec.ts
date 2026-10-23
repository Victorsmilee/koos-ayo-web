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

test('the privacy notice opens in a new tab, so the survey is not lost', async ({ page }) => {
  await page.goto('/whatdoyouthink')
  const link = page.getByRole('link', { name: /privacy notice/i })
  await expect(link).toHaveAttribute('target', '_blank')
  // Without noopener the opened page can reach back through window.opener.
  await expect(link).toHaveAttribute('rel', /noopener/)
  // Announced, not silent: a link that spawns a tab without saying so is
  // disorienting for screen reader users.
  await expect(link).toContainText(/opens in a new tab/i)
})

test('the navigation stays reachable without scrolling to the end', async ({
  page,
}, testInfo) => {
  // The whole point of the sticky footer. Unprovable by reading the code, and
  // it only matters on a phone, where the intro is several screens long.
  test.skip(testInfo.project.name !== 'phone', 'phone viewport only')

  await page.goto('/whatdoyouthink')
  const next = page.getByRole('button', { name: /start|next|finish/i }).first()

  // Visible at the top, before any scrolling.
  await expect(next).toBeInViewport()

  // Still visible halfway down, which is where someone answering question 1
  // actually is.
  await page.mouse.wheel(0, 600)
  await expect(next).toBeInViewport()

  // And at the very bottom it settles into the flow rather than floating, so
  // nothing is left permanently hidden behind it. Content passing under the
  // bar mid-scroll is how sticky works; content still under it when you have
  // scrolled as far as you can is a bug.
  await page.keyboard.press('End')
  // Wait for the scroll to settle. Measuring mid-scroll reports an overlap that
  // is not there, which is what the first version of this check did.
  await page.waitForFunction(
    () => window.scrollY + window.innerHeight >= document.body.scrollHeight - 2,
  )
  await expect(next).toBeInViewport()

  const overlap = await page.evaluate(() => {
    const bar = document.querySelector('.sticky')
    if (!bar) return null
    // Paragraphs inside the bar trivially overlap it, so only the page content
    // counts. This caught out the first version of this check.
    const content = [...document.querySelectorAll('p')].filter((el) => !bar.contains(el))
    const last = content.pop()
    if (!last) return null
    return last.getBoundingClientRect().bottom > bar.getBoundingClientRect().top
  })
  expect(overlap, 'the last paragraph is hidden behind the sticky bar').toBe(false)
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

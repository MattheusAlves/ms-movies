import { expect, test } from '@playwright/test'

test('reveals the synopsis on hover and keyboard focus', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Hover and keyboard focus are checked on desktop')
  await page.route('**/_next/image?*', route => route.fulfill({
    status: 200, contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aYkAAAAASUVORK5CYII=', 'base64')
  }))
  await page.goto('/movies')
  const cover = page.getByRole('link', { name: 'View Fixture Movie', exact: true })
  const summary = cover.locator('.poster-overlay')
  await expect(summary).toHaveCSS('opacity', '0')
  await expect(summary).toHaveCSS('transition-duration', '0.5s')
  await expect(summary).toHaveCSS('transition-timing-function', 'ease-in-out')
  expect(await summary.evaluate(element => getComputedStyle(element).backgroundImage)).toContain('rgba(0, 0, 0, 0.5)')
  await cover.hover()
  await expect(summary).toHaveCSS('opacity', '1')
  await expect(summary).toContainText('A fixture movie.')
  await page.mouse.move(0, 0)
  await cover.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(summary).toHaveCSS('opacity', '1')
  await expect(cover).toHaveAccessibleDescription('A fixture movie.')
})

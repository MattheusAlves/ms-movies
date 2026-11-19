import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const route of ['/movies', '/search/fixture', '/info/movie/101', '/to-watch']) {
  test(`checks accessibility on ${route}`, async ({ page }) => {
    await page.route('**/_next/image?*', route => route.fulfill({
      status: 200, contentType: 'image/png',
      body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aYkAAAAASUVORK5CYII=', 'base64')
    }))
    await page.goto(route)
    await expect(page.locator('main')).toBeVisible()
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(results.violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(', ')).join('; ')}`)).toEqual([])
  })
}

test('mobile navigation opens and closes with a keyboard and remains accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.route('**/_next/image?*', route => route.fulfill({
    status: 200, contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aYkAAAAASUVORK5CYII=', 'base64')
  }))
  await page.goto('/movies')
  const menu = page.getByRole('button', { name: 'Toggle navigation' })
  await menu.focus()
  await page.keyboard.press('Enter')
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  const search = page.getByRole('searchbox', { name: 'Search movies and series' })
  await search.focus()
  await expect(search).toBeFocused()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(results.violations.map(violation => violation.id)).toEqual([])
  await page.keyboard.press('Escape')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(menu).toBeFocused()
})

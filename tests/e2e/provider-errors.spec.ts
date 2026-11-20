import { expect, test } from '@playwright/test'

test.beforeEach(async ({ context }) => {
  await context.route('**/_next/image?*', route => route.fulfill({
    status: 200,
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aYkAAAAASUVORK5CYII=', 'base64')
  }))
})

test('shows a safe recovery screen when server-side search fails', async ({ page }) => {
  await page.goto('/search/offline-fixture')
  await expect(page.getByRole('heading', { name: 'Unable to load this page' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  await expect(page.locator('body')).not.toContainText('fixture-key')
  await expect(page.locator('body')).not.toContainText('Fixture outage')
})

test('shows a safe recovery screen when title details fail', async ({ page }) => {
  await page.goto('/info/movie/999')
  await expect(page.getByRole('heading', { name: 'Unable to load this page' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  await expect(page.locator('body')).not.toContainText('fixture-key')
  await expect(page.locator('body')).not.toContainText('Fixture outage')
})

test('keeps discovery data visible and retries a failed refresh', async ({ page }) => {
  let fail = true
  await page.route('**/api/movies/popular?*', route => fail
    ? route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"Api error"}' })
    : route.continue())
  await page.goto('/movies')
  await expect(page.getByAltText('Fixture Movie').first()).toBeVisible()
  await expect(page.getByText('Unable to refresh titles. Please try again.')).toBeVisible()
  fail = false
  await page.getByRole('button', { name: 'Retry' }).click()
  await expect(page.getByText('Unable to refresh titles. Please try again.')).toBeHidden()
  await expect(page.getByAltText('Fixture Movie').first()).toBeVisible()
})

test('shows useful messages when optional detail APIs fail', async ({ page }) => {
  for (const pattern of ['**/api/cast/**', '**/api/info/trailer/**', '**/api/info/watchproviders/**']) {
    await page.route(pattern, route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"Api error"}' }))
  }
  await page.goto('/info/movie/101')
  await expect(page.getByText('A fixture movie.')).toBeVisible()
  await expect(page.getByText('Cast information is temporarily unavailable.')).toBeVisible()
  await expect(page.getByText('Trailer information is temporarily unavailable.')).toBeVisible()
  await expect(page.getByText('Streaming availability is temporarily unavailable.')).toBeVisible()
})

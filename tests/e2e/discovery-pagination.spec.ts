import { expect, test } from '@playwright/test'

test('automatically loads another page and stops at the last page', async ({ page }) => {
  await page.route('**/_next/image?*', route => route.fulfill({
    status: 200,
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aYkAAAAASUVORK5CYII=', 'base64')
  }))
  let release!: () => void
  const gate = new Promise<void>(resolve => { release = resolve })
  let pageTwoRequests = 0
  await page.route('**/api/movies/popular?page=2', async route => {
    pageTwoRequests++
    await gate
    await route.continue()
  })
  await page.goto('/movies')
  await expect(page.getByAltText('Fixture Movie', { exact: true })).toBeVisible()
  await page.locator('.scroll-sentinel').scrollIntoViewIfNeeded()
  await expect.poll(() => pageTwoRequests).toBe(1)
  await expect(page.getByText('Loading more titles…')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Load more' })).toHaveCount(0)
  release()
  await expect(page.getByAltText('Fixture Movie Two')).toBeVisible()
  await expect(page.getByText('You’ve reached the end.')).toBeVisible()
  expect(pageTwoRequests).toBe(1)
})

test('keeps loaded titles and retries a failed next page', async ({ page }) => {
  await page.route('**/_next/image?*', route => route.fulfill({
    status: 200,
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aYkAAAAASUVORK5CYII=', 'base64')
  }))
  let fail = true
  await page.route('**/api/movies/popular?page=2', route => fail
    ? route.fulfill({ status: 503, contentType: 'application/json', body: '{}' })
    : route.continue())
  await page.goto('/movies')
  await expect(page.getByText('Unable to refresh titles. Please try again.')).toBeVisible()
  await expect(page.getByAltText('Fixture Movie', { exact: true })).toBeVisible()
  fail = false
  await page.getByRole('button', { name: 'Retry' }).click()
  await expect(page.getByAltText('Fixture Movie Two')).toBeVisible()
  await expect(page.getByText('You’ve reached the end.')).toBeVisible()
})

import { expect, test } from '@playwright/test'

const key = 'ms.watchlist.v1'
const legacyMovie = { mediaId: 101, mediaType: 'movie', title: 'Legacy Movie', poster_path: '/legacy.jpg' }
const legacySeries = { mediaId: 101, mediaType: 'tv', title: 'Legacy Series', poster_path: '/legacy-tv.jpg' }

test.beforeEach(async ({ context }) => {
  await context.route('**/_next/image?*', route => route.fulfill({
    status: 200,
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aYkAAAAASUVORK5CYII=', 'base64')
  }))
})

test('imports old cookies without changing them and retains same-ID media separately', async ({ page, context, baseURL }) => {
  const list = JSON.stringify([legacyMovie, legacySeries])
  const ids = JSON.stringify([101])
  await context.addCookies([
    { name: 'ToWatchList', value: encodeURIComponent(list), url: baseURL! },
    { name: 'itemsId', value: encodeURIComponent(ids), url: baseURL! }
  ])
  await page.goto('/to-watch')
  await expect(page.getByAltText('Legacy Movie')).toBeVisible()
  await expect(page.getByAltText('Legacy Series')).toBeVisible()
  const stored = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)!), key)
  expect(stored.version).toBe(1)
  expect(stored.items).toMatchObject([
    { mediaId: 101, mediaType: 'movie', posterPath: '/legacy.jpg' },
    { mediaId: 101, mediaType: 'tv', posterPath: '/legacy-tv.jpg' }
  ])
  const cookies = await context.cookies()
  expect(decodeURIComponent(cookies.find(cookie => cookie.name === 'ToWatchList')!.value)).toBe(list)
  expect(decodeURIComponent(cookies.find(cookie => cookie.name === 'itemsId')!.value)).toBe(ids)
  await page.reload()
  await expect(page.getByAltText('Legacy Movie')).toBeVisible()
  await expect(page.getByAltText('Legacy Series')).toBeVisible()
})

test('retains malformed legacy data and prevents destructive edits', async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: 'ToWatchList', value: encodeURIComponent('{broken'), url: baseURL! }])
  await page.goto('/movies')
  await expect(page.getByText(/Your saved watchlist could not be read safely/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add Fixture Movie to watchlist' }).first()).toBeDisabled()
  expect(await page.evaluate(storageKey => localStorage.getItem(storageKey), key)).toBeNull()
  const cookie = (await context.cookies()).find(item => item.name === 'ToWatchList')!
  expect(decodeURIComponent(cookie.value)).toBe('{broken')
})

test('warns when migration cannot write without changing legacy cookies', async ({ page, context, baseURL }) => {
  const legacy = JSON.stringify([legacyMovie])
  await context.addCookies([{ name: 'ToWatchList', value: encodeURIComponent(legacy), url: baseURL! }])
  await page.addInitScript(storageKey => {
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (name, value) {
      if (name === storageKey) throw new DOMException('Storage blocked', 'QuotaExceededError')
      return setItem.call(this, name, value)
    }
  }, key)
  await page.goto('/to-watch')
  await expect(page.getByAltText('Legacy Movie')).toBeVisible()
  await expect(page.getByText(/Watchlist storage is unavailable/)).toBeVisible()
  expect(await page.evaluate(storageKey => localStorage.getItem(storageKey), key)).toBeNull()
  expect(decodeURIComponent((await context.cookies()).find(item => item.name === 'ToWatchList')!.value)).toBe(legacy)
})

test('synchronizes saved items across tabs', async ({ page, context }, testInfo) => {
  const other = await context.newPage()
  await page.goto('/movies')
  await other.goto('/movies')
  if (testInfo.project.name === 'desktop') await page.locator('.poster-wrapper').first().hover()
  await page.getByRole('button', { name: 'Add Fixture Movie to watchlist' }).first().click()
  await expect(other.getByRole('button', { name: 'Remove Fixture Movie from watchlist' }).first()).toBeAttached()
  await other.close()
})

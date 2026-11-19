import { expect, test } from '@playwright/test'

test.beforeEach(async ({ context }) => {
  await context.route('**/_next/image?*', route => route.fulfill({
    status: 200, contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aYkAAAAASUVORK5CYII=', 'base64')
  }))
})

test('filters search results and shows an empty state', async ({ page }) => {
  await page.goto('/search/fixture')
  await expect(page.getByText('Filters apply to loaded results.')).toBeVisible()
  await expect(page.getByText('2 titles shown')).toBeVisible()
  await expect(page.getByRole('link', { name: 'View Fixture Movie' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'View Fixture Series' })).toBeVisible()
  await page.getByRole('button', { name: 'Movies' }).click()
  await expect(page.getByText('1 title shown')).toBeVisible()
  await expect(page.getByRole('link', { name: 'View Fixture Series' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Series' }).click()
  await expect(page.getByRole('link', { name: 'View Fixture Movie' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'View Fixture Series' })).toBeVisible()
  await page.getByRole('button', { name: 'Load more results' }).click()
  await expect(page.getByRole('button', { name: 'All results loaded' })).toHaveAttribute('aria-disabled', 'true')
  await page.getByRole('button', { name: 'Movies' }).click()
  await expect(page.getByRole('link', { name: 'View Another Fixture Movie' })).toBeVisible()
  await page.goto('/search/nothing-fixture')
  await expect(page.getByText('No titles found. Try another search.')).toBeVisible()
})

test('keeps search results when the next page fails and retries', async ({ page }) => {
  let requests = 0
  await page.route('**/api/search?*', async route => {
    requests++
    if (requests === 1) await route.fulfill({ status: 503, body: '{}' })
    else await route.continue()
  })
  await page.goto('/search/Space%20%26%20Time')
  await page.getByRole('button', { name: 'Load more results' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Unable to load more results' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'View Fixture Movie' })).toBeVisible()
  await page.getByRole('button', { name: 'Retry loading results' }).click()
  await expect(page.getByRole('link', { name: 'View Another Fixture Movie' })).toBeVisible()
  expect(requests).toBe(2)
})

test('places movie artwork near the top of discovery', async ({ page }) => {
  await page.goto('/movies')
  const header = await page.locator('.site-header').boundingBox()
  const poster = await page.locator('.poster-art').first().boundingBox()
  expect(header).not.toBeNull()
  expect(poster).not.toBeNull()
  expect(poster!.y - (header!.y + header!.height)).toBeLessThan(100)
})

test('aligns both ends of the header with page content', async ({ page }) => {
  for (const width of [320, 760, 761, 1280, 1800]) {
    await page.setViewportSize({ width, height: 800 })
    for (const route of ['/movies', '/info/movie/101']) {
      await page.goto(route)
      const edges = await page.evaluate(() => {
        const main = document.querySelector('main')!
        const box = main.getBoundingClientRect()
        const style = getComputedStyle(main)
        const left = box.left + parseFloat(style.paddingLeft)
        const right = box.right - parseFloat(style.paddingRight)
        const brand = document.querySelector('.brand')!.getBoundingClientRect()
        const control = document.querySelector(window.innerWidth <= 760 ? '.burger' : '.site-search')!.getBoundingClientRect()
        return { left, right, brandLeft: brand.left, controlRight: control.right }
      })
      expect(Math.abs(edges.brandLeft - edges.left), `${route} at ${width}px: left edge`).toBeLessThan(1)
      expect(Math.abs(edges.controlRight - edges.right), `${route} at ${width}px: right edge`).toBeLessThan(1)
    }
  }
})

test('uses valid TMDB poster and cast image sizes', async ({ page }) => {
  await page.goto('/movies')
  const imageUrl = async (name: string) => {
    const src = await page.getByAltText(name, { exact: true }).first().getAttribute('src')
    return new URL(src!, 'http://localhost').searchParams.get('url')
  }
  expect(await imageUrl('Fixture Movie')).toContain('/w500/fixture.jpg')
  await page.goto('/info/movie/101')
  await expect(page.getByAltText('Fixture Actor')).toBeVisible()
  expect(await imageUrl('Fixture Movie')).toContain('/w500/fixture.jpg')
  expect(await imageUrl('Fixture Actor')).toContain('/w185/fixture-actor.jpg')
})

test('keeps the title beside the poster on narrow detail screens', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/info/movie/101')
  const poster = await page.getByAltText('Fixture Movie', { exact: true }).boundingBox()
  const title = await page.getByRole('heading', { name: 'Fixture Movie.' }).evaluate(element => {
    const range = document.createRange()
    range.selectNodeContents(element.firstChild!)
    const rect = range.getClientRects()[0]
    return { x: rect.x, y: rect.y }
  })
  expect(poster).not.toBeNull()
  expect(title.x).toBeGreaterThanOrEqual(poster!.x + poster!.width)
  expect(title.y).toBeLessThan(poster!.y + poster!.height)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('detail watchlist control and credits work', async ({ page }) => {
  await page.goto('/info/movie/101')
  await page.getByRole('button', { name: 'Save to watchlist — Fixture Movie' }).click()
  await expect(page.getByRole('button', { name: 'Saved to watchlist — remove Fixture Movie' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText('Availability information provided by JustWatch via TMDB.')).toBeVisible()
  await expect(page.getByAltText('TMDB logo')).toBeAttached()
  await expect(page.getByText('This application uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.')).toBeAttached()
  await expect(page.getByRole('contentinfo', { name: 'Credits' }).locator('p')).toHaveCount(1)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Saved to watchlist — remove Fixture Movie' })).toHaveAttribute('aria-pressed', 'true')
})

test('keeps the credits footer compact on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/movies')
  const footer = page.getByRole('contentinfo', { name: 'Credits' })
  await expect(footer.locator('p')).toHaveCount(1)
  const bounds = await footer.boundingBox()
  expect(bounds).not.toBeNull()
  expect(bounds!.height).toBeLessThanOrEqual(110)
})

test('empty watchlist and missing detail artwork are handled', async ({ page }) => {
  await page.goto('/to-watch')
  await expect(page.getByText('Your watchlist is empty. Save a title to keep it here.')).toBeVisible()
  await page.goto('/info/movie/998')
  await expect(page.getByAltText('Fixture Movie')).toHaveAttribute('src', /404\.png/)
})

test('keyboard users can skip navigation and open a title', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Keyboard navigation is checked in the desktop project')
  await page.goto('/movies')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  const link = page.getByRole('link', { name: 'View Fixture Movie' })
  await link.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/info\/movie\/101$/)
})

test('fits a narrow viewport and respects reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/movies')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await expect(page.getByRole('button', { name: 'Add Fixture Movie to watchlist' })).toBeVisible()
})

test('header becomes opaque on scroll and transparent again at the top', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 })
  await page.goto('/movies')
  const header = page.locator('.site-header')
  await expect(header).toHaveClass(/site-header--transparent/)
  await page.evaluate(() => { const spacer = document.createElement('div'); spacer.style.height = '500px'; document.body.appendChild(spacer) })
  await page.evaluate(() => window.scrollTo(0, 100))
  await expect(header).not.toHaveClass(/site-header--transparent/)
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(header).toHaveClass(/site-header--transparent/)
})

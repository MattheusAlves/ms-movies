import { expect, test } from '@playwright/test'
import sharp from 'sharp'

test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } })

test.beforeEach(async ({ page }) => {
  await page.route('**/_next/image?*', route => route.fulfill({
    status: 200,
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aYkAAAAASUVORK5CYII=', 'base64')
  }))
})

test('opens a title instantly in a modal without navigating', async ({ page }) => {
  await page.goto('/movies')
  await page.getByRole('link', { name: 'View Fixture Movie', exact: true }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  // No navigation: the URL stays on discovery while the modal is open.
  await expect(page).toHaveURL(/\/movies$/)
  await expect(dialog.getByRole('heading', { name: /Fixture Movie/ })).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Save to watchlist — Fixture Movie' })).toBeVisible()
  await expect(page).toHaveTitle('MS - Fixture Movie')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page).toHaveURL(/\/movies$/)
})

test('closes the modal with its close button', async ({ page }) => {
  await page.goto('/series')
  await page.getByRole('link', { name: 'View Fixture Series', exact: true }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(page).toHaveURL(/\/series$/)
  await expect(dialog.getByRole('heading', { name: /Fixture Series/ })).toBeVisible()
  await dialog.getByRole('button', { name: 'Close details' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page).toHaveURL(/\/series$/)
})

test('direct visits render the standalone detail page without a dialog', async ({ page }) => {
  await page.goto('/info/movie/101')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('main').getByRole('heading', { name: /Fixture Movie/ })).toBeVisible()
})

test('the modal scrollbar does not paint over the rounded top corner', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Mobile uses overlay scrollbars')
  await page.setViewportSize({ width: 900, height: 700 })
  await page.goto('/movies')
  await page.getByRole('link', { name: 'View Fixture Movie', exact: true }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: /Fixture Movie/ })).toBeVisible()
  await page.addStyleTag({ content: '[class*="modalScrim"] { background: black !important; opacity: 1 !important; backdrop-filter: none !important; } .detail-backdrop { visibility: hidden !important; }' })
  const { data, info } = await sharp(await dialog.screenshot({ scale: 'css' })).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  let brightPixels = 0
  for (let y = 1; y < 16; y++) {
    for (let x = info.width - 14; x < info.width - 1; x++) {
      const offset = (y * info.width + x) * info.channels
      if (data[offset] > 100 && data[offset + 1] > 100 && data[offset + 2] > 100) brightPixels++
    }
  }
  expect(brightPixels).toBe(0)
})


test('detail modal fits its width while retaining vertical scrolling', async ({ page }) => {
  await page.route('**/api/cast/movie/101', route => route.fulfill({
    json: Array.from({ length: 12 }, (_, index) => ({
      id: index + 1, profile_path: '/fixture-actor.jpg', name: `Fixture Actor ${index + 1}`
    }))
  }))
  await page.goto('/movies')
  await page.getByRole('link', { name: 'View Fixture Movie', exact: true }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: /Fixture Movie/ })).toBeVisible()
  await expect(dialog.getByText('Fixture Actor 1', { exact: true })).toBeVisible()
  await page.emulateMedia({ reducedMotion: 'reduce' })

  for (const width of [320, 390, 761, 1280, 1600]) {
    await page.setViewportSize({ width, height: 700 })
    const dimensions = await dialog.evaluate(element => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight
    }))
    expect(dimensions.scrollWidth, `modal scroll width at ${width}px`).toBeLessThanOrEqual(dimensions.clientWidth)
    expect(dimensions.scrollHeight, `modal vertical content at ${width}px`).toBeGreaterThan(dimensions.clientHeight)
    const backdrop = dialog.locator('.detail-backdrop')
    await backdrop.evaluate(element => { element.style.animation = 'none'; element.style.transform = 'scale(1.04)' })
    const animatedWidth = await dialog.evaluate(element => element.scrollWidth - element.clientWidth)
    expect(animatedWidth, `animated backdrop overflow at ${width}px`).toBeLessThanOrEqual(0)
    await backdrop.evaluate(element => { element.style.animation = ''; element.style.transform = '' })
  }
  const cast = dialog.getByRole('list', { name: 'Cast members, scroll horizontally' })
  expect(await cast.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true)
  await cast.evaluate(element => { element.scrollLeft = 144 })
  expect(await cast.evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
  await dialog.evaluate(element => { element.scrollTop = 200 })
  expect(await dialog.evaluate(element => element.scrollTop)).toBeGreaterThan(0)
})

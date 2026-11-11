import { expect, test } from '@playwright/test'

test('discovery, watchlist, search and details work after hydration', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  // Fixture poster paths are not real TMDB images. Keep browser checks offline.
  await page.route('**/_next/image?*', route => route.fulfill({
    status: 200,
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aYkAAAAASUVORK5CYII=', 'base64')
  }))
  await page.route('**/youtube.com/embed/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '' }))

  await page.goto('/movies')
  const save = page.getByRole('button', { name: 'Add Fixture Movie to watchlist' }).first()
  if (testInfo.project.name === 'desktop') await page.locator('.poster-wrapper').first().hover()
  await expect(save).toBeVisible()
  await save.click()
  await expect(page.getByRole('button', { name: 'Remove Fixture Movie from watchlist' }).first()).toBeAttached()

  await page.reload()
  await expect(page.getByRole('button', { name: 'Remove Fixture Movie from watchlist' }).first()).toBeAttached()
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Toggle navigation' }).click()
  await page.getByRole('link', { name: 'My watchlist' }).click()
  await expect(page).toHaveURL(/\/to-watch$/)
  await expect(page.getByAltText('Fixture Movie').first()).toBeVisible()
  await page.reload()
  await expect(page.getByAltText('Fixture Movie').first()).toBeVisible()

  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Toggle navigation' }).click()
  await page.locator('.search-icon').click()
  await page.getByRole('searchbox', { name: 'Search movies and series' }).fill('fixture')
  await page.getByRole('searchbox', { name: 'Search movies and series' }).press('Enter')
  await expect(page).toHaveURL(/\/search\/fixture$/)
  await expect(page.getByAltText('Fixture Movie').first()).toBeVisible()

  await page.locator('.poster-wrapper').first().click()
  await expect(page).toHaveURL(/\/info\/movie\/101$/)
  await expect(page).toHaveTitle('MS - Fixture Movie')
  await expect(page.getByText('A fixture movie.')).toBeVisible()
  await expect(page.getByAltText('Fixture Actor')).toBeVisible()
  await expect(page.getByText('Available in Brazil ▼')).toBeVisible()
  await expect(page.getByText('Fixture Stream')).toBeVisible()
  await expect(page.locator('iframe[title="video"]')).toHaveAttribute('src', /fixture-video/)

  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Toggle navigation' }).click()
  await page.getByRole('link', { name: 'Series' }).click()
  await expect(page).toHaveURL(/\/series$/)
  await expect(page.getByAltText('Fixture Series').first()).toBeVisible()
  expect(errors).toEqual([])
})

test('poster failures show the local fallback', async ({ page }) => {
  await page.route('**/_next/image?*', route => {
    const imageUrl = new URL(route.request().url()).searchParams.get('url') || ''
    if (imageUrl.includes('fixture.jpg')) return route.fulfill({ status: 404 })
    return route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aYkAAAAASUVORK5CYII=', 'base64')
    })
  })
  await page.goto('/movies')
  await expect(page.getByAltText('Fixture Movie').first()).toHaveAttribute('src', /404\.png/)
})

for (const [resource, title, mediaType, id] of [
  ['movies', 'Fixture Movie', 'movie', 101],
  ['series', 'Fixture Series', 'tv', 202]
] as const) {
  test(`${resource} discovery keeps its media type after search and Back`, async ({ page }, testInfo) => {
    await page.route('**/_next/image?*', route => route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aYkAAAAASUVORK5CYII=', 'base64')
    }))
    const discoveryResponse = await page.request.get(`/api/${resource}/popular?page=1`)
    expect(discoveryResponse.ok()).toBe(true)
    const discovery = await discoveryResponse.json()
    expect(discovery.results[0]).not.toHaveProperty('media_type')

    await page.goto(`/${resource}`)
    if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Toggle navigation' }).click()
    await page.locator('.search-icon').click()
    const search = page.getByRole('searchbox', { name: 'Search movies and series' })
    await search.fill('fixture')
    await search.press('Enter')
    await expect(page).toHaveURL(/\/search\/fixture$/)
    await page.goBack()
    await expect(page).toHaveURL(new RegExp(`/${resource}$`))
    await expect(page.getByAltText(title).first()).toBeVisible()

    const poster = page.locator('.poster-wrapper').first()
    if (testInfo.project.name === 'desktop') await poster.hover()
    await poster.getByRole('button', { name: `Add ${title} to watchlist` }).click()
    await expect.poll(async () => {
      return page.evaluate(mediaId => {
        const raw = localStorage.getItem('ms.watchlist.v1')
        return raw ? JSON.parse(raw).items.find(item => item.mediaId === mediaId)?.mediaType : undefined
      }, id)
    }).toBe(mediaType)
    await poster.click()
    await expect(page).toHaveURL(new RegExp(`/info/${mediaType}/${id}$`))
  })
}

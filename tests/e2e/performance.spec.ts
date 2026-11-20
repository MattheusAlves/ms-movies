import { expect, test } from '@playwright/test'

declare global {
  interface Window {
    fixtureVitals: { lcp: number | null; cls: number }
  }
}

// This is a local fixture measurement, not production field data or an INP measurement.
for (const route of ['/movies', '/search/fixture', '/info/movie/101']) {
  test(`records fixture performance for ${route}`, async ({ page }, testInfo) => {
    await page.route('**/_next/image?*', route => route.fulfill({
      status: 200, contentType: 'image/png',
      body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aYkAAAAASUVORK5CYII=', 'base64')
    }))
    await page.addInitScript(() => {
      window.fixtureVitals = { lcp: null, cls: 0 }
      let sessionStart = 0
      let lastShift = 0
      let sessionValue = 0
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) window.fixtureVitals.lcp = entry.startTime
      }).observe({ type: 'largest-contentful-paint', buffered: true })
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number }
          if (!shift.hadRecentInput) {
            if (!sessionValue || shift.startTime - lastShift >= 1000 || shift.startTime - sessionStart >= 5000) {
              sessionStart = shift.startTime
              sessionValue = 0
            }
            lastShift = shift.startTime
            sessionValue += shift.value
            window.fixtureVitals.cls = Math.max(window.fixtureVitals.cls, sessionValue)
          }
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto(route, { waitUntil: 'networkidle' })
    await expect(page.locator('main')).toBeVisible()
    const measurement = await page.evaluate(async () => {
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const scripts = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      return {
        lcpMs: window.fixtureVitals.lcp === null ? null : Math.round(window.fixtureVitals.lcp),
        cls: Number(window.fixtureVitals.cls.toFixed(4)),
        ttfbMs: Math.round(navigation.responseStart),
        encodedScriptBytes: scripts.filter(resource => resource.initiatorType === 'script' || resource.name.includes('.js')).reduce((sum, resource) => sum + resource.encodedBodySize, 0)
      }
    })
    console.log(`Fixture performance ${testInfo.project.name} ${route}: ${JSON.stringify(measurement)}`)
    await page.screenshot({ path: testInfo.outputPath('layout.png') })
    expect(measurement.encodedScriptBytes).toBeGreaterThan(0)
  })
}

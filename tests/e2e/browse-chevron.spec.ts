import { expect, test } from '@playwright/test'
import sharp from 'sharp'

test('browse chevron stays visually centered beside its label', async ({ page }, testInfo) => {
  await page.route('**/_next/image?*', route => route.fulfill({
    status: 200,
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aYkAAAAASUVORK5CYII=', 'base64')
  }))
  await page.goto('/movies')
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Toggle navigation' }).click()
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({ content: '.browse-trigger { background: black !important; color: white !important; } .browse-chevron { transition: none !important; }' })

  const browse = page.getByRole('button', { name: 'Browse' })
  const alignment = async () => {
    const boundaries = await browse.evaluate(button => {
      const text = document.createRange()
      text.selectNodeContents(button.firstChild!)
      const buttonRect = button.getBoundingClientRect()
      const textRect = text.getBoundingClientRect()
      const iconRect = button.querySelector('.browse-chevron')!.getBoundingClientRect()
      return {
        text: [textRect.left - buttonRect.left, textRect.right - buttonRect.left],
        icon: [iconRect.left - buttonRect.left, iconRect.right - buttonRect.left]
      }
    })
    const screenshot = await browse.screenshot({ scale: 'css' })
    const { data, info } = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    const center = ([left, right]: number[]) => {
      let top = info.height
      let bottom = -1
      for (let y = 0; y < info.height; y++) {
        for (let x = Math.max(0, Math.floor(left)); x < Math.min(info.width, Math.ceil(right)); x++) {
          const offset = (y * info.width + x) * info.channels
          if (data[offset] > 100 && data[offset + 1] > 100 && data[offset + 2] > 100) {
            top = Math.min(top, y)
            bottom = Math.max(bottom, y)
          }
        }
      }
      expect(bottom).toBeGreaterThanOrEqual(top)
      return (top + bottom) / 2
    }
    return Math.abs(center(boundaries.text) - center(boundaries.icon))
  }

  expect(await alignment()).toBeLessThanOrEqual(2)
  await browse.click()
  await expect(browse).toHaveAttribute('aria-expanded', 'true')
  expect(await alignment()).toBeLessThanOrEqual(2)
})

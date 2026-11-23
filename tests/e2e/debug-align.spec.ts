import { expect, test } from '@playwright/test'

test('debug alignment at 761px', async ({ page }) => {
  await page.setViewportSize({ width: 761, height: 800 })
  await page.goto('/movies')
  await page.evaluate(() => { document.documentElement.style.scrollbarWidth = 'none' })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
  
  const info = await page.evaluate(() => {
    const main = document.querySelector('main')!
    const box = main.getBoundingClientRect()
    const style = getComputedStyle(main)
    const burger = document.querySelector('.burger')!
    const controlEl = getComputedStyle(burger).display === 'none' ? document.querySelector('.site-search')! : burger
    const control = controlEl.getBoundingClientRect()
    const brand = document.querySelector('.brand')!.getBoundingClientRect()
    const nav = document.querySelector('.site-nav')!.getBoundingClientRect()
    const navPanel = document.querySelector('.nav-panel')!.getBoundingClientRect()
    const links = document.querySelector('.nav-links')!.getBoundingClientRect()
    return {
      mainL: box.left + parseFloat(style.paddingLeft),
      mainR: box.right - parseFloat(style.paddingRight),
      brandL: brand.left,
      controlR: control.right,
      control: String(controlEl.className),
      navL: nav.left,
      navR: nav.right,
      navPanelR: navPanel.right,
      linksR: links.right,
      linksW: links.width,
      searchW: document.querySelector('.site-search')!.getBoundingClientRect().width,
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      clientW: document.documentElement.clientWidth,
    }
  })
  console.log('DEBUG', JSON.stringify(info, null, 2))
  expect(true).toBe(true)
})

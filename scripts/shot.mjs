// Quick visual verification of the atlas at various states.
// Usage: node scripts/shot.mjs <url> <outDir>
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const url = process.argv[2] ?? 'http://localhost:5199/'
const outDir = process.argv[3] ?? 'shots'
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (err) => errors.push(String(err)))

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)

// 1. Intro overlay
await page.screenshot({ path: join(outDir, '01-intro.png') })

// 2. Begin -> Act 1 (1200 BCE)
await page.click('.intro-begin')
await page.waitForTimeout(2000)
await page.screenshot({ path: join(outDir, '02-act1-1200.png') })

// 3. Drag the slider near 850 BCE (Omride Israel)
await page.evaluate(() => {
  const input = document.querySelector('.timeline-input')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(input, 853)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
})
await page.waitForTimeout(1800)
await page.screenshot({ path: join(outDir, '03-act3-853.png') })

// 4. 722 BCE — Samaria falls (campaign arrow + event popup)
await page.evaluate(() => {
  const input = document.querySelector('.timeline-input')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(input, 722)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
})
await page.waitForTimeout(1800)
await page.screenshot({ path: join(outDir, '04-act4-722.png') })

// 5. 701 BCE — Sennacherib
await page.evaluate(() => {
  const input = document.querySelector('.timeline-input')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(input, 701)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
})
await page.waitForTimeout(1800)
await page.screenshot({ path: join(outDir, '05-act4-701.png') })

// 6. 586 BCE — exile deportations
await page.evaluate(() => {
  const input = document.querySelector('.timeline-input')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(input, 586)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
})
await page.waitForTimeout(1800)
await page.screenshot({ path: join(outDir, '06-act5-586.png') })

// 7. 539 BCE — Cyrus
await page.evaluate(() => {
  const input = document.querySelector('.timeline-input')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(input, 539)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
})
await page.waitForTimeout(1800)
await page.screenshot({ path: join(outDir, '07-act5-539.png') })

// 8. Archaeological toggle on Act 2 (1000 BCE)
await page.evaluate(() => {
  const input = document.querySelector('.timeline-input')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(input, 1000)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
})
await page.waitForTimeout(1200)
await page.click('.toggle-opt:nth-child(2)')
await page.waitForTimeout(1500)
await page.screenshot({ path: join(outDir, '08-act2-arch.png') })

// 9. Mobile viewport
await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(1500)
await page.screenshot({ path: join(outDir, '09-mobile-arch.png') })

// 10. Click a ruler card to open the propaganda sidebar
await page.setViewportSize({ width: 1440, height: 900 })
await page.evaluate(() => {
  const input = document.querySelector('.timeline-input')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(input, 853)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
})
await page.waitForTimeout(1200)
const rulerBtn = await page.locator('.wheel-card', { hasText: 'Ahab' }).first()
if (await rulerBtn.count()) {
  await rulerBtn.click()
  await page.waitForTimeout(1200)
}
await page.screenshot({ path: join(outDir, '10-propaganda-ahab.png') })

console.log('Console errors:', errors.length ? errors : 'none')
await browser.close()

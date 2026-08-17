// Functional QA: asserts the atlas actually does what the data says it does.
// Unlike screenshots, this verifies behavior: layer visibility per year,
// event popups, the toggle, the ruler wheel, and layout overflow.
// Usage: node scripts/qa.mjs
import { chromium } from 'playwright'

const url = 'http://localhost:5199/'
let failures = 0
const ok = (label) => console.log(`  PASS ${label}`)
const bad = (label, detail = '') => {
  failures++
  console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`)
}
const check = (label, cond, detail) => (cond ? ok(label) : bad(label, detail))

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const consoleErrors = []
page.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes('favicon')) consoleErrors.push(m.text())
})
page.on('pageerror', (e) => consoleErrors.push(String(e)))

async function setYear(y) {
  await page.evaluate((year) => {
    const input = document.querySelector('.timeline-input')
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(input, year)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }, y)
  await page.waitForTimeout(900)
}

const bodyText = () => page.evaluate(() => document.body.innerText)
const mapLabels = () =>
  page.evaluate(() => {
    const labels = document.querySelectorAll('.atlas-label')
    return Array.from(labels).map((el) => el.textContent ?? '')
  })

console.log('== Boot ==')
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
await page.click('.intro-begin')
await page.waitForTimeout(1000)

const at1200 = await bodyText()
const labels1200 = await mapLabels()
check('year 1200 label present', at1200.includes('1200 BCE'))
check('Egypt polygon label visible at 1200', labels1200.some((l) => l.includes('Egypt')))
check('Midian label visible at 1200', labels1200.some((l) => l.includes('Midian')))
check('no event popup at boot year 1200', (await page.locator('.event-popup').count()) === 0)

console.log('== Act 3 (853 BCE) ==')
await setYear(853)
const at853 = await bodyText()
const labels853 = await mapLabels()
check('Israel label present', labels853.some((l) => l.includes('Israel')))
check('Judah label present', labels853.some((l) => l.includes('Judah')))
check('Assyria label present', labels853.some((l) => l.includes('Assyria')))
check('Egypt polygon gone by 853', !labels853.some((l) => l.includes('Egypt')), 'Egypt label still rendered')
const note853 = await page.locator('.act-note h2').innerText()
check('act note = Rival Kingdoms', note853 === 'The Rival Kingdoms', note853)

console.log('== Act 4 (722 BCE) ==')
await setYear(722)
const popup722 = await page.locator('.event-popup h3')
check('Samaria falls event popup open', (await popup722.count()) === 1 && (await popup722.innerText()).includes('Samaria falls'))
check('campaign path rendered (animated class)', (await page.locator('.campaign-path').count()) >= 1)

console.log('== Act 5 (586 BCE) ==')
await setYear(586)
const popup586 = await page.locator('.event-popup h3')
check('Jerusalem burns event popup open', (await popup586.count()) === 1 && (await popup586.innerText()).includes('Jerusalem burns'))
check('deportation lines rendered', (await page.locator('.leaflet-overlay-pane path').count()) >= 3)
const at586 = await bodyText()
check('Babylon visible', at586.includes('Babylon'))

console.log('== Toggle (1000 BCE) ==')
await setYear(1000)
await page.click('.toggle-opt:nth-child(2)') // archaeological
await page.waitForTimeout(1000)
const archLabels = await mapLabels()
check('archaeological: chiefdom label present', archLabels.some((l) => l.includes('chiefdom')))
check('archaeological: no United Monarchy polygon label', !archLabels.some((l) => l.includes('United Monarchy')), `labels: ${archLabels.join(', ')}`)
await page.click('.toggle-opt:nth-child(1)') // back to biblical
await page.waitForTimeout(800)
const bibLabels = await mapLabels()
check('biblical: United Monarchy polygon label present', bibLabels.some((l) => l.includes('Israel (biblical)')), `labels: ${bibLabels.join(', ')}`)

console.log('== Ruler wheel (853 BCE, Ahab) ==')
await setYear(853)
const ahabCard = page.locator('.wheel-card', { hasText: 'Ahab' }).first()
check('Ahab card present', (await ahabCard.count()) === 1)
await ahabCard.click()
await page.waitForTimeout(900)
check('propaganda sidebar opens with dual verdicts', (await page.locator('.propaganda').count()) === 1 && (await page.locator('.propaganda-tag').count()) === 2)

console.log('== Mobile layout ==')
await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(1200)
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
check('no horizontal overflow at 390px', !overflow)

console.log('== Console errors ==')
check('no console/page errors', consoleErrors.length === 0, consoleErrors.join(' | '))

await browser.close()
console.log(`\n${failures === 0 ? 'ALL QA CHECKS PASS' : `${failures} QA CHECK(S) FAILED`}`)
process.exit(failures === 0 ? 0 : 1)

// Captures the updated Check-in screens (Oct 2026: holographic banner, Explore cover photos, phone feed,
// Crew look settings) from the live app at 2x into assets/captures/checkin-v2/.
// Run: node scripts/capture-checkin.mjs [probe]
import { chromium } from 'playwright'

const BASE = 'https://check-in-web-six.vercel.app'
const OUT = 'assets/captures/checkin-v2'
const probe = process.argv[2] === 'probe'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const open = async (path, { width = 1440, height = 900, theme = 'dark', mobile = false } = {}) => {
  const p = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: mobile ? 3 : 2, colorScheme: theme, isMobile: mobile, hasTouch: mobile })
  await p.goto(BASE + path, { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(3000)
  return p
}

if (probe) {
  const p = await open('/feed')
  const links = await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')))])
  const buttons = await p.evaluate(() => [...document.querySelectorAll('button')].map((b) => (b.getAttribute('aria-label') || b.textContent || '').trim()).filter(Boolean).slice(0, 60))
  console.log(JSON.stringify({ url: p.url(), links, buttons }, null, 1))
  await p.screenshot({ path: `${OUT}/probe-feed.png` })
  await browser.close()
  process.exit(0)
}

const save = async (p, name, opts = {}) => {
  await p.screenshot({ path: `${OUT}/${name}.png`, ...opts })
  console.log(`${OUT}/${name}.png`)
}

// 1. desktop feed: the holographic DIALED banner, wait a beat so the foil sheen is mid-pass
{
  const p = await open('/feed')
  await p.waitForTimeout(2500)
  await save(p, 'feed-desktop')
  await p.close()
}
// 2. desktop Explore: the ring of featured crews over the cover-photo list
{
  const p = await open('/explore')
  await save(p, 'explore-desktop')
  await save(p, 'explore-desktop-full', { fullPage: true })
  await p.close()
}
// 3. phone feed: the compact banner with the "in today" row
{
  const p = await open('/feed', { width: 390, height: 844, mobile: true })
  await save(p, 'feed-phone')
  await p.close()
}
// 4. phone crew settings, scrolled to "Crew look" with its live preview
{
  const p = await open('/group-settings/g1', { width: 390, height: 844, mobile: true })
  await save(p, 'settings-phone-top')
  const found = await p.evaluate(() => {
    const el = [...document.querySelectorAll('h1,h2,h3,h4,legend,p,span,label')].find((e) => /crew look/i.test(e.textContent || ''))
    if (!el) return false
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 24)
    return true
  })
  await p.waitForTimeout(1200)
  await save(p, 'settings-phone-look')
  console.log('crew look found:', found)
  await p.close()
}
await browser.close()

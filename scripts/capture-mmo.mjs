// Captures the MMO Nodes case-study gallery and the Home featured card from the live build.
// 1600x1000 at 2x: below ~1500px wide the site collapses its sidebar to icons and clips its bottom chips,
// so this width shows the real desktop layout. Floating corner UI (Buy MMO, toasts, the Netlify badge) is hidden.
// Writes PNG masters to assets/captures/mmo/ and WebP to public/work/mmo-nodes/.
// Run: node scripts/capture-mmo.mjs   (needs `npm run dev` for the simulator shot)
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const SITE = 'https://mmo-nodes.netlify.app/'
const SIM = 'http://localhost:3000/lab/economy-simulator/index.html'
const VIEW = { width: 1600, height: 1000 }
mkdirSync('assets/captures/mmo', { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', headless: true })

const save = async (buf, name, width = 2560) => {
  await sharp(buf).toFile(`assets/captures/mmo/${name}.png`)
  await sharp(buf).resize({ width }).webp({ quality: 90, smartSubsample: true }).toFile(`public/work/mmo-nodes/${name}.webp`)
  console.log(`public/work/mmo-nodes/${name}.webp`)
}

/** Hide fixed UI sitting in the lower right (Buy MMO, achievement toasts, the Netlify badge). */
const hideFloating = (p) =>
  p.evaluate(() => {
    for (const el of document.querySelectorAll('body *')) {
      if (getComputedStyle(el).position !== 'fixed') continue
      const r = el.getBoundingClientRect()
      if (r.left > window.innerWidth * 0.5 && r.top > window.innerHeight * 0.5) el.style.visibility = 'hidden'
    }
    for (const el of document.querySelectorAll('#nl-badge-frame,[id*="netlify"]')) el.style.display = 'none'
  })

const shoot = async (p, name, opts) => {
  await hideFloating(p)
  await p.waitForTimeout(250)
  await save(await p.screenshot(), name, opts?.width)
}

const page = await browser.newPage({ viewport: VIEW, deviceScaleFactor: 2, colorScheme: 'light' })
await page.goto(SITE, { waitUntil: 'networkidle' })
await page.waitForTimeout(4500) // the wordmark blurs in

// landing: the gallery's first image, and a 3x copy for the Home card
await shoot(page, 'site-landing')
{
  const p3 = await browser.newPage({ viewport: VIEW, deviceScaleFactor: 3, colorScheme: 'light' })
  await p3.goto(SITE, { waitUntil: 'networkidle' })
  await p3.waitForTimeout(4500)
  await hideFloating(p3)
  await p3.waitForTimeout(250)
  const buf = await p3.screenshot()
  await sharp(buf).toFile('assets/captures/mmo/featured-landing.png')
  await sharp(buf).resize({ width: 2560 }).webp({ quality: 92, smartSubsample: true }).toFile('public/work/mmo-nodes/featured-landing.webp')
  console.log('public/work/mmo-nodes/featured-landing.webp')
  await p3.close()
}

// into the app; a fresh browser may be asked how to play: take the loaded demo account
await page.click('.go-start')
await page.waitForTimeout(1500)
const demo = page.getByText('Explore the demo', { exact: true })
if (await demo.count()) {
  await demo.first().click()
  await page.waitForTimeout(400)
  if (await demo.count()) await demo.first().click() // second click confirms
}
await page.waitForTimeout(3500)

const go = async (label) => {
  await page.getByRole('button', { name: label, exact: true }).or(page.getByRole('link', { name: label, exact: true })).first().click()
  await page.waitForTimeout(2500)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(600)
}

await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(600)
await shoot(page, 'site-dashboard')

// the dungeon trading cards, lower on the dashboard
await page.evaluate(() => {
  const h = [...document.querySelectorAll('h1,h2,h3')].find((e) => /^dungeons$/i.test(e.textContent.trim()))
  if (h) window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 28)
})
await page.waitForTimeout(1800)
await shoot(page, 'site-dungeons')

for (const [label, name] of [
  ['Character', 'site-character'],
  ['Summon', 'site-summon'],
  ['Map', 'site-map'],
  ['Burn', 'site-burn'],
  ['Raids', 'site-raids'],
  ['Stats', 'site-stats'],
]) {
  await go(label)
  await shoot(page, name)
}
await page.close()

// the economy simulator (served from this site's /lab)
try {
  const s = await browser.newPage({ viewport: VIEW, deviceScaleFactor: 2, colorScheme: 'dark' })
  await s.goto(SIM, { waitUntil: 'networkidle' })
  await s.waitForTimeout(2500)
  await save(await s.screenshot(), 'site-simulator')
  await s.close()
} catch (e) {
  console.log('simulator skipped (is `npm run dev` running?)', e.message)
}

await browser.close()

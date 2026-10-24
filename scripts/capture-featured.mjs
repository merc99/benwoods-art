// Captures the Home featured-card screenshots from the live builds, sized for the half-width frames:
// a 1280x800 window at 3x (MMO Nodes at 1600x1000, where its sidebar shows in full), so text stays crisp.
// Writes PNG masters to assets/captures/featured/ and high-quality WebP to public/work/<slug>/.
// Run: node scripts/capture-featured.mjs [100k|mmo]
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const only = process.argv[2]
const W = 1280
const H = 800
const DPR = 3
mkdirSync('assets/captures/featured', { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const open = async (url, theme = 'dark', size = { width: W, height: H }) => {
  const p = await browser.newPage({ viewport: size, deviceScaleFactor: DPR, colorScheme: theme })
  await p.goto(url, { waitUntil: 'networkidle' })
  // hide host chrome that isn't part of the design: Netlify's badge and empty toast holders
  await p.addStyleTag({ content: '#nl-badge-frame,[id*="netlify"],#toast,.toast{display:none!important}' })
  await p.evaluate(() => document.fonts.ready)
  return p
}
const save = async (buf, slug, name) => {
  const master = `assets/captures/featured/${slug}-${name}.png`
  await sharp(buf).toFile(master)
  // 2560 wide covers a half-width card at 2x on large screens
  await sharp(buf).resize({ width: 2560 }).webp({ quality: 92, smartSubsample: true }).toFile(`public/work/${slug}/${name}.webp`)
  console.log(`public/work/${slug}/${name}.webp`)
}

if (!only || only === '100k') {
  const p = await open('https://100k-club.netlify.app')
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.waitForTimeout(3500) // let the hero reveal and the crest settle
  await save(await p.screenshot(), '100k-club', 'featured-hero')
  await p.close()
}

if (!only || only === 'mmo') {
  // below ~1500px wide the site collapses its sidebar to icons, and its bottom chips get clipped
  const p = await open('https://mmo-nodes.netlify.app/', 'light', { width: 1600, height: 1000 })
  await p.waitForTimeout(4000) // the wordmark blurs in
  await p.click('.go-start')
  await p.waitForTimeout(1200)
  // the site now asks how to play: take the loaded demo account (full roster, every system unlocked)
  const demo = p.getByText('Explore the demo', { exact: true })
  if (await demo.count()) {
    await demo.first().click()
    await p.waitForTimeout(400)
    await demo.first().click() // second click confirms (a fresh browser has no progress to replace)
  }
  await p.waitForTimeout(3500)
  // the card shows the Stats page
  await p.getByRole('button', { name: 'Stats', exact: true }).or(p.getByRole('link', { name: 'Stats', exact: true })).first().click()
  await p.waitForTimeout(2500)
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.waitForTimeout(800)
  // hide floating toasts and badges in the bottom-right corner (achievement pop-ups, the Netlify badge)
  await p.evaluate(() => {
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el)
      if (cs.position !== 'fixed') continue
      const r = el.getBoundingClientRect()
      if (r.left > window.innerWidth * 0.5 && r.top > window.innerHeight * 0.55) el.style.visibility = 'hidden'
    }
  })
  await p.waitForTimeout(200)
  await save(await p.screenshot(), 'mmo-nodes', 'featured-stats')
  await p.close()
}

await browser.close()

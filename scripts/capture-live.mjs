// Captures gallery screenshots from the live builds at 2x into assets/captures/ (then run prepare-images.mjs).
// Run: node scripts/capture-live.mjs [100k|ratmats]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const only = process.argv[2]
const W = 1440
const H = 900
mkdirSync('assets/captures', { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const open = async (url, theme = 'dark') => {
  const p = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2, colorScheme: theme })
  await p.goto(url, { waitUntil: 'networkidle' })
  // hide host chrome that isn't part of the design: Netlify's badge, and empty toast holders
  await p.addStyleTag({ content: '#nl-badge-frame,[id*="netlify"],#toast,.toast{display:none!important}' })
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(2500)
  return p
}
/** Scroll a section to the top of the viewport, let its reveal play, then capture the viewport. */
const shot = async (p, sel, name, { offset = 0, wait = 2200 } = {}) => {
  await p.evaluate(([s, o]) => {
    const e = document.querySelector(s)
    window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY + o)
  }, [sel, offset])
  await p.waitForTimeout(wait)
  await p.screenshot({ path: `assets/captures/${name}.png` })
  console.log(`assets/captures/${name}.png`)
}

if (!only || only === '100k') {
  const p = await open('https://100k-club.netlify.app')
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.waitForTimeout(1500)
  await p.screenshot({ path: 'assets/captures/100k-hero.png' })
  console.log('assets/captures/100k-hero.png')
  await shot(p, '#inside', '100k-inside')
  await shot(p, '#ladder', '100k-ladder')
  await shot(p, '#leaderboard', '100k-leaderboard')
  await shot(p, '#wins', '100k-wins', { wait: 3000 })
  await shot(p, '#membership', '100k-membership')
  await p.close()
}

if (!only || only === 'ratmats') {
  const p = await open('https://rat-mats.netlify.app/', 'light')
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.waitForTimeout(1200)
  await p.screenshot({ path: 'assets/captures/ratmats-hero.png' })
  console.log('assets/captures/ratmats-hero.png')
  await shot(p, '#series', 'ratmats-series', { offset: 0 })
  // the Registry with a number looked up
  await p.evaluate(() => document.querySelector('#registry').scrollIntoView())
  await p.fill('#dial', '47')
  await p.waitForTimeout(600)
  await shot(p, '#registry', 'ratmats-registry', { offset: -40, wait: 800 })
  await p.close()

  const a = await open('https://rat-mats.netlify.app/archive', 'light')
  await a.evaluate(() => window.scrollTo(0, 0))
  await a.waitForTimeout(1500)
  await a.screenshot({ path: 'assets/captures/ratmats-archive.png' })
  console.log('assets/captures/ratmats-archive.png')
  await a.close()
}

if (!only || only === 'mmo') {
  // the app behind START: the demo account's dashboard and the main views from the sidebar
  const p = await open('https://mmo-nodes.netlify.app/', 'light')
  await p.waitForTimeout(4000) // the wordmark blurs in
  await p.click('.go-start')
  await p.waitForTimeout(3000)
  const capture = async (name) => {
    await p.screenshot({ path: `assets/captures/${name}.png` })
    console.log(`assets/captures/${name}.png`)
  }
  await capture('mmo-dashboard')
  // the dungeon trading cards, lower on the dashboard
  await p.evaluate(() => {
    const h = [...document.querySelectorAll('h1,h2,h3')].find((e) => /dungeons/i.test(e.textContent))
    if (h) window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 24)
  })
  await p.waitForTimeout(1800)
  await capture('mmo-dungeons')
  for (const [label, name] of [
    ['Character', 'mmo-character'],
    ['Summon', 'mmo-summon'],
    ['Map', 'mmo-map'],
    ['Burn', 'mmo-burn'],
    ['Stats', 'mmo-stats'],
  ]) {
    const nav = p.getByRole('button', { name: label, exact: true }).or(p.getByRole('link', { name: label, exact: true })).first()
    if (!(await nav.count())) {
      console.log('no nav for', label)
      continue
    }
    await nav.click()
    await p.evaluate(() => window.scrollTo(0, 0))
    await p.waitForTimeout(2200)
    await capture(name)
  }
  await p.close()
}

await browser.close()

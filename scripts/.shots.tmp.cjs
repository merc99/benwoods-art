// Review pack: full-page screenshots of every route (desktop 1440 / mobile 390, light / dark), extra
// interaction states, and per-route console errors, failed requests, JS and image weight.
const { chromium } = require('playwright')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const BASE = 'http://localhost:3100'
const OUT = path.join(__dirname, '..', 'review-pack', 'screens')
const DATA = path.join(__dirname, '..', 'review-pack', 'data')
const slugs = ['checkin', '100k-club', 'mmo-nodes', 'rat-mats', 'mega-roll', 'dreamline', 'mamie-s-sunday-best', 'gildedcan', 'flexible', 'solar-punk', 'wagdie', 'retrofuturism', 'merch', 'merc-eats', 'playlist-covers']
const routes = [
  ['home', '/'],
  ['work', '/work'],
  ['work-list', '/work?view=list'],
  ['work-filter-brand', '/work?filter=brand'],
  ...slugs.map((s) => [`case-${s}`, `/work/${s}`]),
  ['lab', '/lab'],
  ['resources', '/resources'],
  ['about', '/about'],
  ['404', '/this-page-does-not-exist'],
]
const viewports = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}

const save = async (buf, name) => {
  const img = sharp(buf)
  const m = await img.metadata()
  await img.resize({ width: Math.min(1600, m.width) }).jpeg({ quality: 75, mozjpeg: true }).toFile(path.join(OUT, `${name}.jpg`))
}

/** Scroll the whole page so lazy images load and scroll reveals play, then return to the top. */
const settle = async (p) => {
  const h = await p.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < h; y += 500) {
    await p.evaluate((v) => window.scrollTo(0, v), y)
    await p.waitForTimeout(110)
  }
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await p.waitForTimeout(500)
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.waitForTimeout(900)
  await p.evaluate(() => document.fonts.ready)
}

;(async () => {
  const b = await chromium.launch({ channel: 'chrome' })
  const report = []
  for (const [vp, opts] of Object.entries(viewports)) {
    for (const theme of ['light', 'dark']) {
      const ctx = await b.newContext({ ...opts, colorScheme: theme })
      for (const [name, url] of routes) {
        const p = await ctx.newPage()
        const errors = []
        const warnings = []
        const failed = []
        let js = 0
        let img = 0
        p.on('pageerror', (e) => errors.push(e.message))
        p.on('console', (m) => {
          if (m.type() === 'error') errors.push(m.text())
          if (m.type() === 'warning') warnings.push(m.text())
        })
        p.on('requestfailed', (r) => failed.push(`${r.failure()?.errorText} ${r.url()}`))
        p.on('response', async (r) => {
          const t = r.request().resourceType()
          if (r.status() >= 400 && !r.url().includes('this-page-does-not-exist')) failed.push(`${r.status()} ${r.url()}`)
          try {
            const len = Number((await r.headerValue('content-length')) || 0) || (await r.body()).length
            if (t === 'script') js += len
            if (t === 'image') img += len
          } catch {}
        })
        await p.goto(BASE + url, { waitUntil: 'load' })
        await p.waitForTimeout(1800)
        await settle(p)
        await p.mouse.move(2, 2)
        await p.waitForTimeout(300)
        await save(await p.screenshot({ fullPage: true }), `${name}-${vp}-${theme}`)
        report.push({ name, url, vp, theme, errors, warnings, failed, jsBytes: js, imgBytes: img })
        process.stdout.write(`${name}-${vp}-${theme} `)
        await p.close()
      }
      await ctx.close()
    }
  }

  // ---------- extra states (desktop, both themes where it matters) ----------
  for (const theme of ['light', 'dark']) {
    const ctx = await b.newContext({ ...viewports.desktop, colorScheme: theme })
    const p = await ctx.newPage()
    const shot = async (n, clip) => save(await p.screenshot(clip ? { clip } : {}), `state-${n}-desktop-${theme}`)

    // header with the Contact pill (scrolled)
    await p.goto(BASE + '/')
    await p.waitForTimeout(1500)
    await p.evaluate(() => window.scrollTo(0, 900))
    await p.waitForTimeout(900)
    await shot('header-contact-pill', { x: 0, y: 0, width: 1440, height: 160 })

    // a featured build hovered (frame lifts, title underline draws)
    const y = await p.evaluate(() => document.getElementById('selected').getBoundingClientRect().top + window.scrollY)
    await p.evaluate((t) => window.scrollTo(0, t + 120), y)
    await p.waitForTimeout(800)
    await p.mouse.move(700, 450)
    await p.waitForTimeout(1100)
    await shot('featured-hover')

    // hero tiles: hover trail and click pop
    await p.evaluate(() => window.scrollTo(0, 0))
    await p.waitForTimeout(600)
    for (let i = 0; i <= 24; i++) {
      await p.mouse.move(820 + i * 18, 260 + Math.sin(i / 4) * 60)
      await p.waitForTimeout(22)
    }
    await p.waitForTimeout(120)
    await shot('hero-tiles-hover')

    // footer
    await p.evaluate(() => document.querySelector('footer').scrollIntoView())
    await p.waitForTimeout(1400)
    await p.mouse.move(1100, 300)
    await p.waitForTimeout(500)
    await save(await p.locator('footer').screenshot(), `state-footer-desktop-${theme}`)

    // work list-row hover (row inverts)
    await p.goto(BASE + '/work?view=list')
    await p.waitForTimeout(1500)
    const row = p.locator('main a[href^="/work/"]').nth(2)
    await row.scrollIntoViewIfNeeded()
    await row.hover()
    await p.waitForTimeout(600)
    await shot('work-list-row-hover')

    // merch lightbox open
    await p.goto(BASE + '/work/merch')
    await p.waitForTimeout(1500)
    await p.locator('button[aria-label*="View larger"]').nth(4).click()
    await p.waitForTimeout(800)
    await shot('merch-lightbox')
    await p.keyboard.press('Escape')

    // menu open
    await p.goto(BASE + '/')
    await p.waitForTimeout(1200)
    await p.getByRole('button', { name: 'Menu' }).click()
    await p.waitForTimeout(900)
    await shot('menu-open')
    await p.keyboard.press('Escape')

    // command palette
    await p.keyboard.press('Control+k')
    await p.waitForTimeout(600)
    await shot('command-palette')
    await p.keyboard.press('Escape')

    // About: D20 mid-roll
    await p.goto(BASE + '/about')
    await p.waitForTimeout(2500)
    await p.getByRole('button', { name: 'Roll the D20' }).focus()
    await p.keyboard.press('Enter')
    await p.waitForTimeout(260)
    await shot('about-d20-midroll')
    await p.waitForTimeout(2200)
    await shot('about-d20-settled')
    await ctx.close()
  }
  await b.close()
  fs.writeFileSync(path.join(DATA, 'routes.json'), JSON.stringify(report, null, 1))
  console.log('\ndone', report.length)
})()

// Generates project covers with a headless browser (Playwright driving the installed Chrome), at 2x.
// Writes PNG masters to assets/covers/ and optimized WebP to public/work/<slug>/.
// Run: node scripts/make-covers.mjs [only-slug]
// Card ratios: 16:10 for every product card; Check-in's full-width Home card is 2:1 (cover-wide).
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdirSync, readFileSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const only = process.argv[2]
const W = 1280 // CSS px; captured at 2x
const H = 800 // 16:10
const masters = 'assets/covers'
mkdirSync(masters, { recursive: true })

const dataUrl = (p, type) => `data:${type};base64,${readFileSync(p).toString('base64')}`
const fileUrl = (p) => pathToFileURL(resolve(p)).href

async function save(buf, slug, name, width = 2560) {
  mkdirSync(`public/work/${slug}`, { recursive: true })
  await sharp(buf).toFile(`${masters}/${slug}-${name}.png`)
  rmSync(`public/work/${slug}/${name}.webp`, { force: true }) // Windows won't overwrite an open file in place
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 92, smartSubsample: true }).toFile(`public/work/${slug}/${name}.webp`)
  console.log(`public/work/${slug}/${name}.webp`, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`)
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = async (w = W, h = H) => browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })
const settle = async (p, ms = 1500) => {
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(ms)
}

// Covers are mark-only: the project's mark on its own background, centered with generous space.
// No buttons, body copy, tickers, nav or UI chrome. References: assets/covers-ref/.
const jobs = {
  // The single gold crest on navy with its back glow and a soft, mottled vignette.
  async '100k-club'() {
    const p = await page()
    const crest = dataUrl('handoff/100k-club/assets/crest-hero-gold-logo.webp', 'image/webp')
    const glow = dataUrl('handoff/100k-club/assets/crest-hero-backglow.png', 'image/png')
    await p.setContent(`<!doctype html><html><head><style>
        html,body{margin:0;height:100%;overflow:hidden}
        body{display:grid;place-items:center;background:
          radial-gradient(38% 30% at 22% 18%,rgba(44,66,128,.55),transparent 70%),
          radial-gradient(34% 28% at 80% 22%,rgba(38,58,116,.5),transparent 70%),
          radial-gradient(40% 34% at 70% 82%,rgba(30,48,98,.45),transparent 70%),
          radial-gradient(36% 30% at 18% 80%,rgba(34,52,104,.4),transparent 70%),
          radial-gradient(80% 80% at 50% 50%,#13245a 0%,#0A1430 58%,#060d22 100%)}
        body::after{content:"";position:fixed;inset:0;background:radial-gradient(75% 75% at 50% 50%,transparent 55%,rgba(3,8,22,.65) 100%)}
        .crest{position:relative;height:84vh;aspect-ratio:1000/1120;z-index:1}
        .crest img{position:absolute;inset:0;width:100%;height:100%}
        .crest .glow{inset:-38%;width:176%;height:176%;opacity:.85}
      </style></head><body><div class="crest"><img class="glow" src="${glow}"><img src="${crest}"></div></body></html>`)
    await settle(p, 600)
    await save(await p.screenshot(), '100k-club', 'cover-mark')
  },

  // Only the MEGA ROLL bubble logo (inline SVG, so it stays sharp) on the page's cream.
  async 'mega-roll'() {
    const p = await page()
    await p.goto(fileUrl('handoff/mega-roll/source/index.html'))
    await p.addStyleTag({
      content: `#nav,.nav,#sndBtn,.snd,.tagline,.d20-stage,.stack-btn,.ticker,section:not(.hero),footer{display:none!important}
        .hero{min-height:100vh!important;height:100vh;display:grid!important;place-items:center;padding:0!important;margin:0!important}
        .hero .wrap{display:grid;place-items:center;width:100%}
        .logo-wrap{width:68vw!important;max-width:none!important;margin:0 auto!important}
        .logo-svg{width:100%!important;height:auto!important}`,
    })
    await settle(p, 3500)
    const box = await (await p.$('section.hero')).boundingBox()
    await save(await p.screenshot({ fullPage: true, clip: { x: 0, y: Math.round(box.y), width: W, height: H } }), 'mega-roll', 'cover-mark')
  },

  // Only the rat mark + RAT MATS wordmark, centered on bone.
  async 'rat-mats'() {
    const p = await page()
    await p.goto(fileUrl('handoff/rat-mats/source/index.html'))
    await p.addStyleTag({
      content: `#hdr,.hdr,#toast,.toast,.hero-sub,.hero-acts,.hero-art,.ticker,.tick,section:not(.hero),footer{display:none!important}
        .hero{min-height:100vh!important;height:100vh;display:grid!important;place-items:center;padding:0!important;margin:0!important}
        .hero-grid{display:flex!important;justify-content:center;align-items:center;width:100%;max-width:none!important}
        .hero-copy{width:58vw!important;max-width:none!important;display:flex;justify-content:center}
        .hero-lock{margin:0!important}`,
    })
    await settle(p, 2500)
    const box = await (await p.$('section.hero')).boundingBox()
    await save(await p.screenshot({ fullPage: true, clip: { x: 0, y: Math.round(box.y), width: W, height: H } }), 'rat-mats', 'cover-mark2')
  },

  // Only the "mmo nodes" wordmark, "Stake. Level. Earn." and the thin guide lines on the gradient.
  async 'mmo-nodes'() {
    const p = await page()
    await p.goto('https://mmo-nodes.netlify.app/', { waitUntil: 'networkidle' })
    await p.addStyleTag({ content: '#nl-badge-frame,#coords,.coords,.go-start,.btn.learn,.btn.primary{display:none!important}' })
    await settle(p, 9000) // the wordmark blurs in
    await save(await p.screenshot(), 'mmo-nodes', 'cover-mark')
  },

  // Merc Eats: the portrait on its own kraft paper, cropped to 16:10 from the bottom (he's drawn cut off there).
  async 'merc-eats'() {
    const src = 'assets/merceats/sfgjfdgjdfgjdfgj.png'
    const m = await sharp(src).metadata()
    const h = Math.round((m.width * 10) / 16)
    const buf = await sharp(src).extract({ left: 0, top: m.height - h, width: m.width, height: h }).png().toBuffer()
    await save(buf, 'merc-eats', 'cover-portrait')
  },

  // Playlist covers: one cover, the September artwork from its full-resolution original, cropped to the
  // card's 16:10 around its center (a single piece reads better than four tiny squares).
  async 'playlist-covers'() {
    const src = 'assets/PLAYLIST ART/Stock-Pulper_gddfgdfgdfg.png'
    const m = await sharp(src).metadata()
    const h = Math.round((m.width * 10) / 16)
    const buf = await sharp(src).extract({ left: 0, top: Math.round((m.height - h) / 2), width: m.width, height: h }).png().toBuffer()
    await save(buf, 'playlist-covers', 'cover-single')
  },

  // Merch: one shirt on its own studio backdrop, widened to 16:10 by repeating the backdrop's edges.
  async merch() {
    const src = 'public/merch/bwtb-mockup-2.webp'
    const m = await sharp(src).metadata()
    const target = Math.round((m.height * 16) / 10)
    const side = Math.max(0, Math.round((target - m.width) / 2))
    const buf = await sharp(src).extend({ left: side, right: side, extendWith: 'copy' }).png().toBuffer()
    await save(buf, 'merch', 'cover')
  },

  // Check-in keeps its chosen cover (dark UI on sky). Run `node scripts/make-covers.mjs checkin` to regenerate.
  async checkin() {
    const p = await page()
    await p.addInitScript(() => localStorage.setItem('theme', 'light'))
    await p.goto('https://check-in-web-six.vercel.app/feed', { waitUntil: 'networkidle' })
    await settle(p, 4000)
    const light = await p.screenshot()
    await save(light, 'checkin', 'cover-light')
    await save(await sharp(light).extract({ left: 0, top: 0, width: 2560, height: 1280 }).png().toBuffer(), 'checkin', 'cover-light-wide')

    // Option B: the dark UI as an object on a colored backdrop, padded, with a soft shadow.
    const d = await page()
    await d.addInitScript(() => localStorage.setItem('theme', 'dark'))
    await d.goto('https://check-in-web-six.vercel.app/feed', { waitUntil: 'networkidle' })
    await settle(d, 4000)
    const darkShot = await d.screenshot()
    await sharp(darkShot).toFile('assets/covers/_checkin-dark-ui.png')
    for (const [name, w, h, scale] of [['cover-dark', W, H, 0.74], ['cover-dark-wide', W, 640, 0.64]]) {
      const b = await page(w, h)
      await b.setContent(`<!doctype html><html><head><style>
        html,body{margin:0;height:100%}
        body{display:grid;place-items:center;background:radial-gradient(120% 90% at 30% 10%,#7DD3FC 0%,#38BDF8 45%,#0EA5E9 100%)}
        img{width:${Math.round(w * scale)}px;border-radius:14px;box-shadow:0 2px 0 rgba(255,255,255,.25) inset,0 30px 60px -20px rgba(3,40,70,.55),0 12px 24px -12px rgba(3,40,70,.4)}
      </style></head><body><img src="${dataUrl('assets/covers/_checkin-dark-ui.png', 'image/png')}"></body></html>`)
      await settle(b, 400)
      await save(await b.screenshot(), 'checkin', name)
    }
  },
}

for (const [slug, run] of Object.entries(jobs)) {
  if (only ? only !== slug : slug === 'checkin') continue
  try {
    await run()
  } catch (e) {
    console.error(slug, 'failed:', e.message)
  }
}
await browser.close()

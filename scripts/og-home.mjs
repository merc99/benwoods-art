// Captures the Home hero (BEN WOODS, the lede and the pixel tiles, dark theme) as the site's share card:
// app/opengraph-image.png, 1200x630. The header and the Selected work line are hidden so it reads as a card.
// Shot at 2x and scaled down so the type stays crisp. Re-run when the hero changes.
// Run against a local production build: npx next build && npx next start -p 3100, then
//   node scripts/og-home.mjs [http://localhost:3100]
import { chromium } from 'playwright'
import sharp from 'sharp'

const url = process.argv[2] ?? 'http://localhost:3100'
const W = 1200
const H = 630

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2, colorScheme: 'dark' })
await page.goto(`${url}/`, { waitUntil: 'networkidle' })
await page.addStyleTag({
  content: `
    :root { --header-h: 0px !important; }
    body > div > header, header.sticky, .skip-link { display: none !important; }
    section[aria-labelledby="hero-title"] > div > div.mt-auto { display: none !important; }
  `,
})
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(3500) // the name rises, the lede decodes, the tiles fade in
const shot = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H } })
await sharp(shot).resize(W, H).png({ compressionLevel: 9 }).toFile('app/opengraph-image.png')
console.log('app/opengraph-image.png')
await browser.close()

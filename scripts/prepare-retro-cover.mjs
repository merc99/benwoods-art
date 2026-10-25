// Sharp WebP sizes of the Retro-futurism cover, for its glow cover (components/work/GlowCover.tsx).
// The site's image optimizer serves AVIF, which smears this fine linework and paper grain; these are
// WebP with a light sharpen, served as-is. Originals in assets/ are never touched.
// Run: node scripts/prepare-retro-cover.mjs
import sharp from 'sharp'
import { rmSync } from 'node:fs'

const SRC = 'assets/framer/retrofuturism-cover.png'
for (const w of [900, 1400, 2056]) {
  const dest = `public/work/retrofuturism/cover-sharp-${w}.webp`
  rmSync(dest, { force: true })
  const info = await sharp(SRC)
    .resize({ width: w, withoutEnlargement: true })
    .sharpen({ sigma: w < 2056 ? 0.6 : 0.8, m1: 0.6, m2: 2.2 })
    .webp({ quality: 84, smartSubsample: true })
    .toFile(dest)
  console.log(dest, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`)
}

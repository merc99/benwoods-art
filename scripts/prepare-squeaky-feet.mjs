// Web images for the Squeaky Feet case study, from assets/Album Art (originals are never touched).
// Writes public/work/squeaky-feet/*.webp. next/image then serves responsive sizes and lazy-loads below the fold.
// The three process details are crops of the full-resolution cover, at its own pixels (no upscaling).
// Run: node scripts/prepare-squeaky-feet.mjs
import sharp from 'sharp'
import { mkdirSync, rmSync } from 'node:fs'

const IN = 'assets/Album Art/'
const OUT = 'public/work/squeaky-feet/'
mkdirSync(OUT, { recursive: true })

const save = async (src, name, { max = 2400, extract } = {}) => {
  const dest = `${OUT}${name}.webp`
  rmSync(dest, { force: true }) // Windows won't overwrite an open file in place
  let img = sharp(IN + src)
  if (extract) img = img.extract(extract)
  const info = await img.resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true }).webp({ quality: 90, smartSubsample: true }).toFile(dest)
  console.log(dest.padEnd(52), `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`)
}

// hero and card cover: the album cover
await save('Cover (2).png', 'cover', { max: 2400 })
// singles
await save('Countdown (1).png', 'single-countdown', { max: 1800 })
await save('Terms_&_Conditions (1).png', 'single-terms-and-conditions', { max: 1800 })
await save('No_Fun (1).png', 'single-no-fun', { max: 1800 })
// vinyl
await save('Back_Cover (1).png', 'back-cover', { max: 1800 })
await save('Gemini_Generated_Image_k2tymwk2tymwk2ty.jpg', 'mockup-flat-lay')
await save('Gemini_Generated_Image_cnsdm5cnsdm5cnsd.jpg', 'mockup-standing')
// process details, 4:3 crops of the 3000px cover
await save('Cover (2).png', 'detail-impact', { extract: { left: 720, top: 1500, width: 1200, height: 900 } })
await save('Cover (2).png', 'detail-system-data', { extract: { left: 80, top: 2040, width: 1200, height: 900 } })
await save('Cover (2).png', 'detail-trees', { extract: { left: 1780, top: 720, width: 1200, height: 900 } })

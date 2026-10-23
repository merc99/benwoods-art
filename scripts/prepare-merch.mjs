// Prepares merch photos: assets/merch/*.png (originals, untouched) -> public/merch/<slug>.webp
//  1. Trims solid borders on all four edges (uniform bands that differ from the photo just inside them,
//     or fully transparent bands), with a small tolerance so dark parts of the photo are never taken.
//  2. Finds the product (pixels that differ from the background sampled at the edges) and crops to RATIO
//     around it, centered on the product and never cutting into it. If the product can't fit at RATIO,
//     the image is padded with its own edge color instead of cropping into the product.
//  3. Writes an optimized WebP (long edge max 1800px) and a JSON report used by the contact sheet.
// Run: node scripts/prepare-merch.mjs [ratio, default 5/4]
import sharp from 'sharp'
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { raw, px, lineStats, dist, borderDepth } from './lib/trim.mjs'

const SRC = 'assets/merch'
const OUT = 'public/merch'
const [rw, rh] = (process.argv[2] ?? '5/4').split('/').map(Number)
const RATIO = rw / rh
const MARGIN = 0.1 // breathing room around the product, as a share of the product's size

const slugify = (f) =>
  f
    .replace(/\.[a-z]+$/i, '')
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Bounding box of whatever differs from the background (sampled around the edges), on a small proxy. */
async function productBox(buf, w, h) {
  const S = 360
  const scale = S / Math.max(w, h)
  const pw = Math.round(w * scale)
  const ph = Math.round(h * scale)
  const small = await raw(await sharp(buf).resize(pw, ph).blur(1.2).toBuffer())
  const edge = []
  for (let x = 0; x < pw; x += 2) edge.push(px(small, x, 0), px(small, x, ph - 1))
  for (let y = 0; y < ph; y += 2) edge.push(px(small, 0, y), px(small, pw - 1, y))
  // background varies (gradients, blurred skies): compare each pixel to the nearest edge samples' range
  const bgAt = (x, y) => {
    const l = px(small, 0, y), r = px(small, pw - 1, y), t = px(small, x, 0), b = px(small, x, ph - 1)
    const fx = x / (pw - 1), fy = y / (ph - 1)
    return [0, 1, 2].map((c) => ((l[c] * (1 - fx) + r[c] * fx) + (t[c] * (1 - fy) + b[c] * fy)) / 2)
  }
  let x0 = pw, y0 = ph, x1 = 0, y1 = 0
  const colHits = new Array(pw).fill(0)
  const rowHits = new Array(ph).fill(0)
  for (let y = 0; y < ph; y++)
    for (let x = 0; x < pw; x++) {
      const p = px(small, x, y)
      if (p[3] < 12) continue
      if (dist(p, bgAt(x, y)) > 60) {
        colHits[x]++
        rowHits[y]++
      }
    }
  const minC = ph * 0.015
  const minR = pw * 0.015
  colHits.forEach((c, x) => { if (c > minC) { x0 = Math.min(x0, x); x1 = Math.max(x1, x) } })
  rowHits.forEach((c, y) => { if (c > minR) { y0 = Math.min(y0, y); y1 = Math.max(y1, y) } })
  if (x1 <= x0 || y1 <= y0) return { x: 0, y: 0, w, h }
  return { x: x0 / scale, y: y0 / scale, w: (x1 - x0 + 1) / scale, h: (y1 - y0 + 1) / scale }
}

mkdirSync(OUT, { recursive: true })
const report = []
for (const f of readdirSync(SRC).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))) {
  const src = join(SRC, f)
  const img = await raw(src)
  const trim = { top: borderDepth(img, 'top'), bottom: borderDepth(img, 'bottom'), left: borderDepth(img, 'left'), right: borderDepth(img, 'right') }
  const tw = img.w - trim.left - trim.right
  const th = img.h - trim.top - trim.bottom
  const trimmed = await sharp(src).extract({ left: trim.left, top: trim.top, width: tw, height: th }).png().toBuffer()

  const box = await productBox(trimmed, tw, th)
  // smallest crop at RATIO that holds the product plus margin, then grow it as far as the image allows
  const needW = box.w * (1 + MARGIN * 2)
  const needH = box.h * (1 + MARGIN * 2)
  let cw = Math.max(needW, needH * RATIO)
  let ch = cw / RATIO
  const grow = Math.min(tw / cw, th / ch)
  cw *= grow
  ch *= grow
  const cx = box.x + box.w / 2
  const cy = box.y + box.h / 2
  let left = Math.round(Math.min(Math.max(cx - cw / 2, 0), Math.max(0, tw - cw)))
  let top = Math.round(Math.min(Math.max(cy - ch / 2, 0), Math.max(0, th - ch)))
  cw = Math.min(Math.round(cw), tw)
  ch = Math.min(Math.round(ch), th)
  const fits = box.x >= left - 1 && box.x + box.w <= left + cw + 1 && box.y >= top - 1 && box.y + box.h <= top + ch + 1

  const slug = slugify(f)
  let pipeline = sharp(trimmed).extract({ left, top, width: cw, height: ch })
  if (!fits) {
    // never crop into the product: fall back to the whole trimmed image, padded to RATIO with its edge color
    const c = lineStats(await raw(trimmed), 'row', th - 1).mean
    const padW = Math.max(tw, Math.round(th * RATIO))
    const padH = Math.max(th, Math.round(tw / RATIO))
    pipeline = sharp(trimmed).extend({
      left: Math.floor((padW - tw) / 2), right: Math.ceil((padW - tw) / 2),
      top: Math.floor((padH - th) / 2), bottom: Math.ceil((padH - th) / 2),
      background: { r: Math.round(c[0]), g: Math.round(c[1]), b: Math.round(c[2]), alpha: 1 },
    })
  }
  const outFile = join(OUT, `${slug}.webp`)
  const info = await pipeline.resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true }).flatten({ background: '#ffffff' }).webp({ quality: 84 }).toFile(outFile)
  report.push({ file: f, slug, original: `${img.w}x${img.h}`, trim, product: Object.fromEntries(Object.entries(box).map(([k, v]) => [k, Math.round(v)])), crop: fits ? { left, top, width: cw, height: ch } : 'padded', out: `${info.width}x${info.height}`, kb: Math.round(info.size / 1024) })
  console.log(f.padEnd(28), 'trim', JSON.stringify(trim), fits ? 'crop' : 'PADDED', `${info.width}x${info.height}`)
}
writeFileSync('assets/merch-report.json', JSON.stringify(report, null, 1))

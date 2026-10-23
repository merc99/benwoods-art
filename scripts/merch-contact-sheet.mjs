// Before/after sheet for merch prep: original with trim (dashed) and crop (solid) boxes, next to the output.
// Run after prepare-merch.mjs: node scripts/merch-contact-sheet.mjs -> assets/review/merch-before-after.jpg
import sharp from 'sharp'
import { readFileSync } from 'node:fs'

const report = JSON.parse(readFileSync('assets/merch-report.json', 'utf8'))
const CW = 560, CH = 400, LABEL = 34, ROW = CH + LABEL + 16
const rows = []
for (const r of report) {
  const [ow, oh] = r.original.split('x').map(Number)
  const s = Math.min(CW / ow, CH / oh)
  const bw = Math.round(ow * s), bh = Math.round(oh * s)
  const before = await sharp(`assets/merch/${r.file}`).resize(bw, bh).flatten({ background: '#888' }).toBuffer()
  const t = r.trim
  const crop = typeof r.crop === 'object' ? r.crop : null
  const svg = `<svg width="${bw}" height="${bh}" xmlns="http://www.w3.org/2000/svg">
    <rect x="${t.left * s}" y="${t.top * s}" width="${(ow - t.left - t.right) * s}" height="${(oh - t.top - t.bottom) * s}" fill="none" stroke="#00b4ff" stroke-width="2" stroke-dasharray="6 4"/>
    ${crop ? `<rect x="${(t.left + crop.left) * s}" y="${(t.top + crop.top) * s}" width="${crop.width * s}" height="${crop.height * s}" fill="none" stroke="#ff3b1f" stroke-width="3"/>` : ''}
    <rect x="${(t.left + r.product.x) * s}" y="${(t.top + r.product.y) * s}" width="${r.product.w * s}" height="${r.product.h * s}" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3 3"/>
  </svg>`
  const beforeMarked = await sharp(before).composite([{ input: Buffer.from(svg) }]).png().toBuffer()
  const after = await sharp(`public/merch/${r.slug}.webp`).resize(CW, CH, { fit: 'contain', background: '#1a1a1a' }).png().toBuffer()
  const label = Buffer.from(`<svg width="${CW * 2 + 24}" height="${LABEL}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#111"/><text x="10" y="23" font-family="monospace" font-size="17" fill="#f4ecdc">${r.file}  ·  ${r.original} → ${r.out}  ·  trim t${t.top} b${t.bottom} l${t.left} r${t.right}</text></svg>`)
  rows.push({ before: beforeMarked, bw, bh, after, label })
}
const W = CW * 2 + 24
const legend = Buffer.from(`<svg width="${W}" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#0f0f0e"/><text x="10" y="26" font-family="monospace" font-size="16" fill="#f4ecdc">BEFORE (blue dashed = after trim, green = product found, red = 5:4 crop)    |    AFTER (public/merch)</text></svg>`)
const comp = [{ input: legend, top: 0, left: 0 }]
rows.forEach((r, i) => {
  const y = 40 + i * ROW
  comp.push({ input: r.label, top: y, left: 0 })
  comp.push({ input: r.before, top: y + LABEL + 8 + Math.round((CH - r.bh) / 2), left: Math.round((CW - r.bw) / 2) })
  comp.push({ input: r.after, top: y + LABEL + 8, left: CW + 24 })
})
await sharp({ create: { width: W, height: 40 + rows.length * ROW, channels: 3, background: '#0f0f0e' } })
  .composite(comp).jpeg({ quality: 82 }).toFile('assets/review/merch-before-after.jpg')
console.log('assets/review/merch-before-after.jpg')

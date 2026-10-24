// Cuts Merc out of his portrait drawing for the footer peek (components/layout/MercPeek.tsx).
// The kraft paper is flood-filled away from the top and side edges (the black outline stops the fill),
// only the cat itself is kept (stray paper specks go), and the outline's outer edge is softened into
// alpha so he sits cleanly on the dark footer. The bottom edge stays: he's cut off there, peeking up.
// Run: node scripts/prepare-merc-peek.mjs
import sharp from 'sharp'
import { mkdirSync, rmSync } from 'node:fs'

const SRC = 'assets/merceats/sfgjfdgjdfgjdfgj.png'
const OUT = 'public/merc/peek.webp'

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h } = info
const lum = (i) => 0.299 * data[i * 3] + 0.587 * data[i * 3 + 1] + 0.114 * data[i * 3 + 2]

// paper colour: the average of the top strip (the drawing sits in the lower half)
let br = 0, bg = 0, bb = 0, k = 0
for (let y = 0; y < 300; y += 3) for (let x = 0; x < w; x += 3) {
  const i = y * w + x
  br += data[i * 3]; bg += data[i * 3 + 1]; bb += data[i * 3 + 2]; k++
}
br /= k; bg /= k; bb /= k
const paperLum = 0.299 * br + 0.587 * bg + 0.114 * bb
const isPaper = (i) => {
  const d = Math.hypot(data[i * 3] - br, data[i * 3 + 1] - bg, data[i * 3 + 2] - bb)
  return d < 48 && lum(i) > paperLum - 40
}

// 1 = paper reached from the top or sides
const paper = new Uint8Array(w * h)
const stack = []
const seed = (i) => { if (!paper[i] && isPaper(i)) { paper[i] = 1; stack.push(i) } }
for (let x = 0; x < w; x++) seed(x)
for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1) }
while (stack.length) {
  const i = stack.pop()
  const x = i % w, y = (i / w) | 0
  if (x > 0) seed(i - 1)
  if (x < w - 1) seed(i + 1)
  if (y > 0) seed(i - w)
  if (y < h - 1) seed(i + w)
}

// keep only the largest piece that isn't paper (the cat); specks and grain dots go
const label = new Int32Array(w * h)
let best = 0, bestSize = 0, n = 0
for (let s = 0; s < w * h; s++) {
  if (paper[s] || label[s]) continue
  n++
  let size = 0
  stack.push(s); label[s] = n
  while (stack.length) {
    const i = stack.pop(); size++
    const x = i % w, y = (i / w) | 0
    for (const j of [x > 0 && i - 1, x < w - 1 && i + 1, y > 0 && i - w, y < h - 1 && i + w]) {
      if (j !== false && !paper[j] && !label[j]) { label[j] = n; stack.push(j) }
    }
  }
  if (size > bestSize) { bestSize = size; best = n }
}

// RGBA: the cat opaque; where his edge touches paper, alpha follows how dark the pixel is, in black
const out = Buffer.alloc(w * h * 4)
let x0 = w, x1 = 0, y0 = h
for (let i = 0; i < w * h; i++) {
  if (label[i] !== best) continue
  const x = i % w, y = (i / w) | 0
  const edge = (x > 0 && paper[i - 1]) || (x < w - 1 && paper[i + 1]) || (y > 0 && paper[i - w]) || (y < h - 1 && paper[i + w])
  let a = 255
  let [r, g, b] = [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]]
  if (edge) {
    a = Math.round(255 * Math.min(1, Math.max(0, (paperLum - lum(i)) / (paperLum - 25))))
    r = g = b = 0
  }
  out.set([r, g, b, a], i * 4)
  if (a) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y }
}

mkdirSync('public/merc', { recursive: true })
rmSync(OUT, { force: true })
const pad = 8
const left = Math.max(0, x0 - pad), top = Math.max(0, y0 - pad)
const res = await sharp(out, { raw: { width: w, height: h, channels: 4 } })
  .extract({ left, top, width: Math.min(w, x1 + pad) - left, height: h - top })
  .resize({ width: 520 })
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(OUT)
console.log(OUT, `${res.width}x${res.height}`, `${Math.round(res.size / 1024)}KB`)

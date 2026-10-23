// Shared image prep: trims solid or semi-transparent borders on all four edges with a tolerance, so
// only the border goes and never dark parts of the artwork. Used by prepare-merch.mjs and prepare-art.mjs.
import sharp from 'sharp'

export async function raw(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { data, w: info.width, h: info.height }
}

export const px = (img, x, y) => {
  const i = (y * img.w + x) * 4
  return [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]]
}

/** Mean, spread and transparency of one row (or column) of pixels. */
export function lineStats(img, axis, idx) {
  const n = axis === 'row' ? img.w : img.h
  const step = Math.max(1, Math.floor(n / 400))
  let r = 0, g = 0, b = 0, a = 0, k = 0
  const vals = []
  for (let t = 0; t < n; t += step) {
    const p = axis === 'row' ? px(img, t, idx) : px(img, idx, t)
    r += p[0]; g += p[1]; b += p[2]; a += p[3]; k++
    vals.push(p)
  }
  const m = [r / k, g / k, b / k, a / k]
  let v = 0
  for (const p of vals) v += (p[0] - m[0]) ** 2 + (p[1] - m[1]) ** 2 + (p[2] - m[2]) ** 2
  return { mean: m, sd: Math.sqrt(v / (k * 3)) }
}
export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

/** How many pixels of solid border sit on one edge. */
export function borderDepth(img, edge) {
  const horiz = edge === 'top' || edge === 'bottom'
  const len = horiz ? img.h : img.w
  const at = (d) => (edge === 'top' || edge === 'left' ? d : len - 1 - d)
  const axis = horiz ? 'row' : 'col'
  const ref = lineStats(img, axis, at(Math.floor(len * 0.12))) // photo just inside the edge
  const cap = Math.floor(len * 0.15)
  // keylines: the first few opaque lines at the edge (or after a transparent band) may be slightly textured
  const thin = Math.min(12, Math.max(2, Math.round(len * 0.008)))
  let opaque = 0
  let d = 0
  for (; d < cap; d++) {
    const s = lineStats(img, axis, at(d))
    const transparent = s.mean[3] < 200 // fully or partly see-through bands (they flatten to a dark edge)
    // a border line is a flat digital fill; textured paper or painted backgrounds have far more spread
    // a textured line only counts as a keyline if it steps sharply to the line just inside it
    const step = () => dist(s.mean, lineStats(img, axis, at(d + 1)).mean) > 25
    const flat = s.sd < 3 || (s.sd < 14 && opaque < thin && step())
    const solidBand = flat && dist(s.mean, ref.mean) > 40
    if (!transparent && !solidBand) break
    if (!transparent) opaque++
  }
  return d
}


/** Trims an image's borders. Returns the trimmed PNG buffer and how much came off each edge. */
export async function trimBorders(src) {
  const img = await raw(src)
  const trim = { top: borderDepth(img, 'top'), bottom: borderDepth(img, 'bottom'), left: borderDepth(img, 'left'), right: borderDepth(img, 'right') }
  const width = img.w - trim.left - trim.right
  const height = img.h - trim.top - trim.bottom
  const buffer = await sharp(src).extract({ left: trim.left, top: trim.top, width, height }).png().toBuffer()
  return { buffer, trim, width, height, original: { w: img.w, h: img.h } }
}

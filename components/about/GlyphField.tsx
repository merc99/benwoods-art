'use client'
// The glyph field, rebuilt from the old About page. A D20 (an icosahedron) turns gently inside a field of
// glyphs that drift in slow waves, like a flow field.
//   - Click or tap the field: a ring ripples out; glyphs swell and shift color as it passes. Ripples overlap.
//   - Drag the D20 to spin it on any axis; flick and it keeps spinning with inertia, then settles on a face.
//   - Tap the D20 (or focus it and press Space/Enter) to roll: a quick tumble that settles on a face.
//   - When it settles, the face toward you shows its number in glyphs, then fades. A natural 20 flourishes.
// Each frame the die is flat-shaded into a tiny offscreen raster (one pixel per glyph cell); each cell then
// draws the glyph for its brightness from a pre-rendered atlas. The raster also hit-tests the die.
// Motion budget: the one scoped loop on About. No pointer tracking beyond direct manipulation. Pauses
// offscreen and on hidden tabs. Reduced motion: still frame, no waves, ripples or inertia; a roll jumps
// straight to its result.

import { useEffect, useRef } from 'react'

const LEVELS = [' ', '·', '∙', ':', '+', '×', '◇', '◈', '▣', '■']
// Facet colors: cream through amber to the site's vermilion, with one cool band for the iridescent edge.
const BANDS = ['#f4ecdc', '#e8c9a0', '#e9a23b', '#ff5a2e', '#b9a6ff']
/** Each face keeps its own color as the die turns (so it reads as a solid object), mostly warm with a few lilac. */
const FACE_BAND = [1, 2, 3, 1, 4, 2, 3, 1, 2, 4, 3, 1, 2, 3, 1, 4, 2, 1, 3, 2]
/** The number is drawn at this many subpixels per glyph cell, then each cell is filled by its coverage. */
const SS = 4

type V3 = [number, number, number]
type Q = [number, number, number, number] // w, x, y, z

const PHI = (1 + Math.sqrt(5)) / 2
const VERTS: V3[] = [
  [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
  [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
  [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1],
]
/** Every triple of vertices that are pairwise one edge apart is a face (20 of them). */
const FACES: [number, number, number][] = (() => {
  const d = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
  const out: [number, number, number][] = []
  for (let i = 0; i < 12; i++)
    for (let j = i + 1; j < 12; j++)
      for (let k = j + 1; k < 12; k++)
        if ([d(VERTS[i], VERTS[j]), d(VERTS[j], VERTS[k]), d(VERTS[i], VERTS[k])].every((x) => Math.abs(x - 2) < 1e-6)) out.push([i, j, k])
  return out
})()
const norm = (v: V3): V3 => {
  const m = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / m, v[1] / m, v[2] / m]
}
/** Outward unit normal of each face, in model space. */
const NORMALS: V3[] = FACES.map((f) => norm([0, 1, 2].map((c) => (VERTS[f[0]][c] + VERTS[f[1]][c] + VERTS[f[2]][c]) / 3) as V3))
/** Numbers like a real die: opposite faces sum to 21. */
const NUMBERS: number[] = (() => {
  const n = new Array(20).fill(0)
  let k = 1
  for (let i = 0; i < 20; i++) {
    if (n[i]) continue
    const opp = NORMALS.findIndex((m, j) => j !== i && Math.abs(m[0] + NORMALS[i][0]) + Math.abs(m[1] + NORMALS[i][1]) + Math.abs(m[2] + NORMALS[i][2]) < 1e-6)
    n[i] = k
    n[opp] = 21 - k
    k++
  }
  return n
})()

// quaternions
const qmul = (a: Q, b: Q): Q => [
  a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
  a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
  a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
  a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
]
const qaxis = (axis: V3, angle: number): Q => {
  const [x, y, z] = norm(axis)
  const s = Math.sin(angle / 2)
  return [Math.cos(angle / 2), x * s, y * s, z * s]
}
const qrot = (q: Q, v: V3): V3 => {
  const [w, x, y, z] = q
  const ix = w * v[0] + y * v[2] - z * v[1]
  const iy = w * v[1] + z * v[0] - x * v[2]
  const iz = w * v[2] + x * v[1] - y * v[0]
  const iw = -x * v[0] - y * v[1] - z * v[2]
  return [ix * w + iw * -x + iy * -z - iz * -y, iy * w + iw * -y + iz * -x - ix * -z, iz * w + iw * -z + ix * -y - iy * -x]
}
const qnorm = (q: Q): Q => {
  const m = Math.hypot(...q) || 1
  return [q[0] / m, q[1] / m, q[2] / m, q[3] / m]
}
/** The shortest rotation taking unit vector a onto unit vector b. */
const qfromTo = (a: V3, b: V3): Q => {
  const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  if (d < -0.9999) return qaxis(Math.abs(a[0]) < 0.9 ? [0, -a[2], a[1]] : [-a[2], 0, a[0]], Math.PI)
  return qnorm([1 + d, a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]])
}
const qslerp = (a: Q, b: Q, t: number): Q => {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
  let bb = b
  if (d < 0) {
    d = -d
    bb = [-b[0], -b[1], -b[2], -b[3]]
  }
  if (d > 0.9995) return qnorm(a.map((x, i) => x + (bb[i] - x) * t) as Q)
  const th = Math.acos(d)
  const s = Math.sin(th)
  const wa = Math.sin((1 - t) * th) / s
  const wb = Math.sin(t * th) / s
  return a.map((x, i) => x * wa + bb[i] * wb) as Q
}

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

const RIPPLE_SPEED = 0.032 // cells per ms
const RIPPLE_LIFE = 2200 // ms
const RIPPLE_WIDTH = 3.2 // cells
const IDLE_AXIS: V3 = norm([0.25, 1, 0.12])
const IDLE_RATE = 0.00012 // rad per ms
const DRAG_RATE = 0.0095 // rad per px
const ROLL_MS = 1100
const SETTLE_MS = 380
const NUMBER_MS = 1900

export function GlyphField({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const live = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const c = canvas.current
    const btn = button.current
    if (!c || !btn) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const raster = document.createElement('canvas')
    const rctx = raster.getContext('2d', { willReadFrequently: true })!
    const numCanvas = document.createElement('canvas')
    const nctx = numCanvas.getContext('2d', { willReadFrequently: true })!
    // the visible edges, and the face toward the viewer, one pixel per cell
    const edgeCanvas = document.createElement('canvas')
    const ectx = edgeCanvas.getContext('2d', { willReadFrequently: true })!
    const frontCanvas = document.createElement('canvas')
    const fctx = frontCanvas.getContext('2d', { willReadFrequently: true })!
    const atlas = document.createElement('canvas')
    const actx = atlas.getContext('2d')!

    let cols = 0
    let rows = 0
    let cell = 14
    let dpr = 1
    let w = 0
    let h = 0
    let img: Uint8ClampedArray = new Uint8ClampedArray(0)
    const ripples: { x: number; y: number; t0: number; s?: number }[] = []

    // the die
    let q: Q = qnorm(qmul(qaxis([1, 0, 0], 0.42), qaxis([0, 1, 0], 0.6)))
    let spin: V3 = [0, 0, 0] // angular velocity, rad per ms (world axes)
    let mode: 'idle' | 'drag' | 'spin' | 'roll' | 'settle' = 'idle'
    let anim = { t0: 0, from: q, to: q, axis: [0, 1, 0] as V3, turns: 0 }
    let shown: { n: number; t0: number } | null = null
    let geo = { ox: 0, oy: 0, scale: 1 }

    const buildAtlas = () => {
      const s = Math.ceil(cell * dpr * 2)
      atlas.width = s * LEVELS.length
      atlas.height = s * BANDS.length
      actx.clearRect(0, 0, atlas.width, atlas.height)
      actx.textAlign = 'center'
      actx.textBaseline = 'middle'
      actx.font = `500 ${Math.round(s * 0.43)}px "Roboto Mono", ui-monospace, monospace`
      BANDS.forEach((col, b) => {
        actx.fillStyle = col
        LEVELS.forEach((g, l) => actx.fillText(g, l * s + s / 2, b * s + s / 2 + s * 0.02))
      })
    }

    const placeButton = () => {
      // the focusable "Roll the D20" target sits over the die, in CSS px
      const r = geo.scale * 1.95 * cell
      Object.assign(btn.style, { left: `${geo.ox * cell - r}px`, top: `${geo.oy * cell - r}px`, width: `${r * 2}px`, height: `${r * 2}px` })
    }

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = c.clientWidth
      h = c.clientHeight
      cell = w < 640 ? 11 : w < 1100 ? 13 : 15
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
      cols = Math.ceil(w / cell)
      rows = Math.ceil(h / cell)
      raster.width = edgeCanvas.width = frontCanvas.width = cols
      raster.height = edgeCanvas.height = frontCanvas.height = rows
      numCanvas.width = cols * SS
      numCanvas.height = rows * SS
      geo = {
        scale: w < 640 ? cols * 0.17 : Math.min(cols * 0.45, rows) * 0.22,
        ox: cols * (w < 900 ? 0.5 : 0.72),
        oy: rows * (w < 640 ? 0.36 : w < 900 ? 0.4 : 0.47),
      }
      buildAtlas()
      placeButton()
    }
    resize()

    const frontFace = () => {
      let best = 0
      let bz = -2
      NORMALS.forEach((n, i) => {
        const z = qrot(q, n)[2]
        if (z > bz) {
          bz = z
          best = i
        }
      })
      return best
    }

    const announce = (text: string) => {
      if (live.current) live.current.textContent = text
    }

    const settled = (t: number) => {
      mode = 'idle'
      const n = NUMBERS[frontFace()]
      shown = { n, t0: t }
      announce(n === 20 ? 'Natural 20!' : `Rolled ${n}`)
      if (n === 20 && !reduce) {
        // flourish: rings that start at the die's edge and travel out, staggered
        const edge = (geo.scale * 1.7) / RIPPLE_SPEED
        ;[0, 220].forEach((d) => ripples.push({ x: geo.ox, y: geo.oy, t0: t + d - edge, s: 0.5 }))
      }
      wake()
    }

    /** Ease the die onto the face nearest the viewer. */
    const settleToFace = (t: number) => {
      const f = frontFace()
      const target = qnorm(qmul(qfromTo(qrot(q, NORMALS[f]), [0, 0, 1]), q))
      if (reduce) {
        q = target
        settled(t)
        return
      }
      anim = { t0: t, from: q, to: target, axis: [0, 1, 0], turns: 0 }
      mode = 'settle'
    }

    const roll = () => {
      const t = performance.now()
      shown = null
      const f = Math.floor(Math.random() * 20)
      const twist = qaxis([0, 0, 1], Math.random() * Math.PI * 2)
      const target = qnorm(qmul(twist, qfromTo(NORMALS[f], [0, 0, 1])))
      if (reduce) {
        q = target
        settled(t)
        draw(t)
        return
      }
      anim = { t0: t, from: q, to: target, axis: norm([Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]), turns: Math.PI * (3 + Math.random() * 1.5) }
      mode = 'roll'
      wake()
    }

    // ---------- pointer: drag / flick / tap on the die, ripple elsewhere ----------
    const cellAt = (e: PointerEvent) => {
      const r = c.getBoundingClientRect()
      return { x: (e.clientX - r.left) / cell, y: (e.clientY - r.top) / cell }
    }
    const onDie = (x: number, y: number) => {
      const cx = Math.floor(x)
      const cy = Math.floor(y)
      if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return false
      return img[(cy * cols + cx) * 4 + 3] > 40
    }
    let drag: { id: number; x: number; y: number; sx: number; sy: number; t: number; t0: number; moved: number } | null = null

    const onDown = (e: PointerEvent) => {
      const p = cellAt(e)
      if (onDie(p.x, p.y)) {
        drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), t0: performance.now(), moved: 0 }
        c.setPointerCapture(e.pointerId)
        c.style.cursor = 'grabbing'
        spin = [0, 0, 0]
        return
      }
      if (reduce) return
      ripples.push({ x: p.x, y: p.y, t0: performance.now() })
      if (ripples.length > 10) ripples.shift()
      wake()
    }
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) {
        if (e.pointerType === 'mouse') {
          const p = cellAt(e)
          c.style.cursor = onDie(p.x, p.y) ? 'grab' : 'pointer'
        }
        return
      }
      const now = performance.now()
      const dx = e.clientX - drag.x
      const dy = e.clientY - drag.y
      drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy))
      if (drag.moved < 5) return
      if (mode !== 'drag') {
        mode = 'drag'
        shown = null
      }
      // dragging right turns the front face right; dragging down turns it down
      const rv: V3 = [-dy * DRAG_RATE, dx * DRAG_RATE, 0]
      const ang = Math.hypot(rv[0], rv[1])
      if (ang > 0) q = qnorm(qmul(qaxis(rv, ang), q))
      const dt = Math.max(8, now - drag.t)
      // smoothed angular velocity for the flick
      spin = spin.map((s, i) => s * 0.5 + (rv[i] / dt) * 0.5) as V3
      drag.x = e.clientX
      drag.y = e.clientY
      drag.t = now
      wake()
    }
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      const now = performance.now()
      const wasTap = drag.moved < 5 && now - drag.t0 < 450
      const idleFor = now - drag.t
      drag = null
      c.style.cursor = 'grab'
      if (wasTap) {
        roll()
        return
      }
      if (reduce || idleFor > 90 || Math.hypot(...spin) < 0.0006) {
        spin = [0, 0, 0]
        settleToFace(now)
      } else mode = 'spin'
      wake()
    }
    c.addEventListener('pointerdown', onDown)
    c.addEventListener('pointermove', onMove)
    c.addEventListener('pointerup', onUp)
    c.addEventListener('pointercancel', onUp)
    btn.addEventListener('click', roll)

    const light = norm([-0.45, -0.6, 0.75])

    // ---------- one frame ----------
    let last = performance.now()
    const draw = (t: number) => {
      const dt = Math.min(50, Math.max(0, t - last))
      last = t

      // advance the die
      if (mode === 'idle' && !reduce && !shown) q = qnorm(qmul(qaxis(IDLE_AXIS, IDLE_RATE * dt), q))
      if (mode === 'spin') {
        const ang = Math.hypot(...spin) * dt
        if (ang > 0) q = qnorm(qmul(qaxis(spin, ang), q))
        const damp = Math.pow(0.955, dt / 16.67)
        spin = spin.map((s) => s * damp) as V3
        if (Math.hypot(...spin) < 0.0005) settleToFace(t)
      }
      if (mode === 'roll' || mode === 'settle') {
        const dur = mode === 'roll' ? ROLL_MS : SETTLE_MS
        const k = Math.min(1, (t - anim.t0) / dur)
        const e = easeOut(k)
        q = qnorm(qmul(qaxis(anim.axis, (1 - e) * anim.turns), qslerp(anim.from, anim.to, e)))
        if (k >= 1) {
          q = anim.to
          settled(t)
        }
      }

      // shade the die into the raster
      const { ox, oy, scale } = geo
      const P = VERTS.map((v) => qrot(q, v))
      rctx.clearRect(0, 0, cols, rows)
      const faces = FACES.map((f, i) => {
        const n = qrot(q, NORMALS[i])
        const z = (P[f[0]][2] + P[f[1]][2] + P[f[2]][2]) / 3
        return { f, n, z, i }
      })
        .filter((x) => x.n[2] > 0)
        .sort((a, b) => a.z - b.z)
      const path = (g: CanvasRenderingContext2D, f: number[]) => {
        g.beginPath()
        f.forEach((vi, j) => {
          const px = ox + P[vi][0] * scale
          const py = oy + P[vi][1] * scale
          if (j) g.lineTo(px, py)
          else g.moveTo(px, py)
        })
        g.closePath()
      }
      ectx.clearRect(0, 0, cols, rows)
      ectx.strokeStyle = '#fff'
      ectx.lineWidth = 0.6
      ectx.lineJoin = 'round'
      for (const { f, n, i } of faces) {
        const lum = Math.max(0, n[0] * light[0] + n[1] * light[1] + n[2] * light[2])
        rctx.fillStyle = `rgb(${FACE_BAND[i] * 50},${Math.round(40 + lum * 215)},255)`
        path(rctx, f)
        rctx.fill()
        path(ectx, f)
        ectx.stroke()
      }
      img = rctx.getImageData(0, 0, cols, rows).data
      const edges = ectx.getImageData(0, 0, cols, rows).data

      // the settled number, in glyphs
      let numFade = 0
      let mask: Float32Array | null = null // per cell: how much of it the numeral covers (0..1)
      let front: Uint8ClampedArray | null = null
      const nat20 = shown?.n === 20
      if (shown) {
        const age = t - shown.t0
        numFade = reduce ? 1 : age < 180 ? age / 180 : age < NUMBER_MS - 500 ? 1 : Math.max(0, (NUMBER_MS - age) / 500)
        if (!reduce && age > NUMBER_MS) shown = null
        else {
          // printed on the face toward the viewer, like a real die
          const top = faces[faces.length - 1]
          fctx.clearRect(0, 0, cols, rows)
          fctx.fillStyle = '#fff'
          path(fctx, top.f)
          fctx.fill()
          front = fctx.getImageData(0, 0, cols, rows).data
          const cx = top.f.reduce((a, vi) => a + ox + P[vi][0] * scale, 0) / 3
          const cy = top.f.reduce((a, vi) => a + oy + P[vi][1] * scale, 0) / 3
          // about the width of the face, a touch past its inner circle; drawn at SS x and sampled per cell
          const size = scale * (shown.n > 9 ? 1.18 : 1.4) * SS
          nctx.clearRect(0, 0, numCanvas.width, numCanvas.height)
          nctx.fillStyle = '#fff'
          nctx.textAlign = 'center'
          nctx.textBaseline = 'middle'
          nctx.font = `700 ${Math.round(size)}px "Space Grotesk", ui-sans-serif, sans-serif`
          nctx.fillText(String(shown.n), cx * SS, cy * SS + size * 0.05)
          const sub = nctx.getImageData(0, 0, numCanvas.width, numCanvas.height).data
          const W = numCanvas.width
          mask = new Float32Array(cols * rows)
          const x0 = Math.max(0, Math.floor(cx - scale * 1.2))
          const x1 = Math.min(cols - 1, Math.ceil(cx + scale * 1.2))
          const y0 = Math.max(0, Math.floor(cy - scale * 1.2))
          const y1 = Math.min(rows - 1, Math.ceil(cy + scale * 1.2))
          for (let y = y0; y <= y1; y++)
            for (let x = x0; x <= x1; x++) {
              let a = 0
              for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) a += sub[((y * SS + sy) * W + x * SS + sx) * 4 + 3]
              mask[y * cols + x] = a / (SS * SS * 255)
            }
        }
      }

      for (let i = ripples.length - 1; i >= 0; i--) if (t - ripples[i].t0 > RIPPLE_LIFE) ripples.splice(i, 1)

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, c.width, c.height)
      const s = Math.ceil(cell * dpr * 2)
      const step = cell * dpr
      const ts = reduce ? 3 : t * 0.00035
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const flow =
            Math.sin(x * 0.16 + ts * 3.1 + Math.sin(y * 0.11 + ts * 2.2) * 1.8) *
            Math.cos(y * 0.13 - ts * 2.4 + Math.sin(x * 0.07 - ts) * 1.4)
          const k = (y * cols + x) * 4
          // the wave only moves the background glyphs; the die's cells stay on the grid so it reads crisp
          const onDie = img[k + 3] > 40
          const dx = reduce || onDie ? 0 : Math.cos(flow * 3 + ts) * 0.28
          const dy = reduce || onDie ? 0 : Math.sin(flow * 3 - ts) * 0.28

          let ring = 0
          for (const r of ripples) {
            const age = t - r.t0
            if (age < 0) continue
            const off = (Math.hypot(x - r.x, y - r.y) - age * RIPPLE_SPEED) / RIPPLE_WIDTH
            ring += Math.exp(-off * off) * (1 - age / RIPPLE_LIFE) * (r.s ?? 1)
          }
          ring = Math.min(1, ring)

          let level: number
          let band: number
          let alpha: number
          const isEdge = onDie && edges[k + 3] > 100
          const onFront = !!front && front[k + 3] > 128
          const cover = mask ? mask[y * cols + x] : 0
          if (onDie) {
            const lum = img[k + 1] / 255
            band = Math.round(img[k] / 50)
            // faces: denser glyphs the more light they catch
            level = Math.min(8, 3 + Math.floor(lum * 6))
            alpha = 0.4 + lum * 0.6
            if (isEdge) {
              // the edges: thin cream seams (a '+' line), so the twenty faces read as one cut gem
              level = 4
              band = 0
              alpha = 0.95
            }
            if (mask) {
              if (cover > 0.42) {
                // the number: solid glyphs, amber for a natural 20
                level = LEVELS.length - 1
                band = nat20 ? 2 : 0
                alpha = alpha * (1 - numFade) + numFade
              } else if (onFront) {
                // the face it's printed on quiets down so the number reads; its edges glow amber
                if (isEdge) band = nat20 ? 3 : 2
                else {
                  level = Math.max(1, level - Math.round(numFade * 4))
                  alpha *= 1 - numFade * 0.55
                }
              } else {
                alpha *= 1 - numFade * 0.35
                if (nat20 && numFade > 0.5 && !isEdge) band = 3
              }
            }
          } else {
            const n = hash(x, y)
            const v = (0.5 + 0.5 * flow) * (0.35 + n * 0.65) * 0.7 + ring * 0.9
            if (v < 0.16) continue
            level = Math.min(6, 1 + Math.floor(v * 5))
            band = 0
            alpha = 0.1 + v * 0.38
          }
          const isNumber = !!mask && onDie && cover > 0.42
          if (ring > 0.25 && !isNumber) {
            band = ring > 0.6 ? 3 : 2
            level = Math.min(LEVELS.length - 1, level + 2)
            alpha = Math.min(1, alpha + ring * 0.5)
          }
          const size = step * 2 * (1 + (isNumber ? 0 : ring) * 0.9)
          ctx.globalAlpha = alpha
          ctx.drawImage(atlas, level * s, band * s, s, s, (x + 0.5 + dx) * step - size / 2, (y + 0.5 + dy) * step - size / 2, size, size)
        }
      }
      ctx.globalAlpha = 1
    }

    // ---------- loop control ----------
    let raf = 0
    let running = false
    let visible = false
    const loop = (t: number) => {
      draw(t)
      raf = requestAnimationFrame(loop)
    }
    const sync = () => {
      const should = visible && !document.hidden && !reduce
      if (should && !running) {
        running = true
        last = performance.now()
        raf = requestAnimationFrame(loop)
      } else if (!should && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    }
    /** Under reduced motion there's no loop: draw once on demand (drags, rolls), and clear the number later. */
    let pending = 0
    let clearNumber = 0
    function wake() {
      if (running) return
      cancelAnimationFrame(pending)
      pending = requestAnimationFrame((t) => draw(t))
      if (reduce && shown) {
        clearTimeout(clearNumber)
        clearNumber = window.setTimeout(() => {
          shown = null
          draw(performance.now())
        }, NUMBER_MS)
      }
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      sync()
    })
    io.observe(c)
    document.addEventListener('visibilitychange', sync)
    const ro = new ResizeObserver(() => {
      resize()
      draw(performance.now()) // resizing clears the canvas: redraw now, not next frame
    })
    ro.observe(c)
    document.fonts?.ready.then(() => {
      buildAtlas()
      draw(performance.now())
    })
    draw(performance.now())

    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(pending)
      clearTimeout(clearNumber)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', sync)
      c.removeEventListener('pointerdown', onDown)
      c.removeEventListener('pointermove', onMove)
      c.removeEventListener('pointerup', onUp)
      c.removeEventListener('pointercancel', onUp)
      btn.removeEventListener('click', roll)
    }
  }, [])

  return (
    <div className={`relative ${className ?? ''}`}>
      <canvas
        ref={canvas}
        role="img"
        aria-label="A D20 drawn in glyphs, turning slowly inside a field of drifting characters. Click the field to send a ripple; drag the D20 to spin it."
        className="block size-full cursor-pointer touch-pan-y"
      />
      {/* keyboard target over the die; pointer clicks pass through to the canvas */}
      <button
        ref={button}
        type="button"
        aria-label="Roll the D20"
        className="pointer-events-none absolute rounded-full opacity-0 focus-visible:opacity-100"
        style={{ outline: 'none' }}
        onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #f4ecdc, 0 0 0 5px rgb(15 15 14 / .9)')}
        onBlur={(e) => (e.currentTarget.style.boxShadow = '')}
      />
      <p ref={live} className="sr-only" aria-live="polite" />
    </div>
  )
}

'use client'
// A quiet pixel-tile texture for page heroes: a grid of square tiles, each a small symmetric pixel motif,
// with vertical runs of empty tiles.
// - Idle: a slow wave flows across the grid, so tiles drift between faint and a little brighter.
// - Click (mouse only): the tile under the pointer cycles through a few accent colors, neighbors follow softly.
// Each motif is pre-drawn once as a sprite; frames only run while the hero is on screen and the tab is visible.

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { easedFade } from '@/lib/fade'

const N = 11 // pixels per tile side (odd, so motifs have a center line)
const HALF = (N + 1) / 2
const MOTIFS = 18

/** Small seeded PRNG so the pattern is the same on every visit. */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Motif = boolean[] // N*N

/** One motif: a quarter drawn from a few families, mirrored on both axes (and sometimes the diagonal). */
function makeMotif(r: () => number): Motif {
  const q: boolean[][] = Array.from({ length: HALF }, () => Array(HALF).fill(false))
  const family = r()
  for (let y = 0; y < HALF; y++)
    for (let x = 0; x < HALF; x++) {
      let on: boolean
      if (family < 0.22) on = x === y || x === y + 1 // X / diagonal bands
      else if (family < 0.4) on = (x + y) % 3 === 0 // stepped stripes
      else if (family < 0.56) on = x + y === HALF - 1 || x + y === HALF - 3 // diamond rings
      else if (family < 0.68) on = x % 2 === 0 && y % 2 === 0 // dot lattice
      else on = r() < 0.42 // free noise
      if (r() < 0.12) on = !on // a little noise in every family
      q[y][x] = on
    }
  if (r() < 0.5) for (let y = 0; y < HALF; y++) for (let x = 0; x < y; x++) q[y][x] = q[x][y] // 8-way symmetry
  const m: Motif = Array(N * N).fill(false)
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const qx = x < HALF ? x : N - 1 - x
      const qy = y < HALF ? y : N - 1 - y
      m[y * N + x] = q[qy][qx]
    }
  return m
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

/** x/y/cx/cy are CSS px (pointer + text tests); dx/dy are whole device pixels (drawing). */
type Tile = {
  x: number
  y: number
  dx: number
  dy: number
  cx: number
  cy: number
  m: number
  phase: number
  clear: number
  /** click pop: when it starts (ms, page clock) and how strong (1 for the clicked tile, less for neighbors) */
  popAt: number
  popK: number
}

/** Colors a clicked tile cycles through before settling back. */
const POP = ['#ff5a2e', '#ffb02e', '#3ddc97', '#38bdf8', '#a78bfa']
const POP_STEP = 140 // ms per color
const POP_FADE = 520 // ms to fade out after the last color

export function PixelTiles({
  className,
  seed = 7,
  pixel = 7,
  tall = false,
}: {
  className?: string
  seed?: number
  pixel?: number
  /** Let the pattern run further down before it fades (the tall Home hero). */
  tall?: boolean
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const host = canvas?.parentElement
    if (!canvas || !host) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    let w = 0
    let h = 0
    let dpr = 1
    let px = pixel
    let tileSize = 0 // CSS px
    let pxD = 1 // one motif pixel, in whole device pixels
    let padD = 0
    let tiles: Tile[] = []
    let baseSprites: HTMLCanvasElement[] = []
    let popSprites: HTMLCanvasElement[][] = [] // [color][motif]
        let baseAlpha = 0.06
    let raf = 0
    let last = 0
    let t0 = performance.now()
    let visible = true

    const PAD = 8 // CSS px of room around a sprite for the outline glow

    /**
     * A motif sprite: a soft fill plus a thin outline along the outer edges of its pixel shapes, with a faint
     * glow baked in (drawn once, so frames stay cheap). Built in whole device pixels and later drawn 1:1, so
     * every square sits exactly on the screen's pixel grid (no resampling, no soft edges at 125%/150% zoom).
     */
    const sprite = (m: Motif, color: string, { fill, glow, line }: { fill: number; glow: number; line: number }) => {
      const c = document.createElement('canvas')
      c.width = c.height = N * pxD + padD * 2
      const g = c.getContext('2d')!
      g.translate(padD, padD)
      g.fillStyle = color
      g.globalAlpha = fill
      const px = pxD
      for (let i = 0; i < N * N; i++) if (m[i]) g.fillRect((i % N) * px, Math.floor(i / N) * px, px, px)
      // outline: one thin bar on every side of an "on" pixel that faces an "off" pixel
      const on = (x: number, y: number) => x >= 0 && y >= 0 && x < N && y < N && m[y * N + x]
      const edges = () => {
        for (let y = 0; y < N; y++)
          for (let x = 0; x < N; x++) {
            if (!on(x, y)) continue
            const X = x * px
            const Y = y * px
            if (!on(x, y - 1)) g.fillRect(X, Y, px, line)
            if (!on(x, y + 1)) g.fillRect(X, Y + px - line, px, line)
            if (!on(x - 1, y)) g.fillRect(X, Y, line, px)
            if (!on(x + 1, y)) g.fillRect(X + px - line, Y, line, px)
          }
      }
      g.globalAlpha = 1
      g.shadowColor = color
      g.shadowBlur = glow * dpr
      g.shadowOffsetX = g.shadowOffsetY = 0
      edges()
      g.shadowBlur = 0
      edges() // a crisp pass on top so the line stays sharp inside its glow
      return c
    }

    /** Idle brightness for a tile: two slow waves crossing the grid, plus a per-tile offset. */
    const idle = (tile: Tile, t: number) => {
      if (reduce) return 0.7
      const a = Math.sin(tile.cx * 0.0042 + tile.cy * 0.0021 - t * 0.00055)
      const b = Math.sin(tile.cy * 0.0055 - tile.cx * 0.0017 + t * 0.00036 + tile.phase * 0.35)
      const v = (a + b) * 0.25 + 0.5 // 0..1
      return 0.18 + 0.82 * smooth(0.15, 0.95, v)
    }

    const draw = (now: number, dt: number) => {
      const t = now - t0
      ctx.setTransform(1, 0, 0, 1, 0, 0) // draw in device pixels, sprites 1:1
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let lit = false
      for (const tile of tiles) {
        ctx.globalAlpha = baseAlpha * idle(tile, t) * tile.clear
        ctx.drawImage(baseSprites[tile.m], tile.dx - padD, tile.dy - padD)
        if (tile.popAt >= 0) {
          // the pop: step through the colors, then fade the last one out
          const age = now - tile.popAt
          const total = POP.length * POP_STEP + POP_FADE
          if (age < 0) lit = true
          else if (age > total) tile.popAt = -1
          else {
            const i = Math.min(POP.length - 1, Math.floor(age / POP_STEP))
            const fade = age < POP.length * POP_STEP ? 1 : 1 - (age - POP.length * POP_STEP) / POP_FADE
            ctx.globalAlpha = Math.max(0, fade) * tile.popK * tile.clear
            ctx.drawImage(popSprites[i][tile.m], tile.dx - padD, tile.dy - padD)
            lit = true
          }
        }
      }
      ctx.globalAlpha = 1
      return lit
    }

    const build = () => {
      const r = host.getBoundingClientRect()
      w = Math.ceil(r.width)
      h = Math.ceil(r.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`

      const cs = getComputedStyle(host)
      const fg = cs.getPropertyValue('--fg').trim() || '#151412'
      const glow = cs.getPropertyValue('--signal').trim() || '#ff5a2e'
      const dark = host.closest('.dark') !== null
      baseAlpha = dark ? 0.2 : 0.17

      px = w < 640 ? Math.max(4, pixel - 2) : pixel
      pxD = Math.max(2, Math.round(px * dpr))
      padD = Math.round(PAD * dpr)
      tileSize = (N * pxD) / dpr
      const stepD = (N + 1) * pxD // one motif pixel of space between tiles
      const cols = Math.ceil(canvas.width / stepD) + 1
      const rows = Math.ceil(canvas.height / stepD) + 1
      const r0 = rng(seed)
      const motifs = Array.from({ length: MOTIFS }, () => makeMotif(r0))
      const line = Math.max(1, Math.round(pxD * 0.16)) // whole device pixels, so the outline is one crisp line
      baseSprites = motifs.map((m) => sprite(m, fg, { fill: 0.3, glow: dark ? 1.5 : 0, line }))
      popSprites = POP.map((c) => motifs.map((m) => sprite(m, c, { fill: 0.55, glow: 6, line })))

      // vertical runs: each column alternates filled and empty stretches
      const r1 = rng(seed + 101)
      tiles = []
      for (let c = 0; c < cols; c++) {
        let filled = r1() < 0.6
        let run = 0
        for (let row = 0; row < rows; row++) {
          if (run <= 0) {
            filled = !filled
            run = 1 + Math.floor(r1() * (filled ? 5 : 3))
          }
          run--
          const m = Math.floor(r1() * MOTIFS)
          const phase = r1() * Math.PI * 2
          if (!filled) continue
          const dx = c * stepD
          const dy = row * stepD
          const x = dx / dpr
          const y = dy / dpr
          tiles.push({ x, y, dx, dy, cx: x + tileSize / 2, cy: y + tileSize / 2, m, phase, clear: 1, popAt: -1, popK: 0 })
        }
      }
      measure()
    }

    /**
     * Keep text readable: tiles under or right beside body-size text fade most of the way out.
     * Big display type is solid enough to sit on the pattern, so it's skipped.
     */
    const measure = () => {
      const origin = host.getBoundingClientRect()
      const rects: { l: number; t: number; r: number; b: number }[] = []
      const range = document.createRange()
      const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT)
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent || !n.textContent.trim()) continue
        const el = n.parentElement
        if (!el || parseFloat(getComputedStyle(el).fontSize) > 40) continue
        range.selectNodeContents(n)
        for (const r of range.getClientRects()) {
          if (!r.width || !r.height) continue
          const pad = 10
          rects.push({ l: r.left - origin.left - pad, t: r.top - origin.top - pad, r: r.right - origin.left + pad, b: r.bottom - origin.top + pad })
        }
      }
      // whole rows and cards too (list rows, link cards), so tiles don't show in the gaps between their words
      for (const el of host.querySelectorAll('dl > div, li, a, [data-tiles-clear]')) {
        const r = el.getBoundingClientRect()
        if (!r.width || r.width * r.height > origin.width * origin.height * 0.4) continue
        rects.push({ l: r.left - origin.left - 6, t: r.top - origin.top - 6, r: r.right - origin.left + 6, b: r.bottom - origin.top + 6 })
      }
      for (const tile of tiles) {
        const hit = rects.some((r) => tile.x < r.r && tile.x + tileSize > r.l && tile.y < r.b && tile.y + tileSize > r.t)
        tile.clear = hit ? 0.16 : 1
      }
      draw(performance.now(), 0)
    }

    // the idle fade is slow, so it only needs ~20fps; click flashes draw every frame until they finish
    const IDLE_MS = 50
    let lastDraw = 0
    let popping = false
    const frame = (now: number) => {
      if (!popping && now - lastDraw < IDLE_MS) {
        raf = visible && !reduce ? requestAnimationFrame(frame) : 0
        return
      }
      const dt = last ? Math.min(64, now - last) : 16
      last = now
      lastDraw = now
      const lit = draw(now, dt)
      popping = lit
      // keep running while the idle wave plays (on screen) or while a flash is still fading
      raf = visible && (!reduce || lit) ? requestAnimationFrame(frame) : 0
      if (!raf) last = 0
    }
    const start = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
      last = 0
    }

    build()
    t0 = performance.now()
    const ro = new ResizeObserver(() => build())
    // text can shift after fonts load or reveal animations settle, so re-measure a few times
    void document.fonts?.ready.then(() => measure())
    const remeasure = [400, 1500].map((ms) => window.setTimeout(measure, ms))
    ro.observe(host)
    const mo = new MutationObserver(() => build())
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && document.visibilityState === 'visible'
      if (visible) start()
      else stop()
    })
    io.observe(host)
    const onVis = () => {
      visible = document.visibilityState === 'visible'
      if (visible) start()
      else stop()
    }
    document.addEventListener('visibilitychange', onVis)

    /** Click a tile: it cycles through the pop colors; the eight around it follow a beat later, softer. */
    const click = (e: MouseEvent) => {
      if (e.button !== 0) return
      // leave real controls and text alone
      if ((e.target as HTMLElement).closest('a,button,input,textarea,select,label,[role=button]')) return
      // and the text itself (its line boxes, not the full-width block around it), so selecting text still works
      const range = document.createRange()
      const walker = document.createTreeWalker(e.target as Node, NodeFilter.SHOW_TEXT)
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent?.trim()) continue
        range.selectNodeContents(n)
        for (const q of range.getClientRects())
          if (e.clientX >= q.left - 4 && e.clientX <= q.right + 4 && e.clientY >= q.top - 4 && e.clientY <= q.bottom + 4) return
      }
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      const hit = tiles.find((t) => x >= t.x && x <= t.x + tileSize && y >= t.y && y <= t.y + tileSize)
      if (!hit || hit.clear < 0.5) return
      const now = performance.now()
      const reach = tileSize * 1.6
      for (const t of tiles) {
        const d = Math.hypot(t.cx - hit.cx, t.cy - hit.cy)
        if (t === hit) {
          t.popAt = now
          popping = true
          t.popK = 1
        } else if (d < reach) {
          t.popAt = now + (reduce ? 0 : 90)
          t.popK = Math.max(t.popAt > now ? t.popK : 0, 0.45)
        }
      }
      start()
    }

    if (fine) {
      host.addEventListener('click', click)
    }
    if (!reduce) start()

    return () => {
      stop()
      remeasure.forEach(clearTimeout)
      ro.disconnect()
      mo.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      host.removeEventListener('click', click)
    }
  }, [seed, pixel])

  // fades out toward the bottom so the hero blends into the next section (and never runs behind long content)
  const fade = easedFade('to bottom', 'min(45%, calc(var(--tiles-end) * 0.5))', 'min(100%, var(--tiles-end))')
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
      className={cn(
        'pointer-events-none absolute inset-0 -z-10',
        tall ? '[--tiles-end:560px] md:[--tiles-end:1000px]' : '[--tiles-end:440px] md:[--tiles-end:640px]',
        className,
      )}
    />
  )
}

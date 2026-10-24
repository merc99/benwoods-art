'use client'
// Rat Mats cover: a desk mat, and a rat that chases your mouse. It hops out of the lockup and follows the
// cursor on a smooth spring, turning around with a quick squash when it changes direction, and stops just
// short of the pointer. Click (or tap) to drop a wedge of cheese: the rat runs over and eats it in a few
// bites, crumbs flying, then goes back to following you. Leave the mat and it runs home into the logo.
// Reduced motion: the rat stays in the logo.

import { useEffect, useRef } from 'react'
import { reducedMotion, useInView } from '../useInView'

const MAT = '/work/rat-mats/hero/mat-v2.webp'
const RAT = '/work/rat-mats/hero/rat-v2.png'
// where the rat sits in the lockup, as fractions of the cover (2560 × 1600), and its width; the sprite is 356 × 200
const HOME = { x: (556 + 178) / 2560, y: (700 + 100) / 1600, w: 356 / 2560 }
const RAT_H = 200 / 356
const BITES = 4
const BITE_MS = 380
const CHEESE = '#f2c230'
const INK = '#0e0d0c'

type Cheese = { x: number; y: number; t0: number; bites: number; nextBite: number }
type Crumb = { x: number; y: number; vx: number; vy: number; t0: number }

export function RatMatsHero() {
  const box = useRef<HTMLDivElement>(null)
  const rat = useRef<HTMLImageElement>(null)
  const layer = useRef<HTMLCanvasElement>(null)
  const visible = useInView(box)
  const pointer = useRef<{ x: number; y: number } | null>(null) // fractions of the box
  const cheese = useRef<Cheese | null>(null)
  const touchHome = useRef(false) // touch: head home once the cheese is gone

  useEffect(() => {
    const el = box.current
    const img = rat.current
    const cv = layer.current
    if (!el || !img || !cv || !visible || reducedMotion()) return
    const ctx = cv.getContext('2d')!
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let W = 1
    let H = 1
    let rw = 1
    const fit = () => {
      W = el.clientWidth
      H = el.clientHeight
      rw = HOME.w * W
      cv.width = W * dpr
      cv.height = H * dpr
      img.style.width = `${rw}px`
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    img.style.left = '0'
    img.style.top = '0'

    const p = { x: HOME.x * W, y: HOME.y * H }
    const v = { x: 0, y: 0 }
    let facing = 1 // 1 = facing left, as drawn; -1 = facing right
    let flip = 1 // the drawn scaleX, eased toward `facing` so a turn reads as a quick squash
    let turnSince = 0
    let stride = 0
    let phase = 0
    let side = 1
    let homeAt = 0
    const marks: { x: number; y: number; t: number }[] = []
    const crumbs: Crumb[] = []
    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000)
      last = now
      if (homeAt && now > homeAt) {
        pointer.current = null
        homeAt = 0
      }

      // where to go: the cheese first, then the pointer, else home
      const ch = cheese.current
      const goal = ch
        ? { x: ch.x * W, y: ch.y * H }
        : pointer.current
          ? { x: pointer.current.x * W, y: pointer.current.y * H }
          : { x: HOME.x * W, y: HOME.y * H }
      const atHome = !ch && !pointer.current
      // stop with the nose just short of the goal (not when going home: it settles exactly into the logo)
      const stop = atHome ? 0 : rw * (ch ? 0.5 : 0.62)
      const gx = goal.x - p.x
      const gy = goal.y - p.y
      const gd = Math.hypot(gx, gy)
      const tx = gd > stop ? goal.x - (gx / (gd || 1)) * stop : p.x
      const ty = gd > stop ? goal.y - (gy / (gd || 1)) * stop : p.y

      // a critically damped spring with a top speed: smooth starts and stops, no overshoot
      const k = 38
      const c = 2 * Math.sqrt(k)
      v.x += ((tx - p.x) * k - v.x * c) * dt
      v.y += ((ty - p.y) * k - v.y * c) * dt
      const max = W * 0.75
      const sp = Math.hypot(v.x, v.y)
      if (sp > max) {
        v.x *= max / sp
        v.y *= max / sp
      }
      p.x += v.x * dt
      p.y += v.y * dt
      const speed = Math.hypot(v.x, v.y)

      // face the goal, only once it has clearly been on the other side for a moment (no flicker)
      const want = gd > rw * 0.3 ? (gx > 0 ? -1 : 1) : atHome ? 1 : facing
      if (want !== facing) {
        if (!turnSince) turnSince = now
        if (now - turnSince > 90) {
          facing = want
          turnSince = 0
        }
      } else turnSince = 0
      flip += (facing - flip) * Math.min(1, dt * 16)

      // a light scurry: a small hop that follows the distance travelled
      phase += speed * dt
      const hop = speed > 25 ? Math.abs(Math.sin(phase / (rw * 0.09))) * rw * 0.035 * Math.min(1, speed / (W * 0.25)) : 0

      // paw prints every short stride
      stride += speed * dt
      if (speed > 40 && stride > rw * 0.2) {
        stride = 0
        side *= -1
        marks.push({
          x: p.x - (v.x / speed) * rw * 0.25 + (-v.y / speed) * side * rw * 0.06,
          y: p.y + rw * RAT_H * 0.42 + (v.x / speed) * side * rw * 0.03,
          t: now,
        })
        if (marks.length > 40) marks.shift()
      }

      // eating: once the nose reaches the cheese, a bite every BITE_MS, each throwing a few crumbs
      let nibble = 0
      if (ch && gd <= stop + rw * 0.08) {
        if (!ch.nextBite) ch.nextBite = now + 160
        if (now >= ch.nextBite) {
          ch.bites++
          ch.nextBite = now + BITE_MS
          for (let i = 0; i < 5; i++) crumbs.push({ x: ch.x * W, y: ch.y * H, vx: (Math.random() - 0.5) * rw * 2.2, vy: -Math.random() * rw * 1.6, t0: now })
          if (ch.bites >= BITES) {
            cheese.current = null
            if (touchHome.current) {
              touchHome.current = false
              homeAt = now + 1200
            }
          }
        }
        nibble = Math.sin(Math.max(0, (ch.nextBite - now) / BITE_MS) * Math.PI) * rw * 0.025
      }

      img.style.transform = `translate3d(${(p.x - rw / 2).toFixed(1)}px, ${(p.y - (rw * RAT_H) / 2 - hop + nibble).toFixed(1)}px, 0) scaleX(${flip.toFixed(3)})`

      // the mat layer: paw prints, the cheese, crumbs
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = INK
      const u = rw * 0.014
      for (let i = marks.length - 1; i >= 0; i--) {
        const age = (now - marks[i].t) / 1400
        if (age > 1) {
          marks.splice(i, 1)
          continue
        }
        ctx.globalAlpha = 0.22 * (1 - age)
        const { x, y } = marks[i]
        ctx.beginPath()
        ctx.arc(x, y, u * 1.2, 0, Math.PI * 2)
        ctx.moveTo(x - u * 1.05, y - u * 1.5)
        ctx.arc(x - u * 1.6, y - u * 1.5, u * 0.55, 0, Math.PI * 2)
        ctx.moveTo(x + u * 0.55, y - u * 2.1)
        ctx.arc(x, y - u * 2.1, u * 0.55, 0, Math.PI * 2)
        ctx.moveTo(x + u * 2.15, y - u * 1.5)
        ctx.arc(x + u * 1.6, y - u * 1.5, u * 0.55, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      const cur = cheese.current
      if (cur) drawCheese(ctx, cur.x * W, cur.y * H, rw * 0.36, 1 - cur.bites / BITES, Math.min(1, (now - cur.t0) / 220))
      ctx.fillStyle = CHEESE
      for (let i = crumbs.length - 1; i >= 0; i--) {
        const cr = crumbs[i]
        const age = (now - cr.t0) / 1000
        if (age > 0.7) {
          crumbs.splice(i, 1)
          continue
        }
        cr.vy += rw * 6 * dt
        cr.x += cr.vx * dt
        cr.y += cr.vy * dt
        ctx.globalAlpha = 1 - age / 0.7
        ctx.fillRect(cr.x - rw * 0.012, cr.y - rw * 0.012, rw * 0.024, rw * 0.024)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [visible])

  const local = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
  }

  return (
    <div
      ref={box}
      className="relative size-full cursor-pointer touch-pan-y overflow-hidden select-none"
      style={{ backgroundImage: `url(${MAT})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      onPointerMove={(e) => {
        if (e.pointerType === 'mouse') pointer.current = local(e)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') pointer.current = null
      }}
      onPointerDown={(e) => {
        cheese.current = { ...local(e), t0: performance.now(), bites: 0, nextBite: 0 }
        if (e.pointerType !== 'mouse') touchHome.current = true
      }}
    >
      {/* the mat's stitched edge */}
      <span aria-hidden className="pointer-events-none absolute inset-[2.2%] rounded-[10px] border-[1.5px] border-dashed border-[#0e0d0c]/15" />
      <canvas ref={layer} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={rat}
        src={RAT}
        alt=""
        draggable={false}
        className="pointer-events-none absolute origin-center will-change-transform select-none"
        // at home in the lockup until the chase starts (and for reduced motion, where it stays put)
        style={{ width: `${HOME.w * 100}%`, left: `${(556 / 2560) * 100}%`, top: `${(700 / 1600) * 100}%` }}
      />
      <p className="t-label pointer-events-none absolute bottom-[4.5%] left-[4.5%] text-[#5b5446] max-sm:hidden">Move your mouse · click to drop cheese</p>
      <span className="sr-only">The Rat Mats lockup on a desk mat. The rat follows your mouse pointer; click to drop cheese for it.</span>
    </div>
  )
}

/** A wedge of cheese with holes, outlined in the lockup's black ink; `left` (0..1) shrinks it bite by bite from the tip. */
function drawCheese(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, left: number, pop: number) {
  if (left <= 0) return
  const s = w * (0.6 + 0.4 * pop) * (pop < 1 ? 1 + Math.sin(pop * Math.PI) * 0.15 : 1)
  const h = s * 0.62
  ctx.save()
  ctx.translate(x, y)
  // eaten from the pointed end: clip away the bitten part
  ctx.beginPath()
  ctx.rect(-s / 2 + s * (1 - left), -h, s * left + 4, h * 2)
  ctx.clip()
  ctx.beginPath()
  ctx.moveTo(-s / 2, h / 2)
  ctx.lineTo(s / 2, h / 2)
  ctx.lineTo(s / 2, -h / 2)
  ctx.closePath()
  ctx.fillStyle = CHEESE
  ctx.fill()
  ctx.lineWidth = Math.max(1.5, s * 0.05)
  ctx.lineJoin = 'round'
  ctx.strokeStyle = INK
  ctx.stroke()
  ctx.fillStyle = INK
  for (const [hx, hy, r] of [
    [0.28, 0.22, 0.07],
    [0.1, 0.34, 0.045],
    [0.36, -0.06, 0.05],
  ] as const) {
    ctx.beginPath()
    ctx.arc(hx * s, hy * s, r * s, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

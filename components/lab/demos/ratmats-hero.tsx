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

type Cheese = { x: number; y: number; t0: number; bites: number; nextBite: number; side?: number }
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
      // for the cheese: walk up beside it, on whichever side the rat comes from, mouth level with the wedge
      if (ch && !ch.side) ch.side = p.x > ch.x * W ? 1 : -1
      const goal = ch
        ? { x: ch.x * W + (ch.side ?? 1) * rw * 0.72, y: ch.y * H - rw * 0.06 }
        : pointer.current
          ? { x: pointer.current.x * W, y: pointer.current.y * H }
          : { x: HOME.x * W, y: HOME.y * H }
      const atHome = !ch && !pointer.current
      // stop with the nose just short of the pointer (the cheese and home spots are exact already)
      const stop = atHome || ch ? 0 : rw * 0.62
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
      const want = ch && gd < rw * 0.5 ? (ch.side ?? 1) : gd > rw * 0.3 ? (gx > 0 ? -1 : 1) : atHome ? 1 : facing
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
      if (ch && gd <= rw * 0.1) {
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
      if (cur) drawCheese(ctx, cur.x * W, cur.y * H, rw * 0.54, cur.bites, Math.min(1, (now - cur.t0) / 220), cur.side ?? -1)
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

// The wedge, in a unit box (1 wide, 0.9 tall), seen from the front-left and a little above: a long pale
// top face running back from the tip, the golden cut face in front, and the darker rind side at the back.
const TIP = [0.02, 0.66] as const
const FT = [0.64, 0.24] as const // front edge, top
const FB = [0.64, 0.86] as const // front edge, bottom
const BT = [0.97, 0.1] as const // back edge, top
const BB = [0.97, 0.72] as const // back edge, bottom
// holes on the cut face and the top: [x, y, rx, ry]
const HOLES = [
  [0.4, 0.6, 0.075, 0.062],
  [0.52, 0.42, 0.05, 0.042],
  [0.24, 0.66, 0.045, 0.036],
  [0.55, 0.75, 0.04, 0.03],
  [0.73, 0.22, 0.045, 0.014],
] as const
const RIND_HOLES = [[0.82, 0.5, 0.03, 0.058]] as const
// each bite takes a round scallop out of the end the rat is eating from, a little further in each time
const BITE_TIP = [
  [0.05, 0.66, 0.13],
  [0.19, 0.6, 0.14],
  [0.34, 0.55, 0.15],
] as const
const BITE_BACK = [
  [0.98, 0.36, 0.13],
  [0.86, 0.42, 0.14],
  [0.72, 0.48, 0.15],
] as const

const sprites = new Map<string, HTMLCanvasElement>()

/** The wedge drawn once per size and bite count (canvas paths, cached), in the lockup's black ink. */
function cheeseSprite(s: number, bites: number, dpr: number, side: number) {
  const key = `${Math.round(s)}|${bites}|${dpr}|${side}`
  const hit = sprites.get(key)
  if (hit) return hit
  const pad = s * 0.08
  const c = document.createElement('canvas')
  c.width = Math.ceil((s + pad * 2) * dpr)
  c.height = Math.ceil((s * 0.9 + pad * 2) * dpr)
  const g = c.getContext('2d')!
  g.scale(dpr, dpr)
  g.translate(pad, pad)
  const P = ([x, y]: readonly [number, number]) => [x * s, y * s] as const
  const poly = (pts: (readonly [number, number])[]) => {
    g.beginPath()
    pts.forEach((p, i) => (i ? g.lineTo(...P(p)) : g.moveTo(...P(p))))
    g.closePath()
  }
  const ink = Math.max(1.5, s * 0.035)

  // faces
  poly([TIP, FT, FB])
  g.fillStyle = '#f6bd2e' // cut face
  g.fill()
  poly([TIP, BT, FT])
  g.fillStyle = '#ffdc6b' // top, catching the light
  g.fill()
  poly([FT, BT, BB, FB])
  g.fillStyle = '#e09a1c' // rind side
  g.fill()

  // holes: a dark well with a lighter lip on the lower edge
  const hole = (x: number, y: number, rx: number, ry: number, deep: string) => {
    g.beginPath()
    g.ellipse(x * s, y * s, rx * s, ry * s, 0, 0, Math.PI * 2)
    g.fillStyle = deep
    g.fill()
    g.beginPath()
    g.ellipse(x * s, (y + ry * 0.35) * s, rx * s * 0.82, ry * s * 0.62, 0, 0, Math.PI)
    g.fillStyle = 'rgb(255 232 150 / 0.55)'
    g.fill()
  }
  g.save()
  poly([TIP, FT, FB])
  g.clip()
  for (const [x, y, rx, ry] of HOLES.slice(0, 4)) hole(x, y, rx, ry, '#b9740f')
  g.restore()
  g.save()
  poly([TIP, BT, FT])
  g.clip()
  const [tx, ty, trx, try_] = HOLES[4]
  hole(tx, ty, trx, try_, '#c98a17')
  g.restore()
  g.save()
  poly([FT, BT, BB, FB])
  g.clip()
  for (const [x, y, rx, ry] of RIND_HOLES) hole(x, y, rx, ry, '#a8650c')
  g.restore()

  // a highlight along the top edge
  g.beginPath()
  g.moveTo(...P([TIP[0] + 0.06, TIP[1] - 0.035]))
  g.lineTo(...P([FT[0] - 0.02, FT[1] + 0.01]))
  g.strokeStyle = 'rgb(255 250 220 / 0.8)'
  g.lineWidth = ink * 0.7
  g.lineCap = 'round'
  g.stroke()

  // ink: the outline, then the inner edges a touch thinner
  g.lineJoin = 'round'
  g.strokeStyle = INK
  g.lineWidth = ink
  poly([TIP, BT, BB, FB])
  g.stroke()
  g.lineWidth = ink * 0.75
  g.beginPath()
  g.moveTo(...P(TIP))
  g.lineTo(...P(FT))
  g.lineTo(...P(FB))
  g.moveTo(...P(FT))
  g.lineTo(...P(BT))
  g.stroke()

  // bites: punch round scallops out of the tip end, then ink their edges where cheese remains
  for (const [x, y, r] of (side > 0 ? BITE_BACK : BITE_TIP).slice(0, bites)) {
    g.globalCompositeOperation = 'destination-out'
    g.beginPath()
    g.arc(x * s, y * s, r * s, 0, Math.PI * 2)
    g.fill()
    g.globalCompositeOperation = 'source-atop'
    g.beginPath()
    g.arc(x * s, y * s, r * s + ink * 0.45, 0, Math.PI * 2)
    g.strokeStyle = INK
    g.lineWidth = ink * 0.9
    g.stroke()
    g.globalCompositeOperation = 'source-over'
  }
  sprites.set(key, c)
  return c
}

/** The cheese on the mat: a soft shadow, then the wedge; it pops in, and loses a scallop per bite. */
function drawCheese(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, bites: number, pop: number, side: number) {
  if (bites >= BITES) return
  const s = w * (0.6 + 0.4 * pop) * (pop < 1 ? 1 + Math.sin(pop * Math.PI) * 0.15 : 1)
  const dpr = ctx.getTransform().a || 1
  ctx.save()
  ctx.fillStyle = INK
  ctx.globalAlpha = 0.12
  ctx.beginPath()
  ctx.ellipse(x + s * 0.06, y + s * 0.4, s * 0.5, s * 0.075, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  const sp = cheeseSprite(w, Math.min(bites, BITE_TIP.length), dpr, side)
  const k = s / w
  const pad = w * 0.08
  ctx.drawImage(sp, x - s / 2 - pad * k, y - s * 0.5 - pad * k, (w + pad * 2) * k, (w * 0.9 + pad * 2) * k)
}

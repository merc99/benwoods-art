'use client'
// Interactive case-study covers for Mega Roll and Rat Mats. Each draws its own full cover, laid over the
// static image (which shows until this mounts, and stays for reduced motion).

import { useEffect, useRef } from 'react'
import { MEGA_ROLL_PATHS } from '@/lib/mega-roll-logo'
import { reducedMotion, useInView } from '../useInView'

// ---------------------------------------------------------------------------------------------------------
// Mega Roll: the wordmark's stacked color layers (pink, violet, cyan, green, yellow) fan out on hover, as on
// the Mega Roll site, and lean away from the pointer like a shadow from a light you're holding. Click to roll:
// the layers burst out and spring back.

const LAYERS = ['#FFF600', '#6AFF00', '#00C8FF', '#985DFF', '#FF256A'] // back to front, under the black letters
const REST = 5 // viewBox units per layer at rest
const HOVER = 10
const BURST = 34

export function MegaRollHero() {
  const box = useRef<HTMLDivElement>(null)
  const uses = useRef<(SVGGElement | null)[]>([])
  const visible = useInView(box)
  const st = useRef({ inside: false, px: 0.5, py: 0.35, ox: REST, oy: REST, vx: 0, vy: 0, kick: 0 })

  useEffect(() => {
    if (!visible || reducedMotion()) return
    const s = st.current
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      // the offset leans away from the pointer (a light held where the cursor is)
      const dx = 0.5 - s.px
      const dy = 0.42 - s.py
      const len = Math.hypot(dx, dy) || 1
      const mag = (s.inside ? HOVER : REST) + s.kick
      const tx = s.inside ? (dx / len) * mag * 1.05 + mag * 0.35 : mag
      const ty = s.inside ? (dy / len) * mag * 1.05 + mag * 0.35 : mag
      // a bouncy spring, like the site's cubic-bezier(.3,1.6,.5,1)
      s.vx += ((tx - s.ox) * 170 - s.vx * 13) * dt
      s.vy += ((ty - s.oy) * 170 - s.vy * 13) * dt
      s.ox += s.vx * dt
      s.oy += s.vy * dt
      s.kick *= Math.pow(0.02, dt)
      uses.current.forEach((g, i) => {
        const n = LAYERS.length - i
        g?.setAttribute('transform', `translate(${(s.ox * n).toFixed(2)} ${(s.oy * n).toFixed(2)})`)
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible])

  const local = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { px: (e.clientX - r.left) / r.width, py: (e.clientY - r.top) / r.height }
  }

  return (
    <div
      ref={box}
      className="relative grid size-full cursor-pointer place-items-center bg-[#E9E1CD]"
      onPointerMove={(e) => Object.assign(st.current, { inside: e.pointerType === 'mouse', ...local(e) })}
      onPointerLeave={() => (st.current.inside = false)}
      onPointerDown={(e) => Object.assign(st.current, { kick: BURST, ...local(e) })}
    >
      <svg viewBox="-20 -20 1030 520" className="w-[62%] overflow-visible" role="img" aria-label="Mega Roll">
        <defs>
          <g id="mr-letters-hero">
            {MEGA_ROLL_PATHS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </defs>
        {LAYERS.map((c, i) => (
          <g
            key={c}
            ref={(el) => {
              uses.current[i] = el
            }}
            transform={`translate(${REST * (LAYERS.length - i)} ${REST * (LAYERS.length - i)})`}
            fill={c}
          >
            <use href="#mr-letters-hero" />
          </g>
        ))}
        <use href="#mr-letters-hero" fill="#000" />
      </svg>
      <p className="t-label pointer-events-none absolute bottom-4 left-4 text-[#5b5446] max-sm:hidden">Hover · click to roll</p>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------------------
// Rat Mats: a desk mat, and a rat that chases your mouse. The rat hops out of the lockup and scurries after
// the cursor, leaving small paw prints that fade; leave the mat and it runs home into the logo. On touch,
// tap where it should go.

const MAT = '/work/rat-mats/hero/mat.webp'
const RAT = '/work/rat-mats/hero/rat.png'
// where the rat sits in the lockup, as fractions of the cover (2560 × 1600), and its width
const HOME = { x: (556 + 178) / 2560, y: (700 + 100) / 1600, w: 356 / 2560 }

export function RatMatsHero() {
  const box = useRef<HTMLDivElement>(null)
  const rat = useRef<HTMLImageElement>(null)
  const prints = useRef<HTMLCanvasElement>(null)
  const visible = useInView(box)
  const target = useRef<{ x: number; y: number } | null>(null)
  const home = useRef(0) // touch: when to send the rat home

  useEffect(() => {
    const el = box.current
    const img = rat.current
    const cv = prints.current
    if (!el || !img || !cv || !visible || reducedMotion()) return
    const ctx = cv.getContext('2d')!
    img.style.left = '0'
    img.style.top = '0'
    let W = el.clientWidth
    let H = el.clientHeight
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const fit = () => {
      W = el.clientWidth
      H = el.clientHeight
      cv.width = W * dpr
      cv.height = H * dpr
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)

    const p = { x: HOME.x * W, y: HOME.y * H }
    const v = { x: 0, y: 0 }
    let facing = 1 // 1 = facing left (as drawn), -1 = flipped
    let stride = 0
    let side = 1
    const marks: { x: number; y: number; a: number; t: number }[] = []
    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const rw = HOME.w * W
      if (home.current && now > home.current) {
        target.current = null
        home.current = 0
      }
      const tgt = target.current ? { x: target.current.x * W, y: target.current.y * H } : { x: HOME.x * W, y: HOME.y * H }
      const goingHome = !target.current
      // stop with its nose at the cursor, not on top of it
      const nose = goingHome ? 0 : rw * 0.42
      const dx = tgt.x + (goingHome ? 0 : facing * nose) - p.x
      const dy = tgt.y - p.y
      const dist = Math.hypot(dx, dy)
      const max = W * 0.9 // px per second
      const want = dist < 2 ? 0 : Math.min(max, dist * 5.5)
      const wx = dist ? (dx / dist) * want : 0
      const wy = dist ? (dy / dist) * want : 0
      v.x += (wx - v.x) * Math.min(1, dt * 9)
      v.y += (wy - v.y) * Math.min(1, dt * 9)
      p.x += v.x * dt
      p.y += v.y * dt
      const speed = Math.hypot(v.x, v.y)
      // turn to face where it's going (with some slack, so it doesn't flicker)
      if (v.x > 40) facing = -1
      else if (v.x < -40) facing = 1
      if (goingHome && dist < 3) facing = 1

      // a scurrying bob, and paw prints every short stride
      stride += speed * dt
      const bob = speed > 30 ? Math.sin(stride / (rw * 0.05)) : 0
      const tilt = Math.max(-12, Math.min(12, (v.y / (max || 1)) * 30)) * -facing
      if (speed > 30 && stride > rw * 0.16) {
        stride = 0
        side *= -1
        const nx = -v.y / speed
        const ny = v.x / speed
        marks.push({ x: p.x + nx * side * rw * 0.07 - (v.x / speed) * rw * 0.3, y: p.y + rw * 0.2 + ny * side * rw * 0.05, a: Math.atan2(v.y, v.x), t: now })
        if (marks.length > 60) marks.shift()
      }

      img.style.transform = `translate(${p.x - rw / 2}px, ${p.y - rw * 0.28 + bob * rw * 0.02}px) rotate(${tilt}deg) scaleX(${facing})`
      img.style.width = `${rw}px`

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      for (let i = marks.length - 1; i >= 0; i--) {
        const m = marks[i]
        const age = (now - m.t) / 1600
        if (age > 1) {
          marks.splice(i, 1)
          continue
        }
        ctx.globalAlpha = 0.34 * (1 - age)
        ctx.fillStyle = '#0e0d0c'
        ctx.save()
        ctx.translate(m.x, m.y)
        ctx.rotate(m.a)
        const u = rw * 0.016
        // a paw: a pad and three toes
        ctx.beginPath()
        ctx.ellipse(0, 0, u * 1.3, u * 1.05, 0, 0, Math.PI * 2)
        for (const [tx, ty] of [[u * 1.7, -u * 1.1], [u * 2.1, 0], [u * 1.7, u * 1.1]]) {
          ctx.moveTo(tx + u * 0.5, ty)
          ctx.ellipse(tx, ty, u * 0.5, u * 0.45, 0, 0, Math.PI * 2)
        }
        ctx.fill()
        ctx.restore()
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
      className="relative size-full overflow-hidden"
      style={{ backgroundImage: `url(${MAT})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        target.current = local(e)
        home.current = 0
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') target.current = null
      }}
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse') return
        target.current = local(e)
        home.current = performance.now() + 2600
      }}
    >
      {/* the mat's stitched edge */}
      <span aria-hidden className="pointer-events-none absolute inset-[2.2%] rounded-[10px] border-[1.5px] border-dashed border-[#0e0d0c]/15" />
      <canvas ref={prints} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={rat}
        src={RAT}
        alt=""
        draggable={false}
        className="pointer-events-none absolute top-0 left-0 origin-center select-none"
        // at home in the lockup until the chase starts (and for reduced motion, where it stays put)
        style={{ width: `${HOME.w * 100}%`, left: `${(556 / 2560) * 100}%`, top: `${(700 / 1600) * 100}%` }}
      />
      <p className="t-label pointer-events-none absolute bottom-[4.5%] left-[4.5%] text-[#5b5446] max-sm:hidden">Move your mouse · the rat follows</p>
      <span className="sr-only">The Rat Mats lockup on a desk mat. The rat chases your mouse pointer around the mat.</span>
    </div>
  )
}

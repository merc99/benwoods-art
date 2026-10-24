'use client'
// Interactive case-study cover for Mega Roll (Rat Mats has its own, ratmats-hero.tsx). It draws its own full cover, laid over the
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
      {/* centered on the letters (887 × 435) plus their resting color layers (25 units down-right) */}
      <svg viewBox="-59 -30 1030 520" className="w-[62%] overflow-visible" role="img" aria-label="Mega Roll">
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


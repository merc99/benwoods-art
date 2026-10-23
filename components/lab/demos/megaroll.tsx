'use client'
// Mega Roll demos, ported from handoff/mega-roll/components (holo-character-cards, ability-card-fan).

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { reducedMotion } from '../useInView'
import s from './megaroll.module.css'

const CARDS = [
  { src: '/lab/mega-roll/spellbender-card.webp', alt: 'The Spellbender character card: a hooded caster with a crystal staff, HP 16, power 9, shield 4, speed 7.' },
  { src: '/lab/mega-roll/rot-paladin-card.webp', alt: 'The Rot Paladin character card: an armored knight with green rot, HP 20, power 7, shield 9, speed 2.' },
  { src: '/lab/mega-roll/dream-beast-card.webp', alt: 'The Dream Beast character card: a pink many-eyed cat creature, HP 20, power 7, shield 9, speed 2.' },
]

/** One card: a spring tilt toward the pointer, foil only on the art window, a soft light band across the card. */
function HoloCard({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const st = useRef({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, raf: 0 })

  const wake = () => {
    const el = ref.current
    const s0 = st.current
    if (!el || s0.raf) return
    const tick = () => {
      s0.vx = (s0.vx + (s0.tx - s0.x) * 0.1) * 0.8
      s0.vy = (s0.vy + (s0.ty - s0.y) * 0.1) * 0.8
      s0.x += s0.vx
      s0.y += s0.vy
      el.style.transform = `rotateY(${s0.x * 13}deg) rotateX(${-s0.y * 13}deg)`
      el.style.setProperty('--fx', `${50 + s0.x * 45}%`)
      el.style.setProperty('--fy', `${50 + s0.y * 45}%`)
      if (Math.abs(s0.tx - s0.x) + Math.abs(s0.ty - s0.y) + Math.abs(s0.vx) + Math.abs(s0.vy) > 0.002) s0.raf = requestAnimationFrame(tick)
      else {
        s0.raf = 0
        if (!s0.tx && !s0.ty) el.style.transform = ''
      }
    }
    s0.raf = requestAnimationFrame(tick)
  }

  return (
    <div
      ref={ref}
      className={s.card}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || reducedMotion()) return
        const r = e.currentTarget.getBoundingClientRect()
        const c = (v: number) => Math.max(-1, Math.min(1, v))
        st.current.tx = c(((e.clientX - r.left) / r.width) * 2 - 1)
        st.current.ty = c(((e.clientY - r.top) / r.height) * 2 - 1)
        e.currentTarget.setAttribute('data-hot', '')
        wake()
      }}
      onPointerLeave={(e) => {
        st.current.tx = st.current.ty = 0
        e.currentTarget.removeAttribute('data-hot')
        wake()
      }}
    >
      <img src={src} alt={alt} draggable={false} />
      <span aria-hidden className={s.foil} />
      <span aria-hidden className={s.band} />
    </div>
  )
}

export function MegaHolo() {
  return (
    <div className={cn(s.stage, 'grid h-full grid-cols-3 items-center gap-3 p-5 [perspective:1100px] sm:gap-5 sm:p-8')}>
      {CARDS.map((c) => (
        <HoloCard key={c.src} {...c} />
      ))}
    </div>
  )
}

const ABILITY = [
  { src: '/lab/mega-roll/ability-card-reaction.webp', title: 'Deflect', tag: 'reaction', body: 'When attacked, cancel 2 damage.' },
  { src: '/lab/mega-roll/ability-card-modifier.webp', title: 'Re-roll', tag: 'modifier', body: 'Re-roll any one die.' },
  { src: '/lab/mega-roll/ability-card-power.webp', title: 'Crushing blow', tag: 'power', body: 'Spend 3 power: deal 4+ additional damage.' },
]
const SIDE = ['translate(-96px, 20px) rotate(-14deg)', 'translate(96px, 20px) rotate(14deg)']

/** Hover to fan, tap a card to bring it forward, drag the top card up to play it. */
export function MegaFan() {
  const [order, setOrder] = useState([0, 1, 2])
  const [played, setPlayed] = useState('')
  const [armed, setArmed] = useState(false)
  const cards = useRef<(HTMLDivElement | null)[]>([])
  const drag = useRef<{ i: number; x: number; y: number; dx: number; dy: number; moved: boolean; id: number } | null>(null)
  const front = order[order.length - 1]

  const pose = (i: number) => {
    if (i === front) return 'translate(0,-14px) rotate(0) scale(1.04)'
    return SIDE[order.indexOf(i) === 0 ? 0 : 1]
  }
  const bring = (i: number) => setOrder((o) => o.filter((x) => x !== i).concat(i))

  const play = (i: number) => {
    const el = cards.current[i]
    const a = ABILITY[i]
    const settle = () => {
      setOrder((o) => [i, ...o.filter((x) => x !== i)])
      setPlayed(`${a.title} played · ${a.tag}`)
      setTimeout(() => setPlayed(''), 1800)
      if (el) {
        el.style.transition = 'none'
        el.style.opacity = '0'
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            el.style.transition = ''
            el.style.opacity = ''
          }),
        )
      }
    }
    if (!el || reducedMotion()) return settle()
    const d = drag.current
    el.animate(
      [
        { transform: el.style.transform, opacity: 1 },
        { transform: `translate(${(d?.dx ?? 0) * 1.3}px, ${(d?.dy ?? 0) - 240}px) scale(.7)`, opacity: 0 },
      ],
      { duration: 340, easing: 'cubic-bezier(.5,0,.75,0)' },
    ).onfinish = settle
  }

  return (
    <div className={cn(s.stage, 'relative h-full')}>
      <div
        className={s.fan}
        data-armed={armed || undefined}
        onPointerDown={(e) => {
          const t = (e.target as HTMLElement).closest('[data-i]') as HTMLElement | null
          if (!t || +t.dataset.i! !== front || e.button > 0) return
          drag.current = { i: front, x: e.clientX, y: e.clientY, dx: 0, dy: 0, moved: false, id: e.pointerId }
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d || e.pointerId !== d.id) return
          d.dx = e.clientX - d.x
          d.dy = e.clientY - d.y
          const el = cards.current[d.i]
          if (!d.moved && Math.hypot(d.dx, d.dy) > 6) {
            d.moved = true
            el?.setAttribute('data-dragging', '')
            try {
              el?.setPointerCapture(e.pointerId)
            } catch {}
          }
          if (d.moved && el) {
            el.style.transform = `translate(${d.dx}px, ${d.dy - 14}px) rotate(${d.dx * 0.06}deg) scale(1.06)`
            setArmed(d.dy < -90)
          }
        }}
        onPointerUp={(e) => {
          const d = drag.current
          if (!d || e.pointerId !== d.id) return
          const el = cards.current[d.i]
          el?.removeAttribute('data-dragging')
          setArmed(false)
          if (!d.moved) {
            drag.current = null
            return
          }
          if (d.dy < -90) play(d.i)
          else if (el) el.style.transform = pose(d.i)
          setTimeout(() => (drag.current = null), 0)
        }}
        onPointerCancel={() => {
          drag.current = null
          setArmed(false)
        }}
      >
        <span className={cn(s.armed, 't-label')}>Release to play</span>
        {ABILITY.map((a, i) => (
          <div
            key={a.src}
            ref={(el) => {
              cards.current[i] = el
            }}
            data-i={i}
            data-front={i === front || undefined}
            role="button"
            tabIndex={0}
            aria-label={`${a.title}, ${a.tag} card: ${a.body}${i === front ? ' Press Enter to play it.' : ''}`}
            className={s.acard}
            style={{ zIndex: order.indexOf(i) + 1, transform: pose(i) }}
            onClick={() => {
              if (drag.current?.moved) return
              if (i !== front) bring(i)
            }}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return
              e.preventDefault()
              if (i === front) play(i)
              else bring(i)
            }}
          >
            <img src={a.src} alt="" draggable={false} />
          </div>
        ))}
      </div>
      <p className="t-label absolute inset-x-0 bottom-4 text-center text-[#6b6458]" aria-live="polite">
        {played || 'Drag the top card up to play · tap to shuffle'}
      </p>
    </div>
  )
}

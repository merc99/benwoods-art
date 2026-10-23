// Ported from the Check-in handoff: components/foil-card/Foil.tsx (check-in-web, commit 558f14a).
// Pattern: 100K Club Premium UI Kit / holographic foil card, without the idle drift.
// benwoods.art: white sheen only (no brand hue), used on flagship tiles only (see .ux-profile.md).
'use client'

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import styles from './Foil.module.css'

export interface FoilProps {
  hue?: string
  tilt?: number
  strength?: number
  className?: string
  children: ReactNode
}

/**
 * With a mouse, the content tilts toward the pointer while a sheen and a glare move across it; on touch, a tap
 * plays one sweep. It never moves on its own. The pointer only writes --mx / --my; CSS draws everything.
 * Put <FoilLight /> inside a `relative overflow-hidden` element in the children.
 */
export function Foil({ hue = 'white', tilt, strength, className, children }: FoilProps) {
  const ref = useRef<HTMLDivElement>(null)

  const track = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)).toFixed(3))
    el.style.setProperty('--my', Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)).toFixed(3))
    el.setAttribute('data-active', '')
  }

  const leave = () => ref.current?.removeAttribute('data-active')

  const tap = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'touch') return
    const el = ref.current
    if (!el) return
    el.removeAttribute('data-shine')
    void el.offsetWidth
    el.setAttribute('data-shine', '')
  }

  const vars = {
    '--hue': hue,
    ...(tilt !== undefined && { '--tilt': tilt }),
    ...(strength !== undefined && { '--strength': strength }),
  } as CSSProperties

  return (
    <div
      ref={ref}
      className={cn(styles.foil, className)}
      style={vars}
      onPointerMove={track}
      onPointerLeave={leave}
      onPointerDown={tap}
      onAnimationEnd={(e) => {
        if (e.animationName.includes('shineGlare')) ref.current?.removeAttribute('data-shine')
      }}
    >
      <div className={styles.surface}>{children}</div>
    </div>
  )
}

export function FoilLight() {
  return (
    <>
      <span aria-hidden="true" className={styles.sheen} />
      <span aria-hidden="true" className={styles.glare} />
    </>
  )
}

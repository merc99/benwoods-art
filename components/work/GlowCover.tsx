'use client'
// A case-study cover whose linework lights up around the pointer. The art is light lines on near-black,
// so a brightened copy blended with `screen` only lifts the lines: one soft, blurred copy for the glow and
// one crisp copy for the bright core, both masked to a circle that follows the pointer on a soft lag, and a
// slow diagonal shimmer sweeping through that circle. On touch the glow follows a finger while it's down.
// Reduced motion: the glow still follows, but without the lag or the shimmer.
// Images are pre-sharpened WebP served as-is (the optimizer's AVIF smears fine linework).

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import styles from './GlowCover.module.css'

export function GlowCover({
  srcSet,
  src,
  width,
  height,
  alt,
  sizes,
  className,
}: {
  srcSet: string
  src: string
  width: number
  height: number
  alt: string
  sizes: string
  className?: string
}) {
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const st = { x: 0.5, y: 0.45, tx: 0.5, ty: 0.45, on: 0, ton: 0 }
    let raf = 0
    const tick = () => {
      const k = reduce ? 1 : 0.14
      st.x += (st.tx - st.x) * k
      st.y += (st.ty - st.y) * k
      st.on += (st.ton - st.on) * (reduce ? 1 : 0.08)
      el.style.setProperty('--mx', `${(st.x * 100).toFixed(2)}%`)
      el.style.setProperty('--my', `${(st.y * 100).toFixed(2)}%`)
      el.style.setProperty('--on', st.on.toFixed(3))
      const settled = Math.abs(st.tx - st.x) < 0.0005 && Math.abs(st.ty - st.y) < 0.0005 && Math.abs(st.ton - st.on) < 0.002
      raf = settled ? 0 : requestAnimationFrame(tick)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const at = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      st.tx = (e.clientX - r.left) / r.width
      st.ty = (e.clientY - r.top) / r.height
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.buttons === 0) return
      at(e)
      st.ton = 1
      kick()
    }
    const down = (e: PointerEvent) => {
      at(e)
      st.ton = 1
      kick()
    }
    const leave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || e.type === 'pointerup' || e.type === 'pointercancel') {
        st.ton = 0
        kick()
      }
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('pointerup', leave)
    el.addEventListener('pointercancel', leave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('pointerup', leave)
      el.removeEventListener('pointercancel', leave)
    }
  }, [])

  const img = (extra?: string, hidden = false) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      width={width}
      height={height}
      alt={hidden ? '' : alt}
      aria-hidden={hidden || undefined}
      draggable={false}
      decoding="async"
      fetchPriority={hidden ? undefined : 'high'}
      className={cn('select-none', extra)}
    />
  )

  return (
    <div ref={box} className={cn('relative touch-pan-y', styles.box)}>
      {img(className)}
      {/* the glow: a blurred, brightened copy; then the crisp bright core with the shimmer through it */}
      <div aria-hidden className={cn(styles.layer, styles.glow)}>
        {img('size-full', true)}
      </div>
      <div aria-hidden className={cn(styles.layer, styles.core)}>
        {img('size-full', true)}
      </div>
    </div>
  )
}

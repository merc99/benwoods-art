'use client'

import { useEffect, useRef } from 'react'

/** A short muted loop. Plays only while on screen, and never autoplays under reduced motion (controls instead). */
export function GalleryVideo({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.controls = true
      return
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.25 })
    io.observe(v)
    return () => io.disconnect()
  }, [])

  return <video ref={ref} src={src} aria-label={label} muted loop playsInline preload="metadata" className="h-auto w-full" />
}

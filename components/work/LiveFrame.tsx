'use client'
// A project's live site running inside the case-study cover frame. The site renders at a desktop viewport
// (1440 × 900) and is scaled to fit the frame, so it looks like the screenshot but you can click around it.
// It loads only on desktop with a mouse, once the frame is near the screen; until it has loaded (and on
// phones, where a scaled site is too small to use) the static cover shows underneath.

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

// the iframe is this much wider than what shows, so the site's own scrollbar sits outside the frame
const SCROLLBAR = 24

/** `width`: the desktop viewport the site renders at (its height follows at 16:10), e.g. wide enough for a full side panel. */
export function LiveFrame({ src, title, width = 1440 }: { src: string; title: string; width?: number }) {
  const VW = width
  const VH = Math.round((width * 10) / 16)
  const box = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    const el = box.current
    if (!el || !window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / VW))
    ro.observe(el)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => {
      ro.disconnect()
      io.disconnect()
    }
  }, [VW])

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden">
      {on && scale > 0 && (
        <iframe
          src={src}
          title={`${title}, the live site`}
          // reveal after the site's own intro has played, behind the matching still
          onLoad={() => window.setTimeout(() => setLoaded(true), 1400)}
          referrerPolicy="no-referrer"
          allow="clipboard-write"
          style={{ width: VW + SCROLLBAR, height: VH, transform: `scale(${scale})` }}
          className={cn('absolute top-0 left-0 origin-top-left border-0 transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0')}
        />
      )}
    </div>
  )
}

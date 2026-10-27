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
  // Scrolling over the frame scrolls the page natively (the site sits under a clear layer, so the wheel never
  // reaches it) until you click into the site; that click is passed straight through where the browser allows
  // it (the hosted MMO copy). Leaving the frame puts the layer back.
  const [active, setActive] = useState(false)
  const frameRef = useRef<HTMLIFrameElement>(null)
  /** Pass the activating click through to whatever sits under it inside a same-origin site. */
  const passClick = (e: React.PointerEvent) => {
    const f = frameRef.current
    let doc: Document | null = null
    try {
      doc = f?.contentDocument ?? null
    } catch {}
    if (!f || !doc) return
    const r = f.getBoundingClientRect()
    const target = doc.elementFromPoint((e.clientX - r.left) / scale, (e.clientY - r.top) / scale) as HTMLElement | null
    window.setTimeout(() => target?.click(), 0)
  }

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
    <div ref={box} className="absolute inset-0 overflow-hidden" onPointerLeave={() => setActive(false)}>
      {/* a clear layer keeps the wheel on the page until a click lets you into the site */}
      {loaded && !active && (
        <button
          type="button"
          aria-label={`Use the live ${title} site`}
          onPointerDown={(e) => {
            if (e.button !== 0) return
            setActive(true)
            passClick(e)
          }}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActive(true)}
          className="absolute inset-0 z-10 cursor-pointer bg-transparent"
        />
      )}
      {on && scale > 0 && (
        <iframe
          ref={frameRef}
          src={src}
          title={`${title}, the live site`}
          // Reveal once the site has settled behind the matching still. Same-origin sites (the hosted MMO copy): wait
          // for its fonts and until every finite animation (the intro) has finished. Cross-origin: a fixed wait.
          onLoad={(e) => {
            const frame = e.currentTarget
            let doc: Document | null = null
            try {
              doc = frame.contentDocument
            } catch {}
            if (!doc) return void window.setTimeout(() => setLoaded(true), 1400)
            const started = performance.now()
            const settled = () =>
              doc!.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity)
            const poll = () => {
              if ((settled() && performance.now() - started > 300) || performance.now() - started > 5000) setLoaded(true)
              else window.setTimeout(poll, 100)
            }
            void doc.fonts.ready.then(poll)
          }}
          referrerPolicy="no-referrer"
          allow="clipboard-write"
          style={{ width: VW + SCROLLBAR, height: VH, transform: `scale(${scale})` }}
          className={cn('absolute top-0 left-0 origin-top-left border-0 transition-opacity duration-[var(--dur-move)]', loaded ? 'opacity-100' : 'opacity-0')}
        />
      )}
    </div>
  )
}

'use client'
// The site's decode effect, shared by the wordmark and the Home hero line so they look and time the same: letter by
// letter, left to right, a faint glyph flickers briefly in each letter's place and the real letter fades in. Every
// letter keeps its own box (the glyph floats over it), so text never re-wraps or shifts; words stay unbreakable.
// `run` replays it when it changes (page change, hover). Screen readers get the plain text; reduced motion and no-JS
// show it still.

import { useEffect, useLayoutEffect, useRef } from 'react'

const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789'
const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** One timing for every decode on the site. */
export const DECODE = { delay: 380, duration: 850, window: 210 }

export function DecodeText({
  text,
  run = 0,
  delay = DECODE.delay,
  duration = DECODE.duration,
  srText = true,
  className,
}: {
  text: string
  /** Change this to replay. */
  run?: number | string
  delay?: number
  duration?: number
  /** Include a screen-reader copy (off where the parent already names it, e.g. a labelled link). */
  srText?: boolean
  className?: string
}) {
  const root = useRef<HTMLSpanElement>(null)

  useIso(() => {
    const el = root.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const chars = [...el.querySelectorAll<HTMLSpanElement>('[data-c]')]
    const real = chars.map((c) => c.firstElementChild as HTMLSpanElement)
    const glyphs = chars.map((c) => c.lastElementChild as HTMLSpanElement)
    real.forEach((r) => (r.style.opacity = '0'))
    glyphs.forEach((g) => (g.style.opacity = '0'))
    const n = chars.length
    const t0 = performance.now() + delay
    let raf = 0
    let lastSwap = 0
    const tick = (t: number) => {
      const swap = t - lastSwap > 60
      if (swap) lastSwap = t
      let done = true
      for (let i = 0; i < n; i++) {
        const start = t0 + (i / Math.max(1, n - 1)) * (duration - DECODE.window)
        if (t < start) {
          done = false
          continue
        }
        if (t < start + DECODE.window) {
          done = false
          if (swap) glyphs[i].textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0]
          glyphs[i].style.opacity = '0.35'
        } else if (real[i].style.opacity === '0') {
          glyphs[i].style.opacity = '0'
          real[i].style.opacity = '1'
        }
      }
      if (!done) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      real.forEach((r) => (r.style.opacity = ''))
      glyphs.forEach((g) => (g.style.opacity = '0'))
    }
  }, [text, run, delay, duration])

  const words = text.split(' ')
  return (
    <span ref={root} className={className}>
      {srText && <span className="sr-only">{text}</span>}
      <span aria-hidden="true">
        {words.map((w, wi) => (
          <span key={wi}>
            <span className="whitespace-nowrap">
              {[...w].map((ch, ci) => (
                <span key={ci} data-c className="relative">
                  <span className="transition-opacity duration-[var(--dur-fade)] ease-out">{ch}</span>
                  <span className="pointer-events-none absolute top-0 left-0 opacity-0">{ch}</span>
                </span>
              ))}
            </span>
            {wi < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </span>
  )
}

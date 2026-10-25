'use client'
// The hero line decodes on load, gently: letter by letter, left to right, a faint glyph flickers briefly in each
// letter's place and the real letter fades in. Every letter keeps its own box (the glyphs float over it), so the
// line never re-wraps or shifts. Words stay unbreakable. Screen readers get the plain line; reduced motion and
// no-JS show it still.

import { useEffect, useLayoutEffect, useRef } from 'react'

const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789'
const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function LedeScramble({ text, delay = 420, duration = 1100 }: { text: string; delay?: number; duration?: number }) {
  const root = useRef<HTMLSpanElement>(null)

  useIso(() => {
    const el = root.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const chars = [...el.querySelectorAll<HTMLSpanElement>('[data-c]')]
    const glyphs = chars.map((c) => c.lastElementChild as HTMLSpanElement)
    const real = chars.map((c) => c.firstElementChild as HTMLSpanElement)
    real.forEach((r) => (r.style.opacity = '0'))
    const n = chars.length
    const WINDOW = 260 // ms each letter flickers before it settles
    const t0 = performance.now() + delay
    let raf = 0
    let lastSwap = 0
    const tick = (t: number) => {
      const swap = t - lastSwap > 70
      if (swap) lastSwap = t
      let done = true
      for (let i = 0; i < n; i++) {
        const start = t0 + (i / n) * (duration - WINDOW)
        const settle = start + WINDOW
        if (t < start) {
          done = false
          continue
        }
        if (t < settle) {
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
  }, [text, delay, duration])

  const words = text.split(' ')
  return (
    <span ref={root} className="block">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, wi) => (
          <span key={wi}>
            <span className="whitespace-nowrap">
              {[...w].map((ch, ci) => (
                <span key={ci} data-c className="relative">
                  <span className="transition-opacity duration-300 ease-out">{ch}</span>
                  <span className="pointer-events-none absolute top-0 left-0 opacity-0 text-fg-2">{ch}</span>
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

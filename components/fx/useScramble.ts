'use client'

import { useCallback, useEffect, useRef } from 'react'

const GLYPHS = '!#$%&*+<>?@=/\\|~^[]{}0123456789abcdefghijklmnopqrstuvwxyz'

/**
 * Decodes `text` into a target element: random glyphs that settle left to right.
 * Writes straight to the DOM (no React state per frame). Under reduced motion it does nothing,
 * so the server-rendered text simply stays.
 */
export function useScramble(text: string, { duration = 760, step = 42 } = {}) {
  const ref = useRef<HTMLSpanElement>(null)
  const raf = useRef(0)

  const play = useCallback(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    cancelAnimationFrame(raf.current)
    const start = performance.now()
    let lastSwap = 0
    const n = text.length
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      if (t - lastSwap >= step || p === 1) {
        lastSwap = t
        let out = ''
        for (let i = 0; i < n; i++) {
          const ch = text[i]
          const settleAt = 0.25 + (i / n) * 0.75
          out += ch === ' ' || p >= settleAt ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]
        }
        // Rewrite the existing text node in place: replacing it would register each frame as a new paint (and LCP).
        const node = el.firstChild
        if (node && node.nodeType === Node.TEXT_NODE) (node as Text).data = out
        else el.textContent = out
      }
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }, [text, duration, step])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  return { ref, play }
}

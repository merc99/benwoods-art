'use client'
// The hero line decodes on load like the wordmark: random glyphs that settle left to right. An invisible copy of
// the line holds the layout, so the page never shifts while the glyphs change widths; the decoding copy sits on
// top of it. Screen readers get the plain line. Reduced motion: the line just shows.

import { useEffect } from 'react'
import { useScramble } from '@/components/fx/useScramble'

export function LedeScramble({ text, delay = 380 }: { text: string; delay?: number }) {
  const { ref, play } = useScramble(text, { duration: 1300, step: 40 })
  useEffect(() => {
    const t = window.setTimeout(play, delay)
    return () => clearTimeout(t)
  }, [play, delay])
  return (
    <span className="relative block">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="invisible block">
        {text}
      </span>
      <span ref={ref} aria-hidden="true" className="absolute inset-0 block">
        {text}
      </span>
    </span>
  )
}

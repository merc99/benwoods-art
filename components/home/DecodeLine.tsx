'use client'

import { useEffect } from 'react'
import { useScramble } from '@/components/fx/useScramble'

/** A mono line that decodes once after the hero name has risen (part of the hero moment). */
export function DecodeLine({ text, className }: { text: string; className?: string }) {
  const { ref, play } = useScramble(text, { duration: 1100, step: 50 })
  useEffect(() => {
    const t = setTimeout(play, 450)
    return () => clearTimeout(t)
  }, [play])
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden>
        {text}
      </span>
    </span>
  )
}

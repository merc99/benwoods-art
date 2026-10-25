'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useScramble } from '@/components/fx/useScramble'
import { cn } from '@/lib/cn'

/** The pixel "ben woods" wordmark. Decodes on every page and again on mouse hover (motion budget: moment). */
export function Wordmark({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const text = 'ben woods'
  const { ref, play } = useScramble(text)

  const pathname = usePathname()
  useEffect(() => {
    play()
  }, [play, pathname])

  return (
    <Link
      href="/"
      aria-label="Ben Woods"
      onClick={onNavigate}
      onPointerEnter={(e) => e.pointerType === 'mouse' && play()}
      // keyboard focus only (a click or a page change also focuses the link)
      onFocus={(e) => e.currentTarget.matches(':focus-visible') && play()}
      className={cn('relative inline-flex h-11 items-center font-pixel leading-none', className)}
    >
      {/* The invisible copy holds the width so the scramble never shifts the layout. */}
      <span aria-hidden="true" className="invisible whitespace-pre">
        {text}
      </span>
      <span ref={ref} aria-hidden="true" className="absolute inset-y-0 left-0 flex items-center whitespace-pre">
        {text}
      </span>
    </Link>
  )
}

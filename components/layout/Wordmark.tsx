'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { DecodeText } from '@/components/fx/DecodeText'
import { cn } from '@/lib/cn'

/**
 * The pixel "ben woods" wordmark. Decodes on every page and again on mouse hover or keyboard focus, with the site's
 * shared decode effect (the same timing and look as the Home hero line, so on Home they play together).
 */
export function Wordmark({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname()
  const [hover, setHover] = useState(0)

  return (
    <Link
      href="/"
      aria-label="Ben Woods"
      onClick={onNavigate}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover((h) => h + 1)}
      // keyboard focus only (a click or a page change also focuses the link)
      onFocus={(e) => e.currentTarget.matches(':focus-visible') && setHover((h) => h + 1)}
      className={cn('relative inline-flex h-11 items-center font-pixel leading-none whitespace-pre', className)}
    >
      {/* replays on page change (pathname) and on hover/focus (counter); hover plays without the load delay */}
      <DecodeText text="ben woods" srText={false} run={`${pathname}-${hover}`} delay={hover ? 0 : undefined} />
    </Link>
  )
}

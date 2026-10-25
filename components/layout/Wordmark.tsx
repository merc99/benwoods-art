'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DecodeText } from '@/components/fx/DecodeText'
import { cn } from '@/lib/cn'

/**
 * The pixel "ben woods" wordmark. Decodes on every page and again on mouse hover or keyboard focus, with the site's
 * shared decode effect (the same timing and look as the Home hero line).
 *
 * `compactOnHero` (the header): on Home, while the big BEN WOODS is on screen, it shows just the "b." mark (the
 * favicon's pixel b and signal dot); once you scroll past the name it decodes to the full "ben woods", and goes back
 * to "b." when the name comes back into view.
 */
export function Wordmark({ className, onNavigate, compactOnHero = false }: { className?: string; onNavigate?: () => void; compactOnHero?: boolean }) {
  const pathname = usePathname()
  const [hover, setHover] = useState(0)
  const home = compactOnHero && pathname === '/'
  // start compact on Home so the first paint already shows "b." (no flash of the full name)
  const [nameInView, setNameInView] = useState(home)

  useEffect(() => {
    if (!home) return
    const name = document.getElementById('hero-title')
    if (!name) return
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64
    // the name counts as passed once its last line has gone up under the header
    const io = new IntersectionObserver(([e]) => setNameInView(e.isIntersecting), { rootMargin: `-${header}px 0px 0px 0px` })
    io.observe(name)
    return () => io.disconnect()
  }, [home])

  const compact = home && nameInView

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
      {compact ? (
        <span aria-hidden="true" className="animate-[wm-in_300ms_ease-out_both] motion-reduce:animate-none">
          b<span className="text-signal">.</span>
        </span>
      ) : (
        // replays on page change, on hover/focus, and when it opens out from "b." (that one without the load delay)
        <DecodeText text="ben woods" srText={false} run={`${pathname}-${hover}-${home ? 'open' : ''}`} delay={hover || home ? 0 : undefined} />
      )}
    </Link>
  )
}

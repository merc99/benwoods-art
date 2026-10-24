'use client'
// Merc peeks up from the bottom right of the footer's contact block once you reach it, and ducks back
// down when you scroll away. A "Meet Merc" bubble shows briefly when he arrives and again on hover or
// focus. He links to his page, so he stays hidden on it. Reduced motion: he fades in and out instead.

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

export function MercPeek() {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)
  const [up, setUp] = useState(false)
  const [hello, setHello] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // the slot he rises into: count it reached once most of it is on screen (its bottom 14px sits under the clip edge, so a hover lift never shows his cut-off base)
    const io = new IntersectionObserver(([e]) => setUp(e.isIntersecting), { threshold: 0.75 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // say hi once he's up, then let the bubble go (hover or focus brings it back)
  useEffect(() => {
    if (!up) return
    const show = window.setTimeout(() => setHello(true), 550)
    const hide = window.setTimeout(() => setHello(false), 3200)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [up])

  if (pathname === '/work/merc-eats') return null

  return (
    <div ref={ref} className="absolute right-[var(--gutter)] -bottom-3.5 w-[76px] sm:w-[118px] lg:w-[164px]">
      <Link
        href="/work/merc-eats"
        aria-label="Meet Merc, my cat"
        tabIndex={up ? 0 : -1}
        className={cn(
          'group relative block outline-none',
          'transition-[translate,opacity] duration-700 ease-[cubic-bezier(0.34,1.45,0.64,1)] motion-reduce:translate-y-0 motion-reduce:duration-300 motion-reduce:ease-out',
          up ? 'translate-y-0 opacity-100' : 'translate-y-[105%] opacity-0 motion-reduce:opacity-0',
        )}
      >
        <span
          aria-hidden
          className={cn(
            't-label pointer-events-none absolute top-[14%] right-[92%] rounded-full bg-[#f4ecdc] px-3 py-1.5 whitespace-nowrap text-[#0f0f0e] shadow-[var(--shadow-float)]',
            'origin-right transition-[opacity,scale] duration-300 ease-out motion-reduce:transition-none',
            'group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100',
            up && hello ? 'scale-100 opacity-100' : 'scale-90 opacity-0',
          )}
        >
          Meet Merc →
        </span>
        <Image
          src="/merc/peek.webp"
          alt=""
          width={520}
          height={550}
          sizes="(min-width: 1024px) 164px, (min-width: 640px) 118px, 76px"
          quality={90}
          className="h-auto w-full origin-bottom transition-transform duration-300 ease-out group-hover:-translate-y-1.5 group-hover:-rotate-2 group-focus-visible:-translate-y-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:rotate-0"
        />
        <span aria-hidden className="pointer-events-none absolute inset-x-2 -bottom-1 hidden h-1 rounded-full bg-fg group-focus-visible:block" />
      </Link>
    </div>
  )
}

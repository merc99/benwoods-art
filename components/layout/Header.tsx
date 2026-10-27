'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { nav } from '@/lib/site'
import { cn } from '@/lib/cn'
import { Menu } from './Menu'
import { ThemeToggle } from './ThemeToggle'
import { Wordmark } from './Wordmark'
import { Button } from '@/components/ui/Button'

export function Header() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const pathname = usePathname()
  // past the top of the page: collapse the wordmark and offer the email pill
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 260)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [pathname])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-rule bg-bg">
        <div className="shell flex h-[var(--header-h)] items-center justify-between gap-4">
          <Wordmark compactOnHero className="text-[28px] lg:text-[32px]" />

          <div className="flex items-center gap-1 sm:gap-2">
            {/* appears once you scroll past the top; collapses to no width when hidden, so it leaves no gap */}
            <div
              className={cn(
                'hidden overflow-hidden transition-[max-width,opacity] duration-[var(--dur-glide)] ease-glide motion-reduce:transition-none md:block',
                scrolled ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0',
              )}
            >
              <Button variant="signal" size="sm" href="/about#contact" tabIndex={scrolled ? 0 : -1} aria-hidden={!scrolled} className="mr-2">
                Contact <span aria-hidden>→</span>
              </Button>
            </div>
            <nav aria-label="Primary" className="mr-2 hidden md:block">
              <ul className="flex items-center">
                {nav.slice(1).map((item) => {
                  const current = pathname.startsWith(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={current ? 'page' : undefined}
                        className={cn(
                          't-label relative inline-flex h-11 items-center gap-2 px-3 transition-colors duration-[var(--dur-chrome)]',
                          current ? 'text-fg' : 'text-fg-2 hover:text-fg',
                        )}
                      >
                        {current && <span className="size-1.5 rounded-full bg-signal" aria-hidden />}
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <ThemeToggle />
            <Button onClick={() => setOpen(true)} aria-expanded={open} aria-haspopup="dialog">
              <span aria-hidden className="flex flex-col gap-[3px]">
                <span className="block h-px w-3.5 bg-current" />
                <span className="block h-px w-3.5 bg-current" />
              </span>
              Menu
            </Button>
          </div>
        </div>
      </header>
      <Menu open={open} onClose={close} />
    </>
  )
}

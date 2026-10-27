'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { links, nav, site, ticker } from '@/lib/site'
import { Clock } from './Clock'
import { ThemeToggle } from './ThemeToggle'
import styles from './Menu.module.css'
import { Button } from '@/components/ui/Button'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * The slide-out menu: marquee ticker, big type links, dashed grid lines. Always on the ink surface.
 * Traps focus while open, closes on Escape or the backdrop, and returns focus to the Menu button.
 */
export function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const root = document.documentElement
    const prevOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    const first = panel.current?.querySelector<HTMLElement>('[data-autofocus]')
    first?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel.current) return
      const items = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (!items.length) return
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      root.style.overflow = prevOverflow
      opener?.focus()
    }
  }, [open, onClose])

  const slide = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close menu"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-[rgb(10_10_9/0.55)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          />
          <motion.div
            ref={panel}
            data-surface="ink"
            {...slide}
            transition={{ duration: reduce ? 0.15 : 0.5, ease: EASE }}
            className="absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto shadow-[var(--shadow-float)] md:w-[min(760px,64vw)]"
          >
            {/* dashed grid */}
            <div aria-hidden className="pointer-events-none absolute inset-0 grid grid-cols-4 px-[var(--gutter)]">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="dash-v h-full" />
              ))}
            </div>
            <div aria-hidden className="dash-v pointer-events-none absolute inset-y-0 right-[var(--gutter)] w-px" />

            {/* top bar: ticker + close */}
            <div className="relative flex h-[var(--header-h)] items-center gap-3 border-b border-rule px-[var(--gutter)]">
              <div className={`${styles.ticker} t-label min-w-0 flex-1 text-fg-2`} aria-hidden>
                <div className={styles.track}>
                  {[0, 1].map((k) => (
                    <span key={k} className="flex shrink-0 items-center">
                      {ticker.map((t) => (
                        <span key={t} className="flex items-center">
                          <span className="px-3">{t}</span>
                          <span className="text-signal">✦</span>
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
              </div>
              <Button variant="outline" onClick={onClose} data-autofocus>
                Close <X className="size-4" strokeWidth={1.5} aria-hidden />
              </Button>
            </div>

            {/* big links */}
            <nav aria-label="Main" className="relative flex-1 px-[var(--gutter)] py-6">
              <ul>
                {nav.map((item, i) => {
                  const current = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
                  return (
                    <motion.li
                      key={item.href}
                      className="rule-dash-b"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, delay: reduce ? 0 : 0.12 + i * 0.05, ease: EASE }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={current ? 'page' : undefined}
                        className="group flex items-baseline gap-4 py-3 sm:gap-6"
                      >
                        <span className="t-label w-8 shrink-0 text-fg-3">{String(i + 1).padStart(2, '0')}</span>
                        <span className="t-heading text-[clamp(2.75rem,1.6rem+5.5vw,5.75rem)] transition-transform duration-[var(--dur-fade)] ease-out group-hover:translate-x-2">
                          {item.label}
                        </span>
                        {current && <span className="mb-[0.6em] size-2 shrink-0 self-end rounded-full bg-signal" aria-hidden />}
                      </Link>
                    </motion.li>
                  )
                })}
              </ul>
            </nav>

            {/* links + meta */}
            <div className="relative border-t border-rule px-[var(--gutter)] py-5">
              <ul className="grid grid-cols-2 gap-x-4 sm:grid-cols-4">
                {links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      {...(l.href.startsWith('http') && { target: '_blank', rel: 'noreferrer' })}
                      className="t-label inline-flex h-11 items-center gap-1 text-fg-2 hover:text-fg"
                    >
                      {l.label} <span aria-hidden>↗</span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="t-label mt-3 flex items-center justify-between gap-3 text-fg-3">
                <span>
                  {site.hero.location} · <Clock />
                </span>
                <ThemeToggle className="-mr-3" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

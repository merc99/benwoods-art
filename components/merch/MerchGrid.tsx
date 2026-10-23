'use client'
// Merch photo grid with a lightbox: click a photo for a larger view; arrow keys, swipe or the buttons move
// between photos, Escape closes. Focus stays in the lightbox and returns to the photo you opened.

import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { MerchItem } from '@/lib/merch'

const caption = (m: MerchItem) => [m.item, m.brand, m.year].filter(Boolean).join(' · ')

export function MerchGrid({ items }: { items: MerchItem[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const reduce = useReducedMotion()
  const thumbs = useRef<(HTMLButtonElement | null)[]>([])
  const dialog = useRef<HTMLDivElement>(null)
  const swipe = useRef<{ x: number; id: number } | null>(null)

  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length])

  useEffect(() => {
    if (open === null) return
    const opener = thumbs.current[open]
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    dialog.current?.querySelector<HTMLElement>('[data-close]')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Tab' && dialog.current) {
        const f = dialog.current.querySelectorAll<HTMLElement>('button')
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      root.style.overflow = prev
      opener?.focus()
    }
    // re-run only when the lightbox opens or closes, not on every photo change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open === null, go])

  const current = open === null ? null : items[open]

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {items.map((m, i) => (
          <li key={m.slug}>
            <button
              ref={(el) => {
                thumbs.current[i] = el
              }}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`${caption(m)}: ${m.alt}. View larger`}
              className="group block w-full text-left"
            >
              <span className="relative block aspect-[5/4] overflow-hidden bg-sunken">
                <Image
                  src={m.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <span aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-rule ring-inset" />
              </span>
              <span className="t-label mt-3 block text-fg-2">{caption(m)}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* portal: sections use `isolate`, which would trap a fixed overlay under the sticky header */}
      {open !== null &&
        createPortal(
      <AnimatePresence>
        {current && (
          <motion.div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-label={`Photo ${open + 1} of ${items.length}`}
            data-surface="ink"
            className="fixed inset-0 z-[70] flex flex-col bg-[rgb(10_10_9/0.96)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.18 }}
            onPointerDown={(e) => (swipe.current = { x: e.clientX, id: e.pointerId })}
            onPointerUp={(e) => {
              const s = swipe.current
              swipe.current = null
              if (!s || s.id !== e.pointerId) return
              const dx = e.clientX - s.x
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
            }}
          >
            <div className="t-label flex items-center justify-between px-[var(--gutter)] py-3 text-fg-2">
              <span>
                {String(open + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </span>
              <button
                type="button"
                data-close
                onClick={() => setOpen(null)}
                className="inline-flex h-11 items-center gap-2 border border-rule-strong px-4 text-fg hover:bg-fg hover:text-bg"
              >
                Close <X className="size-4" strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            <div className="relative min-h-0 flex-1 touch-pan-y">
              <Image key={current.src} src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
            </div>
            <div className="flex items-center justify-between gap-4 px-[var(--gutter)] py-4">
              <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="grid size-11 place-items-center border border-rule-strong text-fg hover:bg-fg hover:text-bg">
                <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
              </button>
              <p className="t-label text-center text-fg-2" aria-live="polite">
                {caption(current)}
              </p>
              <button type="button" onClick={() => go(1)} aria-label="Next photo" className="grid size-11 place-items-center border border-rule-strong text-fg hover:bg-fg hover:text-bg">
                <ChevronRight className="size-5" strokeWidth={1.5} aria-hidden />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
          document.body,
        )}
    </>
  )
}

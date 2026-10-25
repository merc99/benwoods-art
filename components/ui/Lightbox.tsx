'use client'
// Full-screen photo viewer (moved out of MerchGrid unchanged so galleries can share it): arrow keys, swipe
// or the buttons move between photos, Escape or a click outside the photo closes. Focus stays inside and
// returns to whatever opened it.

import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export type LightboxItem = { src: string; alt: string; caption: string }

export function Lightbox({
  items,
  open,
  onChange,
  opener,
}: {
  items: LightboxItem[]
  /** Index of the photo shown, or null when closed. */
  open: number | null
  onChange: (i: number | null) => void
  /** The element to return focus to on close (read when the lightbox opens). */
  opener: () => HTMLElement | null | undefined
}) {
  const reduce = useReducedMotion()
  const dialog = useRef<HTMLDivElement>(null)
  const swipe = useRef<{ x: number; id: number } | null>(null)
  const swiped = useRef(false) // a swipe just changed photo: don't treat its click as a backdrop click
  const photo = useRef<HTMLDivElement>(null)

  const go = useCallback((d: number) => onChange(open === null ? open : (open + d + items.length) % items.length), [items.length, onChange, open])
  const goRef = useRef(go)
  useEffect(() => {
    goRef.current = go
  }, [go])

  useEffect(() => {
    if (open === null) return
    const back = opener()
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    dialog.current?.querySelector<HTMLElement>('[data-close]')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange(null)
      else if (e.key === 'ArrowRight') goRef.current(1)
      else if (e.key === 'ArrowLeft') goRef.current(-1)
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
      back?.focus()
    }
    // re-run only when the lightbox opens or closes, not on every photo change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open === null])

  const current = open === null ? null : items[open]
  if (open === null) return null

  // portal: sections use `isolate`, which would trap a fixed overlay under the sticky header
  return createPortal(
    <AnimatePresence>
      {current && (
        <motion.div
          ref={dialog}
          role="dialog"
          data-no-fade
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
            swiped.current = Math.abs(dx) > 50
            if (swiped.current) go(dx < 0 ? 1 : -1)
          }}
          onClick={(e) => {
            // close on any click outside the photo itself (backdrop, letterbox, empty bar space); buttons keep working
            if (swiped.current) return void (swiped.current = false)
            if ((e.target as HTMLElement).closest('button')) return
            const box = photo.current?.getBoundingClientRect()
            const img = photo.current?.querySelector('img')
            if (box && img?.naturalWidth) {
              // where object-contain actually draws the image inside its box
              const scale = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight)
              const w = img.naturalWidth * scale
              const h = img.naturalHeight * scale
              const l = box.left + (box.width - w) / 2
              const t = box.top + (box.height - h) / 2
              if (e.clientX >= l && e.clientX <= l + w && e.clientY >= t && e.clientY <= t + h) return
            }
            onChange(null)
          }}
        >
          <div className="t-label flex items-center justify-between px-[var(--gutter)] py-3 text-fg-2">
            <span>
              {String(open + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              data-close
              onClick={() => onChange(null)}
              className="inline-flex h-11 items-center gap-2 border border-rule-strong px-4 text-fg hover:bg-fg hover:text-bg"
            >
              Close <X className="size-4" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
          <div ref={photo} className="relative min-h-0 flex-1 touch-pan-y">
            <Image key={current.src} src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
          </div>
          <div className="flex items-center justify-between gap-4 px-[var(--gutter)] py-4">
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="grid size-11 place-items-center border border-rule-strong text-fg hover:bg-fg hover:text-bg">
              <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
            </button>
            <p className="t-label text-center text-fg-2" aria-live="polite">
              {current.caption}
            </p>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className="grid size-11 place-items-center border border-rule-strong text-fg hover:bg-fg hover:text-bg">
              <ChevronRight className="size-5" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

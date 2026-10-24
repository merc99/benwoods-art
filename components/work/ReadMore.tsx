'use client'
// Below lg, a long block of story text folds to its first ~10 lines with a soft fade and a "Read more"
// button, so phones show the work before a wall of words. Short blocks and desktop are untouched.
// The whole text stays in the page (search engines and screen readers get all of it).

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

export function ReadMore({ children, className }: { children: React.ReactNode; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const [long, setLong] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const mq = window.matchMedia('(min-width: 1024px)')
    // fold only when the text runs well past the fold height (no button for a line or two). Measured
    // against the fold itself, so the button stays once the text is opened.
    const fold = parseFloat(getComputedStyle(document.documentElement).fontSize) * 18
    const check = () => setLong(!mq.matches && el.scrollHeight > fold + 80)
    const ro = new ResizeObserver(check)
    ro.observe(el)
    mq.addEventListener('change', check)
    check()
    return () => {
      ro.disconnect()
      mq.removeEventListener('change', check)
    }
  }, [])

  return (
    <div className={className}>
      <div
        ref={box}
        className={cn(
          // folds only once the text is known to be long, so a short block is never cut without a button
          !open && long && 'max-lg:max-h-[18rem] max-lg:overflow-hidden max-lg:[mask-image:linear-gradient(to_bottom,black_70%,transparent)]',
        )}
      >
        {children}
      </div>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="hit-44 t-label mt-4 inline-flex h-9 items-center gap-2 text-fg underline decoration-rule-strong underline-offset-4 hover:decoration-fg lg:hidden"
        >
          {open ? 'Show less' : 'Read more'} <span aria-hidden>{open ? '↑' : '↓'}</span>
        </button>
      )}
    </div>
  )
}

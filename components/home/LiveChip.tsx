'use client'
// A small "live" chip over a product frame that cycles through a few activity lines, like the product is
// running. Only cycles while on screen; reduced motion shows the first line, still.

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

export function LiveChip({ lines, every = 3400, className }: { lines: string[]; every?: number; className?: string }) {
  const [i, setI] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || lines.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let t = 0
    const io = new IntersectionObserver(([e]) => {
      clearInterval(t)
      if (e.isIntersecting) t = window.setInterval(() => setI((n) => (n + 1) % lines.length), every)
    })
    io.observe(el)
    return () => {
      clearInterval(t)
      io.disconnect()
    }
  }, [lines.length, every])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute z-10 flex items-center gap-2.5 rounded-full border border-white/[0.14] bg-[rgb(18_18_17/0.92)] py-2 pr-4 pl-3 text-[13px] text-[#f4ecdc] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.7)] backdrop-blur-md',
        className,
      )}
    >
      <span className="relative grid size-2 place-items-center">
        <span className="absolute size-2 animate-ping rounded-full bg-[#3ddc97]/60 motion-reduce:hidden" />
        <span className="size-1.5 rounded-full bg-[#3ddc97]" />
      </span>
      {/* stacked lines; the current one rises in, the last one rises out */}
      <span className="relative grid">
        {lines.map((l, n) => (
          <span
            key={l}
            className={cn(
              'col-start-1 row-start-1 whitespace-nowrap transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)]',
              // the old line leaves quickly, the new one arrives after it, so they never show on top of each other
              n === i ? 'translate-y-0 opacity-100 delay-150 duration-500' : n === (i - 1 + lines.length) % lines.length ? '-translate-y-2 opacity-0 duration-150' : 'translate-y-2 opacity-0 duration-0',
            )}
          >
            {l}
          </span>
        ))}
      </span>
    </div>
  )
}

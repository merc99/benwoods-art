'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Mounts its children only once the box comes within `margin` of the viewport (heavy demos, WebGL). */
export function LazyMount({ children, margin = '300px', className }: { children: ReactNode; margin?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [margin])

  return (
    <div ref={ref} className={className}>
      {on ? children : <div className="t-label grid h-full place-items-center text-fg-3">Loading demo</div>}
    </div>
  )
}

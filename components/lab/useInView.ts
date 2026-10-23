'use client'

import { useEffect, useState, type RefObject } from 'react'

/** True while the element is on screen and the tab is visible. Loops in demos pause otherwise. */
export function useInView(ref: RefObject<Element | null>) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let onScreen = false
    const update = () => setVisible(onScreen && !document.hidden)
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting
      update()
    })
    io.observe(el)
    document.addEventListener('visibilitychange', update)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [ref])
  return visible
}

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

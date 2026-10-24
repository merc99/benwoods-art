'use client'

import { useEffect, useRef, type ElementType } from 'react'
import styles from './RevealText.module.css'

/**
 * A quick fade-in (200ms) the first time text scrolls into view. Text already on screen at load is left alone,
 * and reduced motion skips it entirely, so nothing ever waits on JavaScript to be readable.
 */
export function RevealText({ text, as: Tag = 'span', className, id }: { text: string; as?: ElementType; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return
    el.dataset.reveal = 'armed'
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.dataset.reveal = 'shown'
        io.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag ref={ref} id={id} className={[styles.reveal, className].filter(Boolean).join(' ')}>
      {text}
    </Tag>
  )
}

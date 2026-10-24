'use client'

import { Fragment, useEffect, useRef, type ElementType } from 'react'
import styles from './RevealText.module.css'

/**
 * Words settle in from a soft blur, one after another, when the text first scrolls into view.
 * Text already on screen at load is left alone (no flash), and reduced motion skips it entirely.
 * The words stay real text separated by spaces, so screen readers read the line normally.
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
      { rootMargin: '0px 0px -12% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const words = text.split(' ')
  return (
    <Tag ref={ref} id={id} className={[styles.reveal, className].filter(Boolean).join(' ')}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className={styles.word} style={{ '--i': Math.min(i, 24) } as React.CSSProperties}>
            {w}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </Tag>
  )
}

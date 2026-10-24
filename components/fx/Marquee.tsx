import { Fragment } from 'react'
import { cn } from '@/lib/cn'

/**
 * A continuous marquee: the items twice in a row, sliding by exactly one copy so the loop is seamless.
 * Pauses on hover; with reduced motion it sits still (and the second copy is hidden).
 * The visible copy is for screen readers too (`label`); the duplicate is aria-hidden.
 */
export function Marquee({
  items,
  label,
  seconds = 40,
  className,
  itemClassName,
  separator = '✦',
}: {
  items: string[]
  label: string
  seconds?: number
  className?: string
  itemClassName?: string
  separator?: string
}) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} aria-label={hidden ? undefined : label} className={cn('flex shrink-0 items-center', hidden && 'motion-reduce:hidden')}>
      {items.map((t, i) => (
        <Fragment key={`${t}-${i}`}>
          <li className={cn('shrink-0 whitespace-nowrap px-6', itemClassName)}>{t}</li>
          <li aria-hidden className="shrink-0 text-signal">
            {separator}
          </li>
        </Fragment>
      ))}
    </ul>
  )
  return (
    <div className={cn('marquee group flex overflow-hidden', className)} style={{ ['--marquee-s' as string]: `${seconds}s` }}>
      <div className="marquee-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}

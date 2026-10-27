import { cn } from '@/lib/cn'

/**
 * The card frame used across the site: one dark bezel with rounded corners around the content, lifted by a
 * layered drop shadow that sits mostly below it (soft and warm on cream, deep on dark; --frame-shadow in
 * globals.css). Inside a `group` link or button it lifts 4px on hover on a slow soft ease and a deeper shadow
 * fades in; only transform and opacity animate, so the shadow never repaints per frame.
 *
 * The child is the "screen": give it `relative overflow-hidden` and the inner radius from `screenRadius`.
 */
export const bezelRadius = {
  wide: { outer: 'rounded-[16px] md:rounded-[22px]', inner: 'rounded-[10px] md:rounded-[14px]' },
  half: { outer: 'rounded-[16px]', inner: 'rounded-[10px]' },
  small: { outer: 'rounded-[12px]', inner: 'rounded-[7px]' },
} as const

export function Bezel({
  size = 'half',
  className,
  children,
}: {
  size?: keyof typeof bezelRadius
  className?: string
  children: React.ReactNode
}) {
  const radius = bezelRadius[size].outer
  const ease = 'duration-[var(--dur-settle)] ease-glide'
  return (
    <div
      className={cn(
        'relative isolate transition-transform [backface-visibility:hidden] [will-change:translate] group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0',
        ease,
        className,
      )}
    >
      {/* resting shadow: mostly below the frame, little spread to the sides */}
      <span aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10 shadow-[var(--frame-shadow)]', radius)} />
      {/* hover shadow: deeper, fades in (opacity only) */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 opacity-0 shadow-[var(--frame-shadow-hover)] transition-opacity group-hover:opacity-100 motion-reduce:transition-none',
          ease,
          radius,
        )}
      />
      <div className={cn('relative border border-[#262624] bg-[#161615]', size === 'small' ? 'p-1 md:p-1.5' : 'p-1.5 md:p-2', radius)}>{children}</div>
    </div>
  )
}

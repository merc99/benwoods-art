import Image from 'next/image'
import { cn } from '@/lib/cn'

/**
 * A product screenshot in a complete device frame: one dark bezel with the screen inside, lifted by a
 * layered drop shadow that sits mostly below it (soft and warm on cream, deep on dark; --frame-shadow in
 * globals.css). No fade: soft fades into near-black band.
 * Inside a `group` link it lifts 4px on hover on a slow soft ease, and a deeper shadow fades in; only
 * transform and opacity animate, so the shadow never repaints per frame.
 */
export function DeviceFrame({
  src,
  alt,
  size = 'wide',
  aspect,
  priority = false,
  sizes,
  className,
  children,
}: {
  src: string
  alt: string
  /** 'half' for two-per-row cards: smaller corners. */
  size?: 'wide' | 'half'
  /** Screen aspect. Defaults to 16:10, and 16:9 from md for wide frames. */
  aspect?: string
  priority?: boolean
  sizes: string
  className?: string
  /** Overlays that ride along with the frame (e.g. a live chip). */
  children?: React.ReactNode
}) {
  const radius = size === 'half' ? 'rounded-[16px]' : 'rounded-[16px] md:rounded-[22px]'
  const screen = aspect ?? (size === 'half' ? 'aspect-[16/10] rounded-[10px]' : 'aspect-[16/10] rounded-[10px] md:aspect-[16/9] md:rounded-[14px]')
  const ease = 'duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
  return (
    <div
      className={cn(
        'relative isolate transition-transform group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0',
        ease,
        className,
      )}
    >
      {/* resting shadow: mostly below the frame, little spread to the sides */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 shadow-[var(--frame-shadow)]',
          radius,
        )}
      />
      {/* hover shadow: deeper, fades in (opacity only) */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 opacity-0 shadow-[var(--frame-shadow-hover)] transition-opacity group-hover:opacity-100 motion-reduce:transition-none',
          ease,
          radius,
        )}
      />
      <div className={cn('relative border border-[#262624] bg-[#161615] p-1.5 md:p-2', radius)}>
        <div className={cn('relative overflow-hidden bg-[#0c0c0b]', screen)}>
          <Image src={src} alt={alt} fill priority={priority} quality={90} sizes={sizes} className="object-cover object-top" />
        </div>
      </div>
      {children}
    </div>
  )
}

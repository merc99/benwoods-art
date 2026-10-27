import { cn } from '@/lib/cn'

/**
 * A short confirmation that something just happened ("benwoods.design@gmail.com copied"). It never asks for a
 * decision and never holds an error the reader has to act on. Put it inside a polite live region (ToastRegion)
 * so screen readers hear it without losing their place.
 */
export function Toast({ children, done = true, className }: { children: React.ReactNode; done?: boolean; className?: string }) {
  return (
    <p
      className={cn(
        't-label animate-[wm-in_220ms_ease-out_both] rounded-pill bg-fg px-4 py-2.5 text-bg shadow-[var(--shadow-float)] motion-reduce:animate-none',
        className,
      )}
    >
      {children} {done && <span aria-hidden>✓</span>}
    </p>
  )
}

/** The fixed spot toasts appear in, bottom center, above everything but the grain. */
export function ToastRegion({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div aria-live="polite" className={cn('pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4', className)}>
      {children}
    </div>
  )
}

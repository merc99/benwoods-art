import { cn } from '@/lib/cn'

/**
 * Dashed column lines behind a section, aligned to the page shell: 4 columns on phones, 12 (or 6) from lg.
 * The menu's dashed grid, used as structure across the site.
 */
export function GridLines({ className, cols = 12 }: { className?: string; cols?: 4 | 6 | 12 }) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0', className)}>
      <div className="shell relative h-full">
        <div className={cn('grid h-full grid-cols-4', cols === 12 && 'lg:grid-cols-12', cols === 6 && 'lg:grid-cols-6')}>
          {Array.from({ length: cols }, (_, i) => (
            <div key={i} className={cn('dash-v h-full', i >= 4 && 'hidden lg:block')} />
          ))}
        </div>
        {/* closing line on the right edge */}
        <div className="dash-v absolute inset-y-0 right-[var(--gutter)] w-px" />
      </div>
    </div>
  )
}

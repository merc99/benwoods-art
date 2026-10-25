import Link from 'next/link'
import { RevealText } from '@/components/fx/RevealText'
import { cn } from '@/lib/cn'

/** Index number, title, count and an optional link, sitting on a dashed rule. On phones the index sits above the title. */
export function SectionHeader({
  index,
  title,
  meta,
  href,
  hrefLabel,
  id,
  className,
}: {
  index: string
  title: string
  meta?: string
  href?: string
  hrefLabel?: string
  id?: string
  className?: string
}) {
  return (
    <div className={cn('rule-dash-b grid grid-cols-1 items-end gap-x-[var(--gutter)] pb-4 lg:grid-cols-12', className)}>
      <span className="t-label pb-2 text-fg-3 lg:col-span-3 lg:pb-1">({index})</span>
      <RevealText as="h2" id={id} text={title} className="t-heading text-[clamp(1.75rem,1.2rem+2.4vw,3.25rem)] lg:col-span-6" />
      <div className="t-label flex items-center justify-between gap-4 pt-3 text-fg-3 lg:col-span-3 lg:justify-end lg:pt-0 lg:pb-1">
        {meta && <span>{meta}</span>}
        {href && (
          <Link href={href} className="inline-flex h-11 items-center gap-1.5 text-fg-2 hover:text-fg lg:h-auto">
            {hrefLabel} <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </div>
  )
}

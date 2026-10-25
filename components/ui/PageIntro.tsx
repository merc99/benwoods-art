import { RevealText } from '@/components/fx/RevealText'
import { PixelTiles } from '@/components/fx/PixelTiles'
import { cn } from '@/lib/cn'

/**
 * Title band for inner pages: a mono index line (with an optional count on the right), a big uppercase title,
 * an optional lede and extra content, over the pixel tiles. The defaults are the 404 page's; Work, Lab and
 * Resources pass their own spacing and sizes.
 */
export function PageIntro({
  label,
  meta,
  title,
  lede,
  children,
  seed = 23,
  bordered = true,
  revealLede = true,
  padding = 'pt-10 pb-14 lg:pt-16 lg:pb-20',
  titleSize = 'text-[clamp(3.5rem,1rem+12vw,12rem)]',
  ledeClass = 'mt-8 max-w-[36ch]',
}: {
  label: string
  /** Right side of the index line, e.g. "15 projects · 2022—2026". */
  meta?: React.ReactNode
  title: string
  lede?: string
  children?: React.ReactNode
  /** Pixel-tile layout seed, so each page's pattern differs. */
  seed?: number
  bordered?: boolean
  /** Fade the lede in on first view (the 404 does; pages that open on it don't need to). */
  revealLede?: boolean
  padding?: string
  titleSize?: string
  ledeClass?: string
}) {
  return (
    <section className={cn('relative isolate overflow-hidden', bordered && 'border-b border-rule')}>
      <PixelTiles seed={seed} />
      <div className={cn('shell relative', padding)}>
        {meta ? (
          <div className="t-label flex justify-between text-fg-3">
            <span>{label}</span>
            <span>{meta}</span>
          </div>
        ) : (
          <p className="t-label text-fg-3">{label}</p>
        )}
        <h1 className={cn('t-display mt-6 cursor-default', titleSize)}>{title}</h1>
        {lede &&
          (revealLede ? (
            <RevealText as="p" text={lede} className={cn('t-lede text-fg-2', ledeClass)} />
          ) : (
            <p className={cn('t-lede text-fg-2', ledeClass)}>{lede}</p>
          ))}
        {children}
      </div>
    </section>
  )
}

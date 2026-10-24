import Image from 'next/image'
import { Fragment } from 'react'
import { imageSize } from '@/lib/image'
import type { GalleryItem } from '@/lib/work'
import { cn } from '@/lib/cn'
import { GalleryVideo } from './GalleryVideo'
import { Bezel, bezelRadius } from '@/components/ui/Bezel'

const span = {
  full: 'col-span-2 md:col-span-12',
  half: 'col-span-2 md:col-span-6',
  third: 'col-span-2 md:col-span-4',
  quarter: 'col-span-1 md:col-span-3',
}
const sizes = {
  full: '(min-width: 1520px) 1440px, 100vw',
  half: '(min-width: 768px) 50vw, 100vw',
  third: '(min-width: 768px) 33vw, 100vw',
  quarter: '(min-width: 768px) 25vw, 50vw',
}
// frame size per span (the site's card frame); playful prints keep their own paper look
const frame = { full: 'wide', half: 'half', third: 'half', quarter: 'small' } as const
// playful: loose prints on a table, each at its own small tilt; they straighten on hover
const TILT = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-[0.6deg]', '-rotate-[1.4deg]']

/**
 * Case-study gallery: images at their own proportions (no crop), short videos, and dashed placeholder slots.
 * Items with a `group` get a heading where the group starts. `variant="playful"` tilts the prints.
 */
export async function Gallery({ items, title, variant }: { items: GalleryItem[]; title: string; variant?: '' | 'playful' }) {
  const resolved = await Promise.all(
    items.map(async (item) => {
      if (!item.src || /\.(mp4|webm)$/i.test(item.src)) return { item, size: null }
      return { item, size: await imageSize(item.src) }
    }),
  )
  const playful = variant === 'playful'
  const groupStart = (i: number) => !!resolved[i].item.group && resolved[i].item.group !== resolved[i - 1]?.item.group

  // Two half-width images side by side whose shapes differ share one row at the same height: each
  // takes width in proportion to its aspect ratio, so neither is cropped and both end level.
  // Matching pairs keep the plain 6 + 6 columns (identical result). Playful prints keep their loose look.
  const ratio = (i: number) => {
    const r = resolved[i]
    return r && r.item.span === 'half' && r.size && !r.item.placeholder ? r.size.width / r.size.height : null
  }
  const pairedWith = new Map<number, number>()
  if (!playful) {
    let run = 0
    resolved.forEach((r, i) => {
      run = r.item.span === 'half' && !groupStart(i) ? run + 1 : r.item.span === 'half' ? 1 : 0
      if (run % 2 === 0 && run > 0) {
        const a = ratio(i - 1), b = ratio(i)
        if (a && b && Math.abs(a - b) / Math.max(a, b) > 0.02) pairedWith.set(i - 1, i)
      }
    })
  }
  const second = new Set(pairedWith.values())

  const figure = (i: number, className: string, style?: React.CSSProperties) => {
    const { item, size } = resolved[i]
    const s = item.span ?? 'full'
    const fig = i + 1
    return (
      <figure
        key={i}
        style={style}
        className={cn(
          className,
          playful &&
            `${TILT[i % TILT.length]} bg-surface p-3 shadow-[var(--shadow-float)] transition-transform duration-300 ease-out hover:rotate-0 motion-reduce:rotate-0 motion-reduce:transition-none sm:p-4`,
        )}
      >
        {item.placeholder ? (
          <div className={cn('grid place-items-center border border-dashed border-rule-strong bg-sunken p-6 text-center', s === 'full' ? 'aspect-[21/9]' : 'aspect-[16/9]')}>
            <p className="t-label max-w-[40ch] text-fg-2">{item.placeholder}</p>
          </div>
        ) : item.src && !size ? (
          <Bezel size={frame[s]}>
            <div className={cn('overflow-hidden bg-sunken', bezelRadius[frame[s]].inner)}>
              <GalleryVideo src={item.src} label={item.alt ?? `${title} video`} />
            </div>
          </Bezel>
        ) : item.src && size ? (
          playful ? (
            <div className="relative bg-sunken">
              <Image src={item.src} alt={item.alt ?? ''} width={size.width} height={size.height} sizes={sizes[s]} quality={88} className="h-auto w-full" />
            </div>
          ) : (
            <Bezel size={frame[s]}>
              <div className={cn('relative overflow-hidden bg-sunken', bezelRadius[frame[s]].inner)}>
                <Image src={item.src} alt={item.alt ?? ''} width={size.width} height={size.height} sizes={sizes[s]} quality={88} className="h-auto w-full" />
              </div>
            </Bezel>
          )
        ) : null}
        {item.caption && (
          <figcaption className="t-label relative mt-3 flex gap-3 text-fg-2">
            {!playful && <span className="shrink-0">Fig. {String(fig).padStart(2, '0')}</span>}
            <span className={cn(!item.group && 'text-[0.875rem] tracking-normal normal-case [font-family:var(--font-sans)]', 'text-fg-2')}>
              {item.caption}
            </span>
          </figcaption>
        )}
      </figure>
    )
  }

  return (
    <div className={cn('grid grid-cols-2 items-start gap-x-[var(--gutter)] md:grid-cols-12', playful ? 'gap-y-14' : 'gap-y-10')}>
      {resolved.map(({ item }, i) => {
        if (second.has(i)) return null
        const partner = pairedWith.get(i)
        return (
          <Fragment key={i}>
            {groupStart(i) && (
              <h3 className="rule-dash-b col-span-2 mt-8 flex items-end justify-between pb-3 md:col-span-12">
                <span className="t-title text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)]">{item.group}</span>
                <span className="t-label text-fg-2">
                  {String(resolved.filter((r) => r.item.group === item.group).length).padStart(2, '0')} designs
                </span>
              </h3>
            )}
            {partner === undefined ? (
              figure(i, span[item.span ?? 'full'])
            ) : (
              <div className="col-span-2 flex flex-col gap-x-[var(--gutter)] gap-y-10 md:col-span-12 md:flex-row md:items-start">
                {/* basis = the frame's border and padding (2 × (1px + 8px)), so the artwork inside lands at exactly equal height */}
                {[i, partner].map((j) => figure(j, 'min-w-0 md:basis-[18px]', { flexGrow: ratio(j)! }))}
              </div>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

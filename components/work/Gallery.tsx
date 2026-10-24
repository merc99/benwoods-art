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
  let fig = 0

  return (
    <div className={cn('grid grid-cols-2 items-start gap-x-[var(--gutter)] md:grid-cols-12', playful ? 'gap-y-14' : 'gap-y-10')}>
      {resolved.map(({ item, size }, i) => {
        const s = item.span ?? 'full'
        const groupStart = item.group && item.group !== resolved[i - 1]?.item.group
        fig++
        return (
          <Fragment key={i}>
            {groupStart && (
              <h3 className="rule-dash-b col-span-2 mt-8 flex items-end justify-between pb-3 md:col-span-12">
                <span className="t-title text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)]">{item.group}</span>
                <span className="t-label text-fg-2">
                  {String(resolved.filter((r) => r.item.group === item.group).length).padStart(2, '0')} designs
                </span>
              </h3>
            )}
            <figure
              className={cn(
                span[s],
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
          </Fragment>
        )
      })}
    </div>
  )
}

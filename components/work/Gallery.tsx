import Image from 'next/image'
import { Fragment } from 'react'
import { imageSize } from '@/lib/image'
import type { GalleryItem } from '@/lib/work'
import { cn } from '@/lib/cn'
import { GalleryVideo } from './GalleryVideo'
import { Bezel, bezelRadius } from '@/components/ui/Bezel'
import { ZoomButton, ZoomProvider } from './GalleryZoom'

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
 * `lightbox` opens images in the shared Lightbox.
 */
export async function Gallery({
  items,
  title,
  variant,
  lightbox = false,
}: {
  items: GalleryItem[]
  title: string
  variant?: '' | 'playful'
  lightbox?: boolean
}) {
  const resolved = await Promise.all(
    items.map(async (item) => {
      if (!item.src || /\.(mp4|webm)$/i.test(item.src)) return { item, size: null }
      return { item, size: await imageSize(item.src) }
    }),
  )
  const playful = variant === 'playful'
  const groupStart = (i: number) => !!resolved[i].item.group && resolved[i].item.group !== resolved[i - 1]?.item.group

  // Rows of same-size images (2 halves, 3 thirds or 4 quarters) whose shapes differ are evened out:
  //  - a small difference (up to 8%): equal columns, each image trimmed to the row's average shape
  //    (a sliver of backdrop at most), so the frames are identical;
  //  - a bigger one (halves and thirds): one row at a shared height, each image as wide as its shape
  //    needs, so nothing is cropped and both end level.
  // Rows that already match render exactly as before. Playful prints keep their loose look.
  const perRow = { half: 2, third: 3, quarter: 4 } as const
  const ratio = (i: number) => {
    const r = resolved[i]
    return r?.size && !r.item.placeholder ? r.size.width / r.size.height : null
  }
  const rowAspect = new Map<number, number>() // item -> shared aspect ratio (trim mode)
  const rowFlex = new Map<number, number[]>() // first item -> all items of a level row (no-crop mode)
  if (!playful) {
    let runStart = 0
    resolved.forEach((r, i) => {
      const s = r.item.span ?? 'full'
      const prev = resolved[i - 1]?.item.span ?? 'full'
      if (i === 0 || s !== prev || groupStart(i)) runStart = i
      if (s === 'full') return
      const n = perRow[s]
      if ((i - runStart) % n !== n - 1) return // not the last item of a row yet
      const idx = Array.from({ length: n }, (_, k) => i - n + 1 + k)
      const rs = idx.map(ratio)
      if (rs.some((x) => x === null)) return
      const vals = rs as number[]
      const spread = (Math.max(...vals) - Math.min(...vals)) / Math.max(...vals)
      if (spread <= 0.02) return
      if (spread <= 0.08) {
        const avg = vals.reduce((x, y) => x + y, 0) / n
        idx.forEach((j) => rowAspect.set(j, avg))
      } else if (s !== 'quarter') rowFlex.set(idx[0], idx)
    })
  }
  const inFlexRow = new Set([...rowFlex.values()].flatMap((r) => r.slice(1)))

  // lightbox: every image in order, with its title and caption
  const photos = resolved.flatMap(({ item, size }, i) =>
    item.src && size ? [{ i, src: item.src, alt: item.alt ?? '', caption: [item.title, item.caption].filter(Boolean).join(': ') }] : [],
  )
  const Zoomable = ({ i, children }: { i: number; children: React.ReactNode }) => {
    const k = photos.findIndex((x) => x.i === i)
    if (!lightbox || k < 0) return <>{children}</>
    return (
      <ZoomButton index={k} label={resolved[i].item.alt ?? title}>
        {children}
      </ZoomButton>
    )
  }

  const figure = (i: number, className: string, style?: React.CSSProperties) => {
    const { item, size } = resolved[i]
    const s = item.span ?? 'full'
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
            <Zoomable i={i}>
            <Bezel size={frame[s]}>
              <div
                style={rowAspect.has(i) ? { aspectRatio: rowAspect.get(i) } : undefined}
                className={cn('relative overflow-hidden bg-sunken', bezelRadius[frame[s]].inner)}
              >
                {rowAspect.has(i) ? (
                  <Image src={item.src} alt={item.alt ?? ''} fill sizes={sizes[s]} quality={88} className="object-cover" />
                ) : (
                  <Image src={item.src} alt={item.alt ?? ''} width={size.width} height={size.height} sizes={sizes[s]} quality={88} className="h-auto w-full" />
                )}
              </div>
            </Bezel>
            </Zoomable>
          )
        ) : null}
        {(item.caption || item.title) && (
          <figcaption className="t-label relative mt-3 flex gap-3 text-fg-2">
            <span className={cn(!item.group && 'text-[0.875rem] tracking-normal normal-case [font-family:var(--font-sans)]', 'text-fg-2')}>
              {item.title && <strong className="mb-1 block font-semibold text-fg">{item.title}</strong>}
              {item.caption}
            </span>
          </figcaption>
        )}
      </figure>
    )
  }

  const grid = (
    <div className={cn('grid grid-cols-2 items-start gap-x-[var(--gutter)] md:grid-cols-12', playful ? 'gap-y-14' : 'gap-y-10')}>
      {resolved.map(({ item }, i) => {
        if (inFlexRow.has(i)) return null
        const row = rowFlex.get(i)
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
            {!row ? (
              figure(i, span[item.span ?? 'full'])
            ) : (
              <div className="col-span-2 flex flex-col gap-x-[var(--gutter)] gap-y-10 md:col-span-12 md:flex-row md:items-start">
                {/* basis = the frame's border and padding (2 × (1px + 8px)), so the artwork inside lands at exactly equal height */}
                {row.map((j) => figure(j, 'min-w-0 md:basis-[18px]', { flexGrow: ratio(j)! }))}
              </div>
            )}
          </Fragment>
        )
      })}
    </div>
  )
  return lightbox ? <ZoomProvider items={photos.map(({ src, alt, caption }) => ({ src, alt, caption }))}>{grid}</ZoomProvider> : grid
}

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Gallery } from '@/components/work/Gallery'
import { Palette } from '@/components/work/Palette'
import { PlaylistGrid } from '@/components/work/PlaylistGrid'
import { playlists } from '@/lib/playlists'
import { MerchGrid } from '@/components/merch/MerchGrid'
import { allMerch } from '@/lib/merch'
import { Prose } from '@/components/work/Prose'
import { ReadMore } from '@/components/work/ReadMore'
import { SpecTable } from '@/components/work/SpecTable'
import { imageSize } from '@/lib/image'
import { getAdjacent, getProject, getProjects } from '@/lib/work'
import { cn } from '@/lib/cn'
import { PixelTiles } from '@/components/fx/PixelTiles'
import { DeviceFrame } from '@/components/ui/DeviceFrame'
import { Bezel, bezelRadius } from '@/components/ui/Bezel'

export const dynamicParams = false

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProject((await params).slug)
  if (!p) return {}
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { type: 'article', siteName: 'Ben Woods', url: `/work/${p.slug}`, title: `${p.title} — Ben Woods`, description: p.summary },
  }
}

const ext = { target: '_blank', rel: 'noreferrer' }

/** Splits "Lead sentence. The rest." so the lead can be set in bold. */
function lead(text: string) {
  const i = text.indexOf('. ')
  return i === -1 ? [text, ''] : [text.slice(0, i + 1), text.slice(i + 2)]
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getProject(slug)
  if (!p) notFound()
  const all = getProjects()
  const n = all.findIndex((x) => x.slug === slug) + 1
  const { prev, next } = getAdjacent(slug)
  const cover = p.cover ? await imageSize(p.cover) : null
  const portrait = cover ? cover.height > cover.width * 0.9 : false
  // neighbors' covers at their own shape, for the framed previous/next thumbnails
  const thumb = async (x: typeof prev) => (x?.cover ? { src: x.cover, ...(await imageSize(x.cover)) } : null)
  const thumbs = [await thumb(prev), await thumb(next)]

  return (
    <article>
      {/* header */}
      <header className="relative isolate overflow-hidden">
        <PixelTiles seed={p.order * 13 + 5} />
        <div className="shell relative pt-6 lg:pt-8">
          <div className="t-label flex items-center justify-between text-fg-3">
            <Link href="/work" className="inline-flex h-11 items-center gap-2 hover:text-fg">
              <span aria-hidden>←</span> All work
            </Link>
            <span>
              Case study {String(n).padStart(2, '0')} / {String(all.length).padStart(2, '0')}
            </span>
          </div>
          <h1 className="t-display mt-6 text-[clamp(3.25rem,0.75rem+11vw,11rem)] lg:mt-10">{p.title}</h1>
          <div className="mt-8 grid gap-x-[var(--gutter)] gap-y-6 pb-10 lg:grid-cols-12 lg:pb-14">
            <p className="t-lede max-w-[32ch] text-fg lg:col-span-7">{p.summary}</p>
            <div className="flex flex-col gap-4 lg:col-span-5 lg:items-end lg:justify-end">
              {(p.liveUrl || p.repoUrl) && (
                <div className="flex flex-wrap gap-2">
                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      {...ext}
                      className="t-label inline-flex h-11 items-center gap-2 bg-fg px-5 text-bg transition-transform duration-[var(--dur-chrome)] active:scale-[0.97]"
                    >
                      {p.liveLabel || 'View live site'} <span aria-hidden>↗</span>
                    </a>
                  )}
                  {p.repoUrl && (
                    <a
                      href={p.repoUrl}
                      {...ext}
                      className="t-label inline-flex h-11 items-center gap-2 border border-rule-strong px-5 text-fg transition-colors duration-[var(--dur-chrome)] hover:border-fg active:scale-[0.97]"
                    >
                      View on GitHub <span aria-hidden>↗</span>
                    </a>
                  )}
                </div>
              )}
              <p className="t-label text-fg-3">{p.tags.join(' · ')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* cover: a framed product screenshot when the project has one, else the cover image */}
      {p.coverScreen ? (
        <div className="shell">
          <div className="mx-auto max-w-[1280px] pb-[clamp(1.5rem,4vw,3.5rem)]">
            <DeviceFrame src={p.coverScreen} alt={p.coverScreenAlt || p.coverAlt} priority sizes="(min-width: 1520px) 1280px, 92vw" />
          </div>
        </div>
      ) : (
        p.pageCover &&
        p.cover &&
        cover && (
          // tall art: the frame wraps the artwork itself, centered, instead of a wide frame with side gaps
          <div className={cn('shell', portrait && 'flex justify-center')}>
            <Bezel size="wide" className={cn(portrait && 'max-w-full')}>
            <div className={cn('overflow-hidden bg-sunken', bezelRadius.wide.inner)}>
              <Image
                src={p.cover}
                alt={p.coverAlt}
                width={cover.width}
                height={cover.height}
                priority
                sizes={portrait ? '(min-width: 768px) 60vw, 100vw' : '(min-width: 1520px) 1440px, 100vw'}
                quality={88}
                className={cn('h-auto', portrait ? 'block max-h-[78svh] w-auto max-w-full' : 'w-full')}
              />
            </div>
            </Bezel>
          </div>
        )
      )}

      {/* spec + story */}
      <section>
        <div className="shell grid gap-x-[var(--gutter)] gap-y-12 py-14 lg:grid-cols-12 lg:py-20">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <h2 className="sr-only">Project details</h2>
              <SpecTable project={p} />
            </div>
          </aside>
          <div className="max-w-[64ch] lg:col-span-7 lg:col-start-6">
            <h2 className="sr-only">About the project</h2>
            <ReadMore>
              <Prose source={p.body} />
            </ReadMore>

            {p.interesting.length > 0 && (
              <section aria-labelledby="interesting" className="mt-14">
                <h2 id="interesting" className="t-label border-t border-rule-strong pt-4 text-fg-3">
                  What was interesting
                </h2>
                <ol className="mt-2">
                  {p.interesting.map((b, i) => {
                    const [first, rest] = lead(b)
                    return (
                      <li key={i} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-2 border-b border-rule py-5">
                        <span className="t-label pt-1 text-fg-3">{String(i + 1).padStart(2, '0')}</span>
                        <p>
                          <strong className="font-semibold">{first}</strong> <span className="text-fg-2">{rest}</span>
                        </p>
                      </li>
                    )
                  })}
                </ol>
              </section>
            )}
          </div>
        </div>
      </section>

      {/* sections: titled blocks of their own (intro, then figures or palette swatches), in order */}
      {p.sections.map((sec, k) => {
        const id = `section-${k + 1}`
        const startAt = p.sections.slice(0, k).reduce((n, x) => n + (x.items?.length ?? 0), 0)
        const count = sec.palette?.length ?? sec.items?.length ?? 0
        const meta = count ? `${String(count).padStart(2, '0')} ${sec.palette ? 'inks' : (sec.unit ?? 'figures')}` : ''
        return (
          <section key={id} aria-labelledby={id} className="border-t border-rule">
            <div className="shell py-14 lg:py-20">
              <div className="rule-dash-b mb-8 flex items-end justify-between pb-4">
                <h2 id={id} className="t-heading text-[clamp(1.75rem,1.2rem+2.4vw,3.25rem)]">
                  {sec.title}
                </h2>
                {meta && <span className="t-label text-fg-3">{meta}</span>}
              </div>
              {sec.intro && (
                // the intro sits in the story's column, so the text lines up down the page
                <div className="mb-10 grid gap-x-[var(--gutter)] lg:mb-14 lg:grid-cols-12">
                  <div className="max-w-[64ch] lg:col-span-7 lg:col-start-6">
                    <ReadMore>
                      <Prose source={sec.intro} />
                    </ReadMore>
                  </div>
                </div>
              )}
              {sec.palette && <Palette inks={sec.palette} paper={sec.paper} />}
              {sec.items && sec.items.length > 0 && <Gallery items={sec.items} title={p.title} lightbox={sec.lightbox} startAt={startAt} />}
            </div>
          </section>
        )
      })}

      {/* custom modules */}
      {p.module === 'playlists' && (
        <section aria-labelledby="playlists" className="border-t border-rule">
          <div className="shell py-14 lg:py-20">
            <div className="rule-dash-b mb-8 flex items-end justify-between pb-4">
              <h2 id="playlists" className="t-heading text-[clamp(1.75rem,1.2rem+2.4vw,3.25rem)]">
                Playlists
              </h2>
              <span className="t-label text-fg-2">{String(playlists.length).padStart(2, '0')} covers</span>
            </div>
            <PlaylistGrid playlists={playlists} />
          </div>
        </section>
      )}

      {p.module === 'merch' && (
        <section aria-labelledby="merch" className="border-t border-rule">
          <div className="shell py-14 lg:py-20">
            <div className="rule-dash-b mb-8 flex items-end justify-between pb-4">
              <h2 id="merch" className="t-heading text-[clamp(1.75rem,1.2rem+2.4vw,3.25rem)]">
                The shirts
              </h2>
              <span className="t-label text-fg-2">{String(allMerch.length).padStart(2, '0')} pieces</span>
            </div>
            <MerchGrid items={allMerch} />
          </div>
        </section>
      )}

      {/* gallery */}
      {p.gallery.length > 0 && (
        <section aria-labelledby="gallery" className="border-t border-rule">
          <div className="shell py-14 lg:py-20">
            <div className="rule-dash-b mb-8 flex items-end justify-between pb-4">
              <h2 id="gallery" className="t-heading text-[clamp(1.75rem,1.2rem+2.4vw,3.25rem)]">
                Gallery
              </h2>
              <span className="t-label text-fg-3">{String(p.gallery.length).padStart(2, '0')} figures</span>
            </div>
            <Gallery items={p.gallery} title={p.title} variant={p.galleryStyle} />
          </div>
        </section>
      )}

      {/* previous / next */}
      <nav aria-label="More work" data-surface="ink" className="relative isolate border-b border-rule">
        <div className="shell relative grid md:grid-cols-2">
          {[
            { label: 'Previous', project: prev, arrow: '←' },
            { label: 'Next', project: next, arrow: '→' },
          ].map(({ label, project, arrow }, i) =>
            !project ? (
              // keeps Next in the right column when there's no Previous
              <div key={label} aria-hidden className="hidden md:block" />
            ) : (
              <Link
                key={label}
                href={`/work/${project.slug}`}
                className={cn(
                  'group flex items-center gap-5 py-10 lg:py-14',
                  i === 1 && 'border-t border-rule md:flex-row-reverse md:border-t-0 md:border-l md:pl-[var(--gutter)] md:text-right',
                  i === 0 && 'md:pr-[var(--gutter)]',
                )}
              >
                {thumbs[i] && (
                  // the cover whole, at its own shape, in the site's card frame (lifts on hover like other cards)
                  <Bezel size="small" className="hidden shrink-0 sm:block">
                    <span className={cn('block overflow-hidden bg-sunken', bezelRadius.small.inner)}>
                      <Image
                        src={thumbs[i].src}
                        alt=""
                        width={thumbs[i].width}
                        height={thumbs[i].height}
                        sizes="240px"
                        quality={88}
                        className="block h-20 w-auto max-w-[9rem] object-cover lg:h-28 lg:max-w-[12rem]"
                      />
                    </span>
                  </Bezel>
                )}
                <span className="min-w-0">
                  <span className="t-label block text-fg-3">
                    {i === 0 && <span aria-hidden>{arrow} </span>}
                    {label}
                    {i === 1 && <span aria-hidden> {arrow}</span>}
                  </span>
                  <span className="t-heading mt-2 block text-[clamp(1.75rem,1.1rem+2.6vw,3.5rem)]">{project.title}</span>
                </span>
              </Link>
            ),
          )}
        </div>
      </nav>
    </article>
  )
}

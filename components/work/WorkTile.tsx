import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { ProjectCard } from '@/lib/work'

/**
 * A work tile: cover on top (no overlay), title, year and mono tags below.
 * The grid sets one `aspect` per row so rows scan cleanly. Every cover gets a 1px edge so dark
 * covers stay separate from the page.
 * `wide` uses the project's `coverWide` image when it has one (full-width Home tile).
 */
export function WorkTile({
  project,
  sizes,
  aspect = 'aspect-[16/10]',
  priority = false,
  showSummary = false,
  wide = false,
  className,
}: {
  project: ProjectCard
  sizes: string
  aspect?: string
  priority?: boolean
  showSummary?: boolean
  wide?: boolean
  className?: string
}) {
  const src = (wide && project.coverWide) || project.cover
  const image = (
    <div
      style={project.coverBg ? { background: project.coverBg } : undefined}
      className={cn('relative w-full overflow-hidden bg-sunken', aspect)}
    >
      {src && (
        <Image
          src={src}
          alt={project.coverAlt}
          fill
          sizes={sizes}
          quality={88}
          priority={priority}
          style={{ objectPosition: project.coverPosition }}
          className={cn(
            'transition-transform duration-[900ms] ease-out group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100',
            project.coverFit === 'contain' ? 'object-contain' : 'object-cover',
          )}
        />
      )}
      {/* the edge: keeps dark covers from melting into a dark page */}
      <span aria-hidden className="pointer-events-none absolute inset-0 z-[3] ring-1 ring-rule ring-inset" />
    </div>
  )

  return (
    <article className={cn('flex flex-col', className)}>
      <Link href={`/work/${project.slug}`} aria-label={`${project.title}: ${project.summary}`} className="group flex h-full flex-col">
        {image}
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="t-title text-[clamp(1.375rem,1.15rem+0.8vw,1.875rem)]">
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out group-hover:bg-[length:100%_1px]">
              {project.title}
            </span>
          </h3>
          <span className="t-label shrink-0 text-fg-2">
            {project.year}
            <span aria-hidden className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none">
              ↗
            </span>
          </span>
        </div>
        {showSummary && <p className="mt-2 max-w-[48ch] text-fg-2">{project.summary}</p>}
        <p className="t-label mt-2 text-fg-2">{project.tags.join(' · ')}</p>
      </Link>
    </article>
  )
}

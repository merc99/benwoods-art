import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { ProjectCard } from '@/lib/work'
import { TileMeta } from './TileMeta'

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
      <Link href={`/work/${project.slug}`} aria-labelledby={`${project.slug}-title`} className="group flex h-full flex-col">
        {image}
        <TileMeta project={project} titleId={`${project.slug}-title`} showSummary={showSummary} />
      </Link>
    </article>
  )
}

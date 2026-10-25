import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { ProjectCard } from '@/lib/work'
import { TileMeta } from './TileMeta'
import { Bezel, bezelRadius } from '@/components/ui/Bezel'
import { CoverMorph } from '@/components/ui/CoverMorph'

/**
 * A work tile: cover on top (no overlay), title, year and mono tags below.
 * The grid sets one `aspect` per row so rows scan cleanly. The cover sits in the site's card frame (Bezel).
 * `wide` uses the project's `coverWide` image when it has one (full-width Home tile); other cards use
 * `coverTile` when set.
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
  const src = (wide && project.coverWide) || project.coverTile || project.cover
  const image = (
    <CoverMorph slug={project.slug}>
    <Bezel size={wide ? 'wide' : 'half'}>
    <div
      style={project.coverBg ? { background: project.coverBg } : undefined}
      className={cn('relative w-full overflow-hidden bg-sunken', aspect, bezelRadius[wide ? 'wide' : 'half'].inner)}
    >
      {src && (
        <Image
          src={src}
          // decorative here: the card is named by its visible title, year and tags; the case study describes the art
          alt=""
          fill
          sizes={sizes}
          quality={88}
          priority={priority}
          style={{ objectPosition: project.coverPosition }}
          className={project.coverFit === 'contain' ? 'object-contain' : 'object-cover'}
        />
      )}
    </div>
    </Bezel>
    </CoverMorph>
  )

  return (
    <article className={cn('flex flex-col', className)}>
      <Link href={`/work/${project.slug}`} className="group flex h-full flex-col">
        {image}
        <TileMeta project={project} titleId={`${project.slug}-title`} showSummary={showSummary} />
      </Link>
    </article>
  )
}

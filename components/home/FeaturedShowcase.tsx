import Link from 'next/link'
import { DeviceFrame } from '@/components/ui/DeviceFrame'
import { TileMeta } from '@/components/work/TileMeta'
import type { ProjectCard } from '@/lib/work'

/**
 * A featured build on Home: the product screenshot in a DeviceFrame, then title, summary and tags
 * like every other tile.
 */
export function FeaturedShowcase({
  project,
  screenshot,
  screenshotAlt,
  half = false,
}: {
  project: ProjectCard
  screenshot: string
  screenshotAlt: string
  /** Half-width card (two per row): tighter padding, a 16:10 screen and smaller corners. */
  half?: boolean
}) {
  return (
    <article>
      <Link href={`/work/${project.slug}`} aria-labelledby={`${project.slug}-ft ${project.slug}-fd`} className="group block">
        <div className={half ? 'px-[2%] pt-[2%] pb-[4%]' : 'px-[2%] pt-[2%] pb-[4%] md:px-[6%] md:pt-[3%] md:pb-[4%]'}>
          <DeviceFrame
            src={screenshot}
            alt={screenshotAlt}
            size={half ? 'half' : 'wide'}
            sizes={half ? '(min-width: 768px) 46vw, 94vw' : '(min-width: 768px) 86vw, 94vw'}
          />
        </div>
        <TileMeta project={project} titleId={`${project.slug}-ft`} summaryId={`${project.slug}-fd`} showSummary />
      </Link>
    </article>
  )
}

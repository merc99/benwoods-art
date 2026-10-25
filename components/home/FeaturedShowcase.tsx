import Link from 'next/link'
import { DeviceFrame } from '@/components/ui/DeviceFrame'
import { TileMeta } from '@/components/work/TileMeta'
import type { ProjectCard } from '@/lib/work'
import { CoverMorph } from '@/components/ui/CoverMorph'

/**
 * A featured build on Home: the product screenshot in a DeviceFrame, then title, summary and tags
 * like every other tile.
 */
export function FeaturedShowcase({
  project,
  screenshot,
  half = false,
}: {
  project: ProjectCard
  screenshot: string
  /** A description of the shot, kept with the call sites; inside the card the image is decorative. */
  screenshotAlt?: string
  /** Half-width card (two per row): tighter padding, a 16:10 screen and smaller corners. */
  half?: boolean
}) {
  return (
    <article>
      <Link href={`/work/${project.slug}`} className="group block">
        <div className={half ? 'px-[2%] pt-[2%] pb-[4%]' : 'px-[2%] pt-[2%] pb-[4%] md:px-[6%] md:pt-[3%] md:pb-[4%]'}>
          <CoverMorph slug={project.slug}>
          <DeviceFrame
            src={screenshot}
            // decorative in the card: the link is named by its visible title, summary and tags
            alt=""
            size={half ? 'half' : 'wide'}
            priority={!half}
            sizes={half ? '(min-width: 768px) 46vw, 94vw' : '(min-width: 768px) 86vw, 94vw'}
          />
          </CoverMorph>
        </div>
        <TileMeta project={project} titleId={`${project.slug}-ft`} summaryId={`${project.slug}-fd`} showSummary />
      </Link>
    </article>
  )
}

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
        {/* the frame and its title, summary and tags share one side inset, so the text starts where the image does */}
        <div className={half ? 'px-[2%]' : 'px-[2%] md:px-[6%]'}>
          <div className={half ? 'pt-[2%] pb-[4%]' : 'pt-[2%] pb-[4%] md:pt-[3%]'}>
            <DeviceFrame
              src={screenshot}
              // decorative in the card: the link is named by its visible title, summary and tags
              alt=""
              size={half ? 'half' : 'wide'}
              priority={!half}
              sizes={half ? '(min-width: 768px) 46vw, 94vw' : '(min-width: 768px) 86vw, 94vw'}
            />
          </div>
          <TileMeta project={project} titleId={`${project.slug}-ft`} summaryId={`${project.slug}-fd`} showSummary />
        </div>
      </Link>
    </article>
  )
}

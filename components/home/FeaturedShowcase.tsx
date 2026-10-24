import Link from 'next/link'
import { DeviceFrame } from '@/components/ui/DeviceFrame'
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
            priority={!half}
            sizes={half ? '(min-width: 768px) 46vw, 94vw' : '(min-width: 768px) 86vw, 94vw'}
          />
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 id={`${project.slug}-ft`} className="t-title text-[clamp(1.375rem,1.15rem+0.8vw,1.875rem)]">
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out group-hover:bg-[length:100%_1px]">
              {project.title}
            </span>
          </h3>
          <span className="t-label shrink-0 text-fg-2">
            {project.year}
            <span
              aria-hidden
              className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
            >
              ↗
            </span>
          </span>
        </div>
        <p id={`${project.slug}-fd`} className="mt-2 max-w-[48ch] text-fg-2">{project.summary}</p>
        <p className="t-label mt-2 text-fg-2">{project.tags.join(' · ')}</p>
      </Link>
    </article>
  )
}

import type { ProjectCard } from '@/lib/work'

/**
 * The text under a work tile or featured build: title (underline draws in on the parent link's hover),
 * year with ↗, optional summary, and the tag line. Lives inside a `group` link.
 * The underline sits just under the letters (1.04em down the line), not at the bottom of the text box,
 * so on a two-line title it never crosses the line below.
 * Each line is `relative` so it paints above the card frame's drop shadow, which falls over it otherwise.
 */
export function TileMeta({
  project,
  titleId,
  summaryId,
  showSummary = false,
}: {
  project: ProjectCard
  /** For the parent link's aria-labelledby. */
  titleId: string
  summaryId?: string
  showSummary?: boolean
}) {
  return (
    <>
      <div className="relative mt-4 flex items-baseline justify-between gap-4">
        <h3 id={titleId} className="t-title text-[clamp(1.375rem,1.15rem+0.8vw,1.875rem)]">
          <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:left_1.04em] bg-no-repeat transition-[background-size] duration-500 ease-out group-hover:bg-[length:100%_1px]">
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
      {showSummary && (
        <p id={summaryId} className="relative mt-2 max-w-[48ch] text-fg-2">
          {project.summary}
        </p>
      )}
      <p className="t-label relative mt-2 text-fg-2">{project.tags.join(' · ')}</p>
    </>
  )
}

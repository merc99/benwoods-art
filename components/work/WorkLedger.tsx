// Pattern: Rat Mats archive ledger (handoff/rat-mats/components/archive-ledger), restyled.
// One row per project. Hover or keyboard focus inverts the whole row (colors only, 150ms, so nothing
// moves or reflows) and nudges the arrow; under reduced motion the change is instant and the arrow stays.
import Link from 'next/link'
import { categoryName } from '@/lib/categories'
import type { ProjectCard } from '@/lib/work'

const cols =
  'grid-cols-[2.5rem_minmax(0,1fr)_auto] md:grid-cols-[3.5rem_minmax(0,1fr)_11rem_6rem_2rem] lg:grid-cols-[3.5rem_minmax(0,1.4fr)_minmax(0,1fr)_11rem_6rem_2rem]'

// every piece of text in the row flips with it
const flip = 'transition-colors duration-150 ease-out motion-reduce:transition-none group-hover:text-bg group-focus-visible:text-bg'

export function WorkLedger({ projects }: { projects: ProjectCard[] }) {
  return (
    <div>
      <div className={`t-label hidden gap-4 border-b border-rule-strong px-3 pb-3 text-fg-2 md:grid ${cols}`}>
        <span>No.</span>
        <span>Project</span>
        <span className="hidden lg:block">Role</span>
        <span>Discipline</span>
        <span className="text-right">Year</span>
        <span />
      </div>
      <ol>
        {projects.map((p, i) => (
          <li key={p.slug} className="border-b border-rule">
            <Link
              href={`/work/${p.slug}`}
              className={`group grid items-baseline gap-4 px-3 py-6 outline-none transition-colors duration-150 ease-out hover:bg-fg focus-visible:bg-fg motion-reduce:transition-none ${cols}`}
            >
              <span className={`t-label text-fg-2 ${flip}`}>{String(i + 1).padStart(2, '0')}</span>
              <span className="min-w-0">
                <span className={`t-title block text-[clamp(1.5rem,1.1rem+1.6vw,2.5rem)] text-fg ${flip}`}>{p.title}</span>
                <span className={`t-label mt-2 block text-fg-2 ${flip}`}>{p.tags.join(' · ')}</span>
              </span>
              <span className={`hidden min-w-0 truncate text-fg-2 lg:block ${flip}`}>{p.role.split('.')[0]}</span>
              <span className={`t-label hidden text-fg-2 md:block ${flip}`}>{categoryName[p.category]}</span>
              <span className={`t-label text-right text-fg-2 ${flip}`}>{p.year}</span>
              <span
                aria-hidden
                className={`hidden text-right text-fg-2 md:block ${flip} transition-[color,transform] group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5 motion-reduce:group-hover:translate-x-0 motion-reduce:group-focus-visible:translate-x-0`}
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

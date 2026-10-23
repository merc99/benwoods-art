import { categoryName } from '@/lib/categories'
import type { Project } from '@/lib/work'

function host(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** The case-study spec table: label left, value right, hairline rules. */
export function SpecTable({ project }: { project: Project }) {
  const ext = { target: '_blank', rel: 'noreferrer' }
  const rows: [string, React.ReactNode][] = [
    ['Discipline', categoryName[project.category]],
    ['Role', project.role],
    ['Year', project.year],
    ['Stack', project.stack.length ? project.stack.join(' · ') : '—'],
    ['Status', project.status],
    [
      'Live',
      project.liveUrl ? (
        <a href={project.liveUrl} {...ext} className="underline decoration-rule-strong underline-offset-4 hover:decoration-fg">
          {host(project.liveUrl)} ↗
        </a>
      ) : (
        <span className="text-fg-3">Not public yet</span>
      ),
    ],
    [
      'GitHub',
      project.repoUrl ? (
        <a href={project.repoUrl} {...ext} className="underline decoration-rule-strong underline-offset-4 hover:decoration-fg">
          {project.repoUrl.replace('https://github.com/', '')} ↗
        </a>
      ) : (
        <span className="text-fg-3">—</span>
      ),
    ],
  ]

  return (
    <dl className="border-t border-rule-strong">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 border-b border-rule py-3">
          <dt className="t-label pt-[0.2rem] text-fg-3">{label}</dt>
          <dd className="text-right text-[0.9375rem] leading-snug text-fg">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

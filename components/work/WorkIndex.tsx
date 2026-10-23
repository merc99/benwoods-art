'use client'

import { useEffect, useState } from 'react'
import { LayoutGrid, Rows3 } from 'lucide-react'
import { categories, categoryLabel, type Category } from '@/lib/categories'
import type { ProjectCard } from '@/lib/work'
import { cn } from '@/lib/cn'
import { WorkLedger } from './WorkLedger'
import { WorkTile } from './WorkTile'
import styles from './WorkIndex.module.css'

type Filter = 'all' | Category
type View = 'grid' | 'list'

/**
 * Rows grouped by discipline so each row holds one kind of cover and one ratio: three across, or
 * pairs, at 16:10; illustration at 4:5. A lone last item takes half the row.
 */
function rows(items: ProjectCard[]) {
  const out: { span: number; aspect: string; items: ProjectCard[] }[] = []
  const groups: ProjectCard[][] = []
  for (const p of items) {
    const g = groups[groups.length - 1]
    if (g && g[0].category === p.category) g.push(p)
    else groups.push([p])
  }
  for (const g of groups) {
    const aspect = g[0].category === 'illustration' ? 'aspect-[4/5]' : 'aspect-[16/10]'
    let i = 0
    while (i < g.length) {
      const left = g.length - i
      const n = left === 4 || left === 2 ? 2 : left === 1 ? 1 : 3
      out.push({ span: n === 3 ? 4 : 6, aspect, items: g.slice(i, i + n) })
      i += n
    }
  }
  return out
}

const spanClass: Record<number, string> = { 4: 'md:col-span-4', 6: 'md:col-span-6' }

export function WorkIndex({ projects }: { projects: ProjectCard[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [view, setView] = useState<View>('grid')

  // The page is static, so a shared ?filter= / ?view= link is applied once on load.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const f = q.get('filter')
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL after hydration
    if (f && (categories as string[]).includes(f)) setFilter(f as Category)
    if (q.get('view') === 'list') setView('list')
  }, [])

  // Instant on the client; the URL keeps the choice so it can be shared or restored.
  const set = (key: 'filter' | 'view', value: string, fallback: string) => {
    if (key === 'filter') setFilter(value as Filter)
    else setView(value as View)
    const next = new URLSearchParams(window.location.search)
    if (value === fallback) next.delete(key)
    else next.set(key, value)
    const q = next.toString()
    window.history.replaceState(null, '', q ? `?${q}` : window.location.pathname)
  }

  const shown = filter === 'all' ? projects : projects.filter((p) => p.category === filter)
  const count = (f: Filter) => (f === 'all' ? projects.length : projects.filter((p) => p.category === f).length)
  const filters: Filter[] = ['all', ...categories]

  return (
    <div>
      {/* controls */}
      <div className="sticky top-[var(--header-h)] z-20 -mx-[var(--gutter)] border-b border-rule bg-bg px-[var(--gutter)]">
        <div className="flex items-center justify-between gap-4 py-2">
          <div role="group" aria-label="Filter by discipline" className="-ml-3 flex min-w-0 gap-1 overflow-x-auto [scrollbar-width:none]">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => set('filter', f, 'all')}
                className={cn(
                  't-label inline-flex h-11 shrink-0 items-center gap-2 px-3 transition-colors duration-[var(--dur-chrome)]',
                  filter === f ? 'text-fg' : 'text-fg-3 hover:text-fg',
                )}
              >
                {filter === f && <span aria-hidden className="size-1.5 rounded-full bg-signal" />}
                {f === 'all' ? 'All' : categoryLabel[f]}
                <span className="text-fg-3">{String(count(f)).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
          <div role="group" aria-label="View" className="flex shrink-0 border border-rule">
            {(
              [
                ['grid', 'Grid', LayoutGrid],
                ['list', 'List', Rows3],
              ] as const
            ).map(([v, label, Icon]) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => set('view', v, 'grid')}
                className={cn(
                  't-label inline-flex h-11 items-center gap-2 px-3 transition-colors duration-[var(--dur-chrome)]',
                  view === v ? 'bg-fg text-bg' : 'text-fg-2 hover:text-fg',
                )}
              >
                <Icon className="size-4" strokeWidth={1.5} aria-hidden />
                <span className="max-sm:sr-only">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {shown.length} {shown.length === 1 ? 'project' : 'projects'}
      </p>

      {/* key on filter + view so the new set fades in (calm) */}
      <div key={`${filter}-${view}`} className={cn(styles.fade, 'pt-8 lg:pt-10')}>
        {view === 'list' ? (
          <WorkLedger projects={shown} />
        ) : (
          <div className="grid gap-x-[calc(var(--gutter)*1.25)] gap-y-14 md:grid-cols-12 lg:gap-y-20">
            {rows(shown).flatMap((row, r) =>
              row.items.map((p) => (
                <WorkTile
                  key={p.slug}
                  project={p}
                  priority={r === 0}
                  aspect={row.aspect}
                  sizes={row.span === 6 ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 33vw, 100vw'}
                  className={spanClass[row.span]}
                />
              )),
            )}
          </div>
        )}
      </div>
    </div>
  )
}

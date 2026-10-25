'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { categories, categoryLabel, type Category } from '@/lib/categories'
import type { ProjectCard } from '@/lib/work'
import { cn } from '@/lib/cn'
import { WorkTile } from './WorkTile'
import styles from './WorkIndex.module.css'

type Filter = 'all' | Category

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

  // The page is static, so a shared ?filter= link is applied once on load.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const f = q.get('filter')
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL after hydration
    if (f && (categories as string[]).includes(f)) setFilter(f as Category)
  }, [])

  // Instant on the client; the URL keeps the choice so it can be shared or restored.
  const set = (key: 'filter', value: string, fallback: string) => {
    setFilter(value as Filter)
    const next = new URLSearchParams(window.location.search)
    if (value === fallback) next.delete(key)
    else next.set(key, value)
    const q = next.toString()
    window.history.replaceState(null, '', q ? `?${q}` : window.location.pathname)
  }

  // position of the sliding highlight, measured from the active button
  const pills = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState({ left: 0, width: 0 })
  useLayoutEffect(() => {
    const measure = () => {
      const b = pills.current?.querySelector<HTMLElement>(`[data-filter="${filter}"]`)
      if (b) setPill({ left: b.offsetLeft, width: b.offsetWidth })
    }
    measure()
    void document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [filter])

  // the filter row scrolls sideways on narrow screens: fade whichever edge has more to see, instead of a hard cut
  const strip = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ l: false, r: false })
  useEffect(() => {
    const el = strip.current
    if (!el) return
    const check = () => setEdge({ l: el.scrollLeft > 2, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 })
    check()
    el.addEventListener('scroll', check, { passive: true })
    const ro = new ResizeObserver(check)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => {
      el.removeEventListener('scroll', check)
      ro.disconnect()
    }
  }, [])
  // keep the chosen filter in view (only after a choice, so loading the page never scrolls it)
  const chosen = useRef(false)
  useEffect(() => {
    if (!chosen.current) return void (chosen.current = true)
    pills.current?.querySelector<HTMLElement>(`[data-filter="${filter}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }, [filter])
  const fade = 64
  const mask = `linear-gradient(to right, ${edge.l ? 'transparent' : '#000'} 0, #000 ${edge.l ? fade : 0}px, #000 calc(100% - ${edge.r ? fade : 0}px), ${edge.r ? 'transparent' : '#000'} 100%)`

  const shown = filter === 'all' ? projects : projects.filter((p) => p.category === filter)
  const count = (f: Filter) => (f === 'all' ? projects.length : projects.filter((p) => p.category === f).length)
  const filters: Filter[] = ['all', ...categories]

  return (
    <div>
      {/* controls */}
      <div className="sticky top-[var(--header-h)] z-20 -mx-[var(--gutter)] border-b border-rule bg-bg px-[var(--gutter)]">
        <div className="flex items-center justify-between gap-4 py-2">
          <div
            ref={strip}
            className="-ml-1 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ maskImage: mask, WebkitMaskImage: mask }}
          >
            <div role="group" aria-label="Filter by discipline" ref={pills} className="relative flex w-max gap-0.5 rounded-full border border-rule p-1">
              {/* the highlight slides under the active filter */}
              <span
                aria-hidden
                className="absolute top-1 bottom-1 rounded-full bg-fg transition-[left,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                style={{ left: pill.left, width: pill.width, opacity: pill.width ? 1 : 0 }}
              />
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  data-filter={f}
                  aria-pressed={filter === f}
                  onClick={() => set('filter', f, 'all')}
                  className={cn(
                    'hit-44 t-label z-[1] inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 transition-colors duration-300',
                    filter === f ? 'text-bg' : 'text-fg-2 hover:text-fg',
                  )}
                >
                  {f === 'all' ? 'All' : categoryLabel[f]}
                  <span className={filter === f ? 'text-bg/60' : 'text-fg-3'}>{String(count(f)).padStart(2, '0')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {shown.length} {shown.length === 1 ? 'project' : 'projects'}
      </p>

      {/* key on the filter so the new set fades in (calm) */}
      <div key={filter} className={cn(styles.fade, 'pt-8 lg:pt-10')}>
        <div className="grid gap-x-[calc(var(--gutter)*1.25)] gap-y-14 md:grid-cols-12 lg:gap-y-20">
          {rows(shown).flatMap((row, r) =>
            row.items.map((p) => (
              <WorkTile
                key={p.slug}
                project={p}
                priority={r === 0}
                aspect={row.aspect}
                sizes={row.span === 6 ? '(min-width: 768px) 50vw, 90vw' : '(min-width: 768px) 33vw, 90vw'}
                className={spanClass[row.span]}
              />
            )),
          )}
        </div>
      </div>
    </div>
  )
}

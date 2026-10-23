import type { Metadata } from 'next'
import { GridLines } from '@/components/ui/GridLines'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { code, references, tools, type ResourceLink } from '@/lib/resources'

export const metadata: Metadata = {
  title: 'Resources',
  description: 'The tools Ben Woods uses, a curated list of UI references, and code.',
}

function LinkList({ items, numbered = true }: { items: ResourceLink[]; numbered?: boolean }) {
  return (
    <ul>
      {items.map((l, i) => (
        <li key={l.href} className="border-b border-rule">
          <a
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className="group grid grid-cols-[2.5rem_minmax(0,1fr)_1.5rem] items-baseline gap-x-4 gap-y-1 py-4 transition-[padding,background-color] duration-200 hover:bg-sunken hover:pl-3 md:grid-cols-[3.5rem_minmax(0,16rem)_minmax(0,1fr)_1.5rem]"
          >
            <span className="t-label text-fg-3">{numbered ? String(i + 1).padStart(2, '0') : ''}</span>
            <span className="t-title text-[1.25rem]">{l.name}</span>
            <span className="col-start-2 text-fg-2 md:col-start-auto">{l.note}</span>
            <span
              aria-hidden
              className="col-start-3 row-start-1 text-right text-fg-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:col-start-auto md:row-start-auto"
            >
              ↗
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export default function ResourcesPage() {
  const refCount = references.reduce((n, g) => n + g.items.length, 0)
  return (
    <>
      <section className="relative isolate">
        <GridLines />
        <div className="shell relative pt-10 pb-12 lg:pt-16 lg:pb-16">
          <p className="t-label text-fg-3">(Index) Resources</p>
          <h1 className="t-display mt-6 text-[clamp(3.5rem,0.5rem+12vw,12rem)]">Resources</h1>
          <p className="t-lede mt-6 max-w-[34ch] text-fg-2">What I build with, where I look for proven patterns, and the code.</p>
        </div>
      </section>

      <section aria-labelledby="tools" className="border-t border-rule">
        <div className="shell py-14 lg:py-20">
          <SectionHeader index="01" id="tools" title="Tools I use" meta={`${tools.length} tools`} />
          <div className="mt-4">
            <LinkList items={tools} />
          </div>
        </div>
      </section>

      <section aria-labelledby="refs" className="border-t border-rule">
        <div className="shell py-14 lg:py-20">
          <SectionHeader index="02" id="refs" title="UI references" meta={`${refCount} sites`} />
          <p className="mt-6 max-w-[60ch] text-fg-2">
            Sites I use for UI patterns, components and references.
          </p>
          <div className="mt-8 grid gap-x-[var(--gutter)] gap-y-10 lg:grid-cols-12">
            {references.map((g) => (
              <div key={g.group} className="contents">
                <h3 className="t-label pt-4 text-fg-3 lg:col-span-3">{g.group}</h3>
                <div className="lg:col-span-9">
                  <LinkList items={g.items} numbered={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="code" data-surface="ink" className="relative isolate">
        <GridLines />
        <div className="shell relative py-14 lg:py-20">
          <SectionHeader index="03" id="code" title="Code" meta="GitHub" />
          <div className="mt-4">
            <LinkList items={code} />
          </div>
        </div>
      </section>
    </>
  )
}

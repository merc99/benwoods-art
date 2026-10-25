import type { Metadata } from 'next'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { code, references, tools, type ResourceLink } from '@/lib/resources'
import { PageIntro } from '@/components/ui/PageIntro'

export const metadata: Metadata = {
  title: 'Resources',
  description: 'The tools Ben Woods uses, a curated list of UI references, and code.',
  alternates: { canonical: '/resources' },
  openGraph: { type: 'website', siteName: 'Ben Woods', url: '/resources', title: 'Resources — Ben Woods', description: 'The tools Ben Woods uses, a curated list of UI references, and code.' },
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
            className="group grid grid-cols-[1.75rem_minmax(0,1fr)_1.25rem] items-baseline gap-x-3 gap-y-0 py-2.5 transition-[padding,background-color] md:gap-x-4 md:gap-y-1 md:py-4 duration-200 hover:bg-sunken hover:pl-3 md:grid-cols-[3.5rem_minmax(0,16rem)_minmax(0,1fr)_1.5rem]"
          >
            <span className="t-label text-fg-3">{numbered ? String(i + 1).padStart(2, '0') : ''}</span>
            <span className="t-title text-[1rem] md:text-[1.25rem]">{l.name}</span>
            <span className="col-start-2 text-[0.875rem] leading-snug text-fg-2 md:col-start-auto md:text-base">{l.note}</span>
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
      <PageIntro
        label="(Index) Resources"
        title="Resources"
        lede="What I build with, where I look for proven patterns, and the code."
        seed={43}
        bordered={false}
        revealLede={false}
        padding="pt-10 pb-12 lg:pt-16 lg:pb-16"
        titleSize="text-[clamp(3.5rem,0.5rem+12vw,12rem)]"
        ledeClass="mt-6 max-w-[34ch]"
      />

      <section aria-labelledby="tools" className="border-t border-rule">
        <div className="shell py-10 lg:py-20">
          <SectionHeader index="01" id="tools" title="Tools I use" meta={`${tools.length} tools`} />
          <div className="mt-4">
            <LinkList items={tools} />
          </div>
        </div>
      </section>

      <section aria-labelledby="refs" className="border-t border-rule">
        <div className="shell py-10 lg:py-20">
          <SectionHeader index="02" id="refs" title="UI references" meta={`${refCount} sites`} />
          <p className="mt-6 max-w-[60ch] text-fg-2">
            Sites I use for UI patterns, components and references.
          </p>
          <div className="mt-6 grid gap-x-[var(--gutter)] gap-y-6 lg:mt-8 lg:grid-cols-12 lg:gap-y-10">
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
        <div className="shell relative py-10 lg:py-20">
          <SectionHeader index="03" id="code" title="Code" meta="GitHub" />
          <div className="mt-4">
            <LinkList items={code} />
          </div>
        </div>
      </section>
    </>
  )
}

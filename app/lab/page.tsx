import type { Metadata } from 'next'
import Link from 'next/link'
import { DemoCard } from '@/components/lab/DemoCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { lab } from '@/lib/lab'
import { PageIntro } from '@/components/ui/PageIntro'

export const metadata: Metadata = {
  title: 'Lab',
  description: 'Live interaction demos from Ben Woods’ recent builds: Check-in, Chrometooth, 100K Club, MMO Nodes and Mega Roll.',
  alternates: { canonical: '/lab' },
  openGraph: { type: 'website', siteName: 'Ben Woods', url: '/lab', title: 'Lab — Ben Woods', description: 'Live interaction demos from Ben Woods’ recent builds: Check-in, Chrometooth, 100K Club, MMO Nodes and Mega Roll.' },
}

const live = [
  { label: 'Check-in', href: 'https://check-in-web-six.vercel.app', note: 'Live build · simulated crew' },
  { label: 'MMO Nodes', href: 'https://mmo-nodes.netlify.app/', note: 'Playable prototype' },
  { label: '100K Club', href: 'https://100k-club.netlify.app', note: 'Landing page' },
  { label: 'Rat Mats', href: 'https://rat-mats.netlify.app/', note: 'Storefront and archive' },
  { label: 'Mega Roll', href: 'https://mega-roll.netlify.app/', note: 'Landing page' },
  { label: 'Economy simulator', href: '/lab/economy-simulator/index.html', note: 'MMO Nodes · two years of $MMO' },
  { label: 'GitHub', href: 'https://github.com/merc99', note: 'Code' },
]

export default function LabPage() {
  const count = lab.reduce((n, g) => n + g.demos.length, 0)
  let n = 0
  return (
    <>
      <PageIntro
        label="(Index) Lab"
        meta={`${String(count).padStart(2, '0')} live demos`}
        title="Lab"
        lede="Interactive pieces from recent projects."
        seed={31}
        bordered={false}
        revealLede={false}
        padding="pt-10 pb-12 lg:pt-16 lg:pb-16"
        titleSize="text-[clamp(4.5rem,1rem+16vw,15rem)]"
        ledeClass="mt-6 max-w-[36ch]"
      >

          <ul className="mt-8 grid grid-cols-2 border-t border-rule-strong lg:mt-12 lg:grid-cols-4">
            {live.map((l) => (
              <li key={l.label} className="border-b border-rule odd:border-r lg:border-r lg:[&:nth-child(4n)]:border-r-0">
                <a
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex h-full items-baseline justify-between gap-2 py-3 hover:bg-sunken max-lg:[li:nth-child(even)_&]:pl-3 max-lg:[li:nth-child(odd)_&]:pr-2 lg:gap-4 lg:px-4 lg:py-4"
                >
                  <span>
                    <span className="t-title block text-[1.0625rem] lg:text-[1.375rem]">{l.label}</span>
                    <span className="t-label mt-1 block text-[0.75rem] text-fg-3 lg:text-[0.8125rem]">{l.note}</span>
                  </span>
                  <span aria-hidden className="text-fg-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
      </PageIntro>

      {lab.map((g, gi) => (
        <section key={g.slug} aria-labelledby={`lab-${g.slug}`} className="border-t border-rule">
          <div className="shell py-14 lg:py-20">
            <SectionHeader
              index={String(gi + 1).padStart(2, '0')}
              id={`lab-${g.slug}`}
              title={g.project}
              meta={`${g.demos.length} ${g.demos.length === 1 ? 'demo' : 'demos'}`}
              href={`/work/${g.slug}`}
              hrefLabel="Case study"
            />
            <div className="mt-8 grid gap-x-[var(--gutter)] gap-y-12 lg:grid-cols-2">
              {g.demos.map((d) => {
                n++
                return (
                  <DemoCard key={d.id} demo={d} index={n} project={g.project} />
                )
              })}
            </div>
            {g.liveUrl && (
              <p className="t-label mt-10 text-fg-3">
                See it in context:{' '}
                <a href={g.liveUrl} target="_blank" rel="noreferrer" className="text-fg underline decoration-rule-strong underline-offset-4 hover:decoration-fg">
                  {g.project} live ↗
                </a>
                {' · '}
                <Link href={`/work/${g.slug}`} className="text-fg underline decoration-rule-strong underline-offset-4 hover:decoration-fg">
                  Case study
                </Link>
              </p>
            )}
          </div>
        </section>
      ))}
    </>
  )
}

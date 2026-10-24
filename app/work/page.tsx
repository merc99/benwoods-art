import type { Metadata } from 'next'
import { WorkIndex } from '@/components/work/WorkIndex'
import { getProjects, toCard } from '@/lib/work'
import { PageIntro } from '@/components/ui/PageIntro'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Products, brand, illustration and physical goods by Ben Woods.',
  alternates: { canonical: '/work' },
  openGraph: { type: 'website', siteName: 'Ben Woods', url: '/work', title: 'Work — Ben Woods', description: 'Products, brand, illustration and physical goods by Ben Woods.' },
}

export default function WorkPage() {
  const projects = getProjects().map(toCard)
  const years = projects.map((p) => p.year)

  return (
    <>
      <PageIntro
        label="(Index) Work"
        meta={`${String(projects.length).padStart(2, '0')} projects · ${Math.min(...years)}—${Math.max(...years)}`}
        title="Work"
        lede="Product design, brand, illustration and physical products."
        seed={11}
        bordered={false}
        revealLede={false}
        padding="pt-10 pb-10 lg:pt-16 lg:pb-14"
        titleSize="text-[clamp(4.5rem,1rem+16vw,15rem)]"
        ledeClass="mt-6 max-w-[34ch]"
      />
      <section className="relative isolate">
        <div className="shell relative pb-24">
          <h2 className="sr-only">Projects</h2>
          <WorkIndex projects={projects} />
        </div>
      </section>
    </>
  )
}

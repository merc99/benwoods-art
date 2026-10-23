import type { Metadata } from 'next'
import { GridLines } from '@/components/ui/GridLines'
import { WorkIndex } from '@/components/work/WorkIndex'
import { getProjects, toCard } from '@/lib/work'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Products, brand, illustration and physical goods by Ben Woods.',
}

export default function WorkPage() {
  const projects = getProjects().map(toCard)
  const years = projects.map((p) => p.year)

  return (
    <>
      <section className="relative isolate">
        <GridLines />
        <div className="shell relative pt-10 pb-10 lg:pt-16 lg:pb-14">
          <div className="t-label flex justify-between text-fg-3">
            <span>(Index) Work</span>
            <span>
              {String(projects.length).padStart(2, '0')} projects · {Math.min(...years)}—{Math.max(...years)}
            </span>
          </div>
          <h1 className="t-display mt-6 text-[clamp(4.5rem,1rem+16vw,15rem)]">Work</h1>
          <p className="t-lede mt-6 max-w-[34ch] text-fg-2">
            Product design, brand, illustration and physical products.
          </p>
        </div>
      </section>
      <section className="relative isolate">
        <GridLines />
        <div className="shell relative pb-24">
          <h2 className="sr-only">Projects</h2>
          <WorkIndex projects={projects} />
        </div>
      </section>
    </>
  )
}

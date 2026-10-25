import { FeaturedShowcase } from '@/components/home/FeaturedShowcase'
import { Hero } from '@/components/home/Hero'
import { MerchGrid } from '@/components/merch/MerchGrid'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { WorkTile } from '@/components/work/WorkTile'
import { allMerch, homeMerch } from '@/lib/merch'
import { bySlug } from '@/lib/work'

const half = '(min-width: 768px) 50vw, 100vw'
const third = '(min-width: 768px) 33vw, 100vw'
// One ratio per row so every row scans cleanly: 2:1 full width, 16:10 halves, 4:5 for illustration.
const grid = 'grid gap-x-[calc(var(--gutter)*1.25)] gap-y-14 md:grid-cols-12 lg:gap-y-20'

export default function Home() {
  const [checkin, club, mmo] = bySlug(['checkin', '100k-club', 'mmo-nodes'])
  const [ratMats, megaRoll] = bySlug(['rat-mats', 'mega-roll'])
  const [dreamline, mamies, gilded, flexible] = bySlug(['dreamline', 'mamie-s-sunday-best', 'gildedcan', 'flexible'])
  const [evershift, wagdie, retro] = bySlug(['solar-punk', 'wagdie', 'retrofuturism'])

  return (
    <>
      <Hero />

      {/* 01 Featured builds: a full-bleed ink section in both themes */}
      <section id="selected" data-surface="ink" aria-labelledby="featured-title" className="relative isolate">
        <div className="shell relative pt-12 pb-20 lg:pt-20 lg:pb-28">
          <SectionHeader index="01" id="featured-title" title="Featured builds" meta="Designed and built" href="/work" hrefLabel="All work" />
          <div className={`mt-10 lg:mt-12 ${grid}`}>
            <div className="md:col-span-12">
              <FeaturedShowcase
                project={checkin}
                screenshot="/work/checkin/feed-dark-hq.webp"
                screenshotAlt="Check-in’s desktop feed in dark mode, with a crew banner, posts and today’s check-ins."
                
              />
            </div>
            <div className="md:col-span-6">
              <FeaturedShowcase
                half
                project={club}
                screenshot="/work/100k-club/featured-hero.webp"
                screenshotAlt="The 100K Club landing page, with the gold crest on smoky navy."
              />
            </div>
            <div className="md:col-span-6">
              <FeaturedShowcase
                half
                project={mmo}
                screenshot="/work/mmo-nodes/featured-landing.webp"
                screenshotAlt="The MMO Nodes landing page, with the wordmark on a lilac-to-sky gradient."
              />
            </div>
          </div>
        </div>
      </section>

      {/* 02 Products */}
      <section aria-labelledby="products-title" className="relative isolate">
        <div className="shell relative py-20 lg:py-28">
          <SectionHeader index="02" id="products-title" title="Products" meta="Brand, product, packaging" />
          <div className={`mt-10 lg:mt-12 ${grid}`}>
            <WorkTile project={ratMats} showSummary sizes={half} className="md:col-span-6" />
            <WorkTile project={megaRoll} showSummary sizes={half} className="md:col-span-6" />
          </div>
        </div>
      </section>

      {/* 03 Brand and illustration */}
      <section aria-labelledby="brand-title" className="relative isolate border-t border-rule">
        <div className="shell relative py-20 lg:py-28">
          <SectionHeader index="03" id="brand-title" title="Brand & illustration" meta="2022—2025" />
          <div className={`mt-10 lg:mt-12 ${grid}`}>
            {/* newest first: 2025, 2025, 2024, 2024, then the illustration series 2024, 2023, 2022 */}
            <WorkTile project={dreamline} sizes={half} className="md:col-span-6" />
            <WorkTile project={mamies} sizes={half} className="md:col-span-6" />
            <WorkTile project={gilded} sizes={half} className="md:col-span-6" />
            <WorkTile project={flexible} sizes={half} className="md:col-span-6" />
            <WorkTile project={evershift} sizes={third} aspect="aspect-[4/5]" className="md:col-span-4" />
            <WorkTile project={wagdie} sizes={third} aspect="aspect-[4/5]" className="md:col-span-4" />
            <WorkTile project={retro} sizes={third} aspect="aspect-[4/5]" className="md:col-span-4" />
          </div>
        </div>
      </section>

      {/* 04 Merch */}
      <section aria-labelledby="merch-title" className="relative isolate border-t border-rule">
        <div className="shell relative py-20 lg:py-28">
          <SectionHeader index="04" id="merch-title" title="Merch" href="/work/merch" hrefLabel={`All ${allMerch.length} pieces`} />
          <div className="mt-10 lg:mt-12">
            <MerchGrid items={homeMerch} />
          </div>
        </div>
      </section>
    </>
  )
}

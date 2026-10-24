import { FeaturedShowcase } from '@/components/home/FeaturedShowcase'
import { Hero } from '@/components/home/Hero'
import { MerchGrid } from '@/components/merch/MerchGrid'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { WorkTile } from '@/components/work/WorkTile'
import { homeMerch } from '@/lib/merch'
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
        <div className="shell relative py-20 lg:py-28">
          <SectionHeader index="01" id="featured-title" title="Featured builds" meta="Designed and built" href="/work" hrefLabel="All work" />
          <div className={`mt-10 lg:mt-12 ${grid}`}>
            <div className="md:col-span-12">
              <FeaturedShowcase
                project={checkin}
                screenshot="/work/checkin/feed-dark-hq.webp"
                live={['Maya checked in · 5x5 squats', '3 of 5 in today', 'Priya reacted 🙏', '22-day crew streak']}
                screenshotAlt="Check-in's desktop feed in dark mode: a sky-blue 5am Lifters crew banner, a join request and posts with reactions, beside a rail showing 2 of 5 crewmates in today."
                
              />
            </div>
            <div className="md:col-span-6">
              <FeaturedShowcase
                half
                project={club}
                screenshot="/work/100k-club/featured-hero.webp"
                live={['Slipboard graded a slip · Win +2.4u', 'New rank: Rising Sharp', '7-leg parlay graded']}
                screenshotAlt="The 100K Club landing page hero: the gold 100K Club crest with sports balls on a smoky navy backdrop, above the line Where every slip counts, and anyone can rise."
              />
            </div>
            <div className="md:col-span-6">
              <FeaturedShowcase
                half
                project={mmo}
                screenshot="/work/mmo-nodes/featured-landing.webp"
                live={['+310,492 MMO earned today', 'Merc reached level 18', 'Renzo Castle cleared']}
                screenshotAlt="The MMO Nodes landing page: a huge mmo nodes wordmark and Stake. Level. Earn. on a lilac-to-sky gradient, with a black START button."
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
            <WorkTile project={dreamline} sizes={half} className="md:col-span-6" />
            <WorkTile project={mamies} sizes={half} className="md:col-span-6" />
            <WorkTile project={evershift} sizes={third} aspect="aspect-[4/5]" className="md:col-span-4" />
            <WorkTile project={wagdie} sizes={third} aspect="aspect-[4/5]" className="md:col-span-4" />
            <WorkTile project={retro} sizes={third} aspect="aspect-[4/5]" className="md:col-span-4" />
            <WorkTile project={gilded} sizes={half} className="md:col-span-6" />
            <WorkTile project={flexible} sizes={half} className="md:col-span-6" />
          </div>
        </div>
      </section>

      {/* 04 Merch */}
      <section aria-labelledby="merch-title" className="relative isolate border-t border-rule">
        <div className="shell relative py-20 lg:py-28">
          <SectionHeader index="04" id="merch-title" title="Merch" meta={`${homeMerch.length} pieces`} />
          <div className="mt-10 lg:mt-12">
            <MerchGrid items={homeMerch} />
          </div>
        </div>
      </section>
    </>
  )
}

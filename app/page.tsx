import { FeaturedShowcase } from '@/components/home/FeaturedShowcase'
import { Hero } from '@/components/home/Hero'
import { MerchGrid } from '@/components/merch/MerchGrid'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { WorkTile } from '@/components/work/WorkTile'
import { allMerch, homeMerch } from '@/lib/merch'
import { bySlug } from '@/lib/work'

const half = '(min-width: 768px) 50vw, 90vw'
const quarter = '(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 90vw'
// One ratio per row so every row scans cleanly: 2:1 full width, 16:10 halves, 4:5 for illustration (four across).
const grid = 'grid gap-x-[calc(var(--gutter)*1.25)] gap-y-14 md:grid-cols-12 lg:gap-y-20'

export default function Home() {
  const [checkin, chrometooth, club, mmo] = bySlug(['checkin', 'chrometooth', '100k-club', 'mmo-nodes'])
  const [ratMats, megaRoll] = bySlug(['rat-mats', 'mega-roll'])
  const [dreamline, mamies] = bySlug(['dreamline', 'mamie-s-sunday-best'])
  const [squeaky, evershift, wagdie, retro] = bySlug(['squeaky-feet', 'solar-punk', 'wagdie', 'retrofuturism'])

  return (
    <>
      <Hero />

      {/* 01 Featured builds: follows the theme like the sections below it */}
      <section id="selected" aria-labelledby="featured-title" className="relative isolate">
        <div className="shell relative pt-20 pb-14 lg:pt-28 lg:pb-20">
          <SectionHeader index="01" id="featured-title" title="Featured builds" meta="Designed and built" href="/work" hrefLabel="All work" />
          <div className={`mt-10 lg:mt-12 ${grid}`}>
            <div className="md:col-span-12">
              <FeaturedShowcase
                project={checkin}
                screenshot="/work/checkin/feed-dark-v2.webp"
                screenshotAlt="Check-in’s desktop feed in dark mode, with a holographic crew banner, posts and today’s check-ins."
              />
            </div>
            <div className="md:col-span-12">
              <FeaturedShowcase
                project={chrometooth}
                screenshot="/work/chrometooth/site-dashboard.webp"
                screenshotAlt="The Chrometooth dashboard in dark mode, with the Enamel score, a network map of 12 devices and the threat queue."
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
      <section aria-labelledby="products-title" className="relative isolate border-t border-rule">
        <div className="shell relative py-20 lg:py-28">
          <SectionHeader index="02" id="products-title" title="Products" meta="Brand · Product · Packaging" />
          <div className={`mt-10 lg:mt-12 ${grid}`}>
            <WorkTile project={ratMats} showSummary sizes={half} className="md:col-span-6" />
            <WorkTile project={megaRoll} showSummary sizes={half} className="md:col-span-6" />
          </div>
        </div>
      </section>

      {/* 03 Brand and illustration */}
      <section aria-labelledby="brand-title" className="relative isolate border-t border-rule">
        <div className="shell relative py-20 lg:py-28">
          <SectionHeader index="03" id="brand-title" title="Brand & illustration" meta="2022—2026" />
          <div className={`mt-10 lg:mt-12 ${grid}`}>
            {/* newest first: brand 2025, 2025; then illustration 2026, 2024, 2023, 2022, four across */}
            <WorkTile project={dreamline} sizes={half} className="md:col-span-6" />
            <WorkTile project={mamies} sizes={half} className="md:col-span-6" />
            {[squeaky, evershift, wagdie, retro].map((p) => (
              <WorkTile key={p.slug} project={p} sizes={quarter} aspect="aspect-[4/5]" className="md:col-span-6 lg:col-span-3" />
            ))}
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

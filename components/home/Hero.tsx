import { site } from '@/lib/site'
import { GridLines } from '@/components/ui/GridLines'
import { StatusStrip } from './StatusStrip'
import { DecodeLine } from './DecodeLine'
import styles from './Hero.module.css'

/**
 * The hero moment (motion budget: once per visit). The name rises out of two masks, the lede fades up and the
 * mono line decodes. All of it is CSS on server-rendered text, so nothing waits on JavaScript.
 */
export function Hero() {
  const { hero } = site
  const [first, last] = hero.title.split(' ')
  const monoLine = `${hero.disciplines.join(' · ')} — ${hero.location}`

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <GridLines />
      <div className="shell relative">
        <StatusStrip />

        <div className="t-label flex justify-between pt-5 text-fg-3">
          <span>Portfolio · Index 2015—{new Date().getFullYear()}</span>
          <span className="hidden sm:inline">{site.coords}</span>
        </div>

        <h1
          id="hero-title"
          className="t-display mt-6 text-[clamp(5.5rem,25vw,18rem)] sm:mt-10 lg:-ml-[0.04em]"
        >
          <span className={styles.mask}>
            <span className={styles.rise}>{first}</span>
          </span>
          <span className={`${styles.mask} lg:pl-[calc(100%/12*3)]`}>
            <span className={styles.rise} style={{ animationDelay: '90ms' }}>
              {last}
            </span>
          </span>
        </h1>

        <div className="mt-10 grid grid-cols-4 gap-x-[var(--gutter)] gap-y-8 pb-16 lg:mt-14 lg:grid-cols-12 lg:pb-24">
          <div className={`${styles.fade} col-span-4 lg:col-span-6 lg:col-start-4`}>
            <p className="t-lede max-w-[30ch] text-fg">{hero.lede}</p>
            <DecodeLine text={monoLine} className="t-label mt-6 block text-fg-2" />
          </div>
          <dl className={`${styles.fade} col-span-4 self-end lg:col-span-3 lg:col-start-10`} style={{ animationDelay: '260ms' }}>
            {hero.disciplines.map((d, i) => (
              <div key={d} className="flex items-baseline justify-between gap-4 border-t border-rule py-2.5">
                <dt className="t-label text-fg-3">{String(i + 1).padStart(2, '0')}</dt>
                <dd className="text-right font-medium">{d}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 border-y border-rule py-2.5">
              <dt className="t-label text-fg-3">Based</dt>
              <dd className="text-right font-medium">{hero.location}</dd>
            </div>
          </dl>
        </div>

        <div className="t-label flex items-center justify-between border-t border-rule py-3 text-fg-3">
          <a href="#selected" className="inline-flex h-11 items-center gap-2 hover:text-fg">
            Selected work <span aria-hidden>↓</span>
          </a>
          <span>(01—04)</span>
        </div>
      </div>
    </section>
  )
}

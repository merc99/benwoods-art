import { site } from '@/lib/site'
import styles from './Hero.module.css'
import { PixelTiles } from '@/components/fx/PixelTiles'

/**
 * The hero moment (motion budget: once per visit). The name rises out of two masks and the subline fades up.
 * All of it is CSS on server-rendered text, so nothing waits on JavaScript. It fills the first screen, with
 * the Selected work line at its foot, so the work below starts after a real break.
 */
export function Hero() {
  const { hero } = site
  const [first, last] = hero.title.split(' ')

  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col overflow-hidden">
      <PixelTiles seed={7} tall />
      <div className="shell relative flex w-full flex-1 flex-col">
        <h1
          id="hero-title"
          className="t-display pt-12 text-[min(clamp(5.5rem,25vw,18rem),max(5.5rem,27svh))] sm:pt-16 lg:-ml-[0.04em] lg:pt-[min(5rem,7svh)]"
        >
          {/* one accessible name; the two animated lines are visual only */}
          <span className="sr-only">{hero.title}</span>
          <span aria-hidden="true" className={styles.mask}>
            <span className={styles.rise}>{first}</span>
          </span>
          <span aria-hidden="true" className={`${styles.mask} lg:pl-[calc(100%/12*3)]`}>
            <span className={styles.rise} style={{ animationDelay: '90ms' }}>
              {last}
            </span>
          </span>
        </h1>

        <div className="mt-10 grid grid-cols-4 gap-x-[var(--gutter)] pb-16 lg:mt-[min(3.5rem,5svh)] lg:grid-cols-12 lg:pb-14">
          <p className={`${styles.fade} t-lede col-span-4 max-w-[30ch] text-fg lg:col-span-6 lg:col-start-4`}>{hero.lede}</p>
        </div>

        <div className="t-label mt-auto flex items-center justify-between border-t border-rule py-3 text-fg-3">
          <a href="#selected" className="group inline-flex h-11 items-center gap-2 hover:text-fg">
            Selected work <span aria-hidden className={styles.bob}>↓</span>
          </a>
          <span>(01—04)</span>
        </div>
      </div>
    </section>
  )
}

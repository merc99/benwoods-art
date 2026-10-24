import Link from 'next/link'
import { PixelTiles } from '@/components/fx/PixelTiles'
import { links, nav, site } from '@/lib/site'
import { Clock } from './Clock'
import { MercPeek } from './MercPeek'

/**
 * One band over the pixel tiles: Contact and the email on the left, Index and Elsewhere on the right, with
 * the last columns kept clear for Merc, who peeks up at the band's bottom right. Under it, one quiet line.
 */
export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer data-surface="ink" className="relative isolate overflow-hidden">
      <div className="relative isolate overflow-hidden">
        <PixelTiles seed={53} />
        <div className="shell relative grid grid-cols-2 gap-x-6 gap-y-12 pt-16 pb-32 lg:grid-cols-12 lg:pt-24 lg:pb-28">
          <div className="col-span-2 lg:col-span-6">
            <h2 className="t-label text-fg-3">Contact</h2>
            <a
              href={`mailto:${site.email}`}
              className="hit-44 mt-5 inline-flex items-center gap-3 border-b border-rule-strong pb-1.5 max-w-full text-[clamp(1.2rem,0.8rem+1.9vw,2.625rem)] leading-tight text-fg transition-colors hover:border-fg"
            >
              {site.email} <span aria-hidden className="text-fg-2">↗</span>
            </a>
          </div>

          <nav aria-labelledby="footer-index" className="lg:col-span-2 lg:col-start-7">
            <h3 id="footer-index" className="t-label text-fg-3">
              Index
            </h3>
            <ul className="mt-3">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hit-44 inline-flex h-9 items-center text-fg-2 hover:text-fg">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <h3 className="t-label text-fg-3">Elsewhere</h3>
            <ul className="mt-3">
              {/* the email is right there on the left, so it is not repeated here */}
              {links.filter((l) => !l.href.startsWith('mailto:')).map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    {...(l.href.startsWith('http') && { target: '_blank', rel: 'noreferrer' })}
                    className="hit-44 inline-flex h-9 items-center gap-1.5 text-fg-2 hover:text-fg"
                  >
                    {l.label} <span aria-hidden className="text-fg-3">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <MercPeek />
        </div>
      </div>

      <div className="shell">
        <div className="t-label flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-rule py-4 text-fg-3">
          <span>© {year} Ben Woods</span>
          <span className="max-sm:order-3 max-sm:w-full">
            {site.hero.location} · <Clock />
          </span>
          <a href="#top" className="inline-flex h-11 items-center hover:text-fg">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  )
}

import Link from 'next/link'
import { links, nav, site } from '@/lib/site'
import { GridLines } from '@/components/ui/GridLines'
import { Clock } from './Clock'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer data-surface="ink" className="relative isolate overflow-hidden">
      <GridLines />
      <div className="shell relative pt-20 pb-8 lg:pt-28">
        <p className="t-label text-fg-3">Contact</p>
        <h2 className="t-display mt-4 max-w-[14ch] text-[clamp(3rem,1.5rem+7vw,8.5rem)]">Let&apos;s build something.</h2>
        <a
          href={`mailto:${site.email}`}
          className="t-lede mt-8 inline-flex items-center gap-3 border-b border-rule-strong pb-1 text-fg transition-colors hover:border-fg"
        >
          {site.email} <span aria-hidden>↗</span>
        </a>

        <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-rule pt-8 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <h3 className="t-label text-fg-3">Index</h3>
            <ul className="mt-3">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="inline-flex h-9 items-center text-fg-2 hover:text-fg">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3">
            <h3 className="t-label text-fg-3">Elsewhere</h3>
            <ul className="mt-3">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    {...(l.href.startsWith('http') && { target: '_blank', rel: 'noreferrer' })}
                    className="inline-flex h-9 items-center gap-1.5 text-fg-2 hover:text-fg"
                  >
                    {l.label} <span aria-hidden className="text-fg-3">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 lg:col-span-6">
            <h3 className="t-label text-fg-3">Colophon</h3>
            <dl className="mt-3 text-fg-2">
              {[
                ['Wordmark', 'Munro, Ten by Twenty'],
                ['Headlines', 'Space Grotesk'],
                ['Text', 'Inter'],
                ['System', 'Roboto Mono'],
                ['Built with', 'Next.js, Tailwind, Motion'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 border-b border-rule py-2">
                  <dt className="t-label pt-1 text-fg-3">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="t-label mt-16 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-fg-3">
          <span>© {year} Ben Woods</span>
          <span>
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

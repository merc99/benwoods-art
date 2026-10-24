import type { Metadata } from 'next'
import { RevealText } from '@/components/fx/RevealText'
import Image from 'next/image'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { GlyphFieldLazy } from '@/components/about/GlyphFieldLazy'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { approach, bio, experience, stats } from '@/lib/about'
import { links, site } from '@/lib/site'
import { latestPlaylist } from '@/lib/playlists'

export const metadata: Metadata = {
  title: 'About',
  description: 'Ben Woods is a designer in Nashville working across product design, front end, brand and print.',
}

export default function AboutPage() {
  return (
    <>
      {/* the glyph field: the page's one big moment, full bleed and dark in both themes */}
      <section data-surface="ink" aria-labelledby="about-title" className="relative isolate overflow-hidden">
        <GlyphFieldLazy className="absolute inset-0" />
        <div
          className="pointer-events-none relative flex flex-col justify-between"
          style={{ minHeight: 'max(560px, calc(88svh - var(--header-h)))' }}
        >
          <div className="shell t-label flex justify-between pt-6 text-fg-3">
            <span>(Index) About</span>
            <span className="hidden sm:inline">Glyph field · Click to ripple · Drag the D20</span>
          </div>
          <div className="shell pb-10 lg:pb-14">
            <h1 id="about-title" className="t-display text-[clamp(4.5rem,1rem+16vw,15rem)]">
              About
            </h1>
            <p className="t-label mt-4 text-fg-2">
              {site.hero.disciplines.join(' · ')} — {site.hero.location}
            </p>
          </div>
        </div>
      </section>

      {/* bio */}
      <section className="relative isolate">
        <div className="shell relative grid gap-x-[var(--gutter)] gap-y-10 py-16 lg:grid-cols-12 lg:py-24">
          <p className="t-label text-fg-3 lg:col-span-3">(01) Bio</p>
          <div className="max-w-[60ch] lg:col-span-7 lg:col-start-4">
            <RevealText as="p" text={bio[0]} className="t-lede text-fg" />
            {bio.slice(1).map((p) => (
              <p key={p.slice(0, 20)} className="mt-6 text-[1.0625rem] leading-[1.65] text-fg lg:text-[1.125rem]">
                {p}
              </p>
            ))}
            <p className="mt-6 text-[1.0625rem] leading-[1.65] text-fg-2 lg:text-[1.125rem]">{approach}</p>
            <div className="mt-10 flex flex-wrap gap-2">
              <a
                href={site.resume}
                download="Benjamin Woods - Resume.pdf"
                className="t-label inline-flex h-11 items-center gap-2 bg-fg px-5 text-bg transition-transform duration-[var(--dur-chrome)] active:scale-[0.97]"
              >
                <Download className="size-4" strokeWidth={1.5} aria-hidden /> Download resume (PDF)
              </a>
              <a
                href={`mailto:${site.email}`}
                className="t-label inline-flex h-11 items-center gap-2 border border-rule-strong px-5 text-fg transition-colors hover:border-fg"
              >
                Email me <span aria-hidden>↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* listening: the latest monthly playlist */}
      <section aria-labelledby="listening" className="border-t border-rule">
        <div className="shell flex flex-wrap items-center gap-x-6 gap-y-4 py-6">
          <h2 id="listening" className="t-label w-full text-fg-2 sm:w-auto">
            Listening
          </h2>
          <a href={latestPlaylist.url} target="_blank" rel="noreferrer" className="group flex items-center gap-4">
            <span className="relative block size-16 shrink-0 overflow-hidden bg-sunken">
              <Image src={latestPlaylist.cover} alt="" fill sizes="64px" className="object-cover" />
              <span aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-rule ring-inset" />
            </span>
            <span>
              <span className="t-title block text-[1.375rem]">{latestPlaylist.title}</span>
              <span className="t-label mt-1 block text-fg-2 group-hover:text-fg">
                {latestPlaylist.month} · Listen on Spotify <span aria-hidden>↗</span>
              </span>
            </span>
          </a>
          <Link href="/work/playlist-covers" className="t-label ml-auto inline-flex h-11 items-center gap-1.5 text-fg-2 hover:text-fg">
            All playlist covers <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* numbers */}
      <section aria-label="In numbers" className="border-y border-rule">
        <dl className="shell grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`py-8 lg:py-10 ${i % 2 ? 'pl-[var(--gutter)]' : ''} ${i > 0 ? 'lg:border-l lg:border-rule lg:pl-[var(--gutter)]' : ''} ${i % 2 ? 'border-l border-rule' : ''} ${i > 1 ? 'max-lg:border-t max-lg:border-rule' : ''}`}>
              <dt className="t-label text-fg-3">{s.label}</dt>
              <dd className="t-display mt-3 text-[clamp(3rem,2rem+3vw,5rem)]">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* experience */}
      <section aria-labelledby="experience">
        <div className="shell py-16 lg:py-24">
          <SectionHeader index="02" id="experience" title="Experience" meta="2015—now" />
          <ol className="mt-4">
            {experience.map((e) => (
              <li key={`${e.org}-${e.role}`} className="grid gap-x-[var(--gutter)] gap-y-2 border-b border-rule py-6 lg:grid-cols-12">
                <p className="t-label pt-1 text-fg-3 lg:col-span-2">{e.years}</p>
                <div className="lg:col-span-4">
                  <h3 className="t-title text-[1.5rem]">{e.org}</h3>
                  <p className="mt-1 text-fg-2">{e.role}</p>
                </div>
                <p className="max-w-[56ch] text-fg lg:col-span-6">{e.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* links */}
      <section id="contact" aria-labelledby="links" className="scroll-mt-[var(--header-h)] border-t border-rule">
        <div className="shell py-16 lg:py-24">
          <SectionHeader index="03" id="links" title="Elsewhere" meta={`${links.length} links`} />
          <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3">
            {links.map((l) => (
              <li key={l.label} className="border-b border-rule">
                <a
                  href={l.href}
                  {...(l.href.startsWith('http') && { target: '_blank', rel: 'noreferrer' })}
                  className="group flex items-baseline justify-between gap-4 py-5 pr-4 transition-[padding,background-color] duration-200 hover:bg-sunken hover:pl-3"
                >
                  <span>
                    <span className="t-title block text-[1.5rem]">{l.label}</span>
                    <span className="t-label mt-1 block text-fg-3">{l.handle}</span>
                  </span>
                  <span aria-hidden className="text-fg-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    ↗
                  </span>
                </a>
              </li>
            ))}
            <li className="border-b border-rule">
              <a href={site.resume} download="Benjamin Woods - Resume.pdf" className="group flex items-baseline justify-between gap-4 py-5 pr-4 transition-[padding,background-color] duration-200 hover:bg-sunken hover:pl-3">
                <span>
                  <span className="t-title block text-[1.5rem]">Resume</span>
                  <span className="t-label mt-1 block text-fg-3">PDF</span>
                </span>
                <span aria-hidden className="text-fg-3">↓</span>
              </a>
            </li>
          </ul>
        </div>
      </section>
    </>
  )
}

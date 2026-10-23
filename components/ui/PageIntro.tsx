import { GridLines } from './GridLines'

/** Page title band for inner pages: mono index line, big uppercase title, optional lede. */
export function PageIntro({ label, title, lede, children }: { label: string; title: string; lede?: string; children?: React.ReactNode }) {
  return (
    <section className="relative isolate border-b border-rule">
      <GridLines />
      <div className="shell relative pt-10 pb-14 lg:pt-16 lg:pb-20">
        <p className="t-label text-fg-3">{label}</p>
        <h1 className="t-display mt-6 text-[clamp(3.5rem,1rem+12vw,12rem)]">{title}</h1>
        {lede && <p className="t-lede mt-8 max-w-[36ch] text-fg-2">{lede}</p>}
        {children}
      </div>
    </section>
  )
}

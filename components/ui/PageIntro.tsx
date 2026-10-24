import { RevealText } from '@/components/fx/RevealText'
import { PixelTiles } from '@/components/fx/PixelTiles'

/** Page title band for inner pages: mono index line, big uppercase title, optional lede. */
export function PageIntro({ label, title, lede, children }: { label: string; title: string; lede?: string; children?: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-rule">
      <PixelTiles seed={23} />
      <div className="shell relative pt-10 pb-14 lg:pt-16 lg:pb-20">
        <p className="t-label text-fg-3">{label}</p>
        <h1 className="t-display mt-6 text-[clamp(3.5rem,1rem+12vw,12rem)]">{title}</h1>
        {lede && <RevealText as="p" text={lede} className="t-lede mt-8 max-w-[36ch] text-fg-2" />}
        {children}
      </div>
    </section>
  )
}

import type { Ink } from '@/lib/work'
import { Bezel, bezelRadius } from '@/components/ui/Bezel'
import { cn } from '@/lib/cn'

/**
 * A project's inks as swatches on its own paper, in the site's card frame: one chip per ink with its
 * name, what it's used for and its hex. The paper is a fixed color in both themes, so the text on it is too.
 */
export function Palette({ inks, paper = '#ecdeb4' }: { inks: Ink[]; paper?: string }) {
  return (
    <Bezel size="wide">
      <div style={{ background: paper }} className={cn('px-[clamp(1.25rem,4vw,3.5rem)] py-[clamp(1.75rem,5vw,4rem)]', bezelRadius.wide.inner)}>
        <ul className="grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {inks.map((ink) => (
            <li key={ink.hex}>
              <span aria-hidden style={{ background: ink.hex }} className="block aspect-square rounded-[6px] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)]" />
              <p className="t-title mt-4 text-[1.25rem] text-[#1d1a14]">{ink.name}</p>
              <p className="mt-1.5 text-[0.9375rem] leading-snug text-[#3f392d]">{ink.use}</p>
              <p className="t-label mt-2 text-[#57503f]">{ink.hex.toUpperCase()}</p>
            </li>
          ))}
        </ul>
      </div>
    </Bezel>
  )
}

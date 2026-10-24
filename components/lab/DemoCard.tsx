import { DemoStage } from '@/components/lab/DemoStage'
import type { Demo } from '@/lib/lab'
import { cn } from '@/lib/cn'

/** One live demo in its labelled frame with a note under it (the Lab page and case studies share it). */
export function DemoCard({ demo, index, project }: { demo: Demo; index: number; project: string }) {
  return (
    <article className={cn('flex min-w-0 flex-col', demo.wide && 'lg:col-span-2')}>
      <div className="t-label flex items-center justify-between gap-4 border border-b-0 border-rule px-3 py-2 text-fg-3">
        <span>
          {String(index).padStart(2, '0')} · <span className="text-fg">{demo.title}</span>
        </span>
        <span>{project}</span>
      </div>
      <div
        className={cn('relative h-[var(--h)] overflow-hidden border border-rule', demo.autoOnPhone && 'max-lg:h-auto')}
        style={{ ['--h' as string]: `${demo.height ?? 360}px` }}
      >
        <DemoStage id={demo.id} />
      </div>
      <p className="mt-3 max-w-[60ch] text-fg-2">{demo.note}</p>
    </article>
  )
}

import { Clock } from '@/components/layout/Clock'
import { site } from '@/lib/site'

/** The mono status strip. Edit the text in lib/site.ts (`status`). */
export function StatusStrip() {
  return (
    <div className="t-label flex flex-col gap-x-6 gap-y-1 border-b border-rule py-3 text-fg-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex min-w-0 items-center gap-2.5">
        <span className="relative flex size-2 shrink-0" aria-hidden>
          <span className="absolute inset-0 rounded-full bg-signal" />
        </span>
        <span className="min-w-0">
          <span className="text-fg-3">Currently: </span>
          <span className="text-fg">{site.status.currently}</span>
          {site.status.note && (
            <>
              <span className="text-fg-3"> · </span>
              {site.status.note}
            </>
          )}
        </span>
      </p>
      <p className="shrink-0 text-fg-3">
        Nashville <Clock className="text-fg" />
      </p>
    </div>
  )
}

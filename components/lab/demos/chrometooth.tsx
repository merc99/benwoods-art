'use client'
// Chrometooth demos, ported from the prototype (chrometooth/index.html, plain JS) to React. Each runs inside its
// own tokens (chrometooth.module.css), light or dark with the site.
//  - CtEvidence: the review gate. Each reason the AI gives links both ways to the log line behind it, and the fix
//    stays locked until every reason is confirmed or disputed.
//  - CtBite: fixing a threat takes a bite out of its card and the Enamel score climbs.

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import s from './chrometooth.module.css'

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

type Sev = 'critical' | 'high' | 'medium'
const SEV: Record<Sev, [string, string, string]> = {
  critical: ['var(--crit)', 'var(--crit-t)', 'var(--crit-f)'],
  high: ['var(--high)', 'var(--high-t)', 'var(--high-f)'],
  medium: ['var(--med)', 'var(--med-t)', 'var(--med-f)'],
}
function SevPill({ sev }: { sev: Sev }) {
  const [c, t, f] = SEV[sev]
  return (
    <span className={s.sev} style={{ ['--c' as string]: c, ['--t' as string]: t, ['--f' as string]: f }}>
      {sev[0].toUpperCase() + sev.slice(1)}
    </span>
  )
}

// ───────────────────────── the review gate ─────────────────────────

const MARK = ['var(--ca)', 'var(--cb)', 'var(--cc)']
const WHY: [string, string][] = [
  ['File hash matches a known Trojan.Generic variant', '61 of 72 threat-intel engines agree'],
  ['Wrote a startup registry key right after download', 'So it would run every time the PC starts'],
  ['Opened an outbound connection to an unlisted host', 'Not on your allowlist, never seen before'],
]
/** The log, as lines of segments; a segment with a number is the evidence for that reason. */
const LOG: [string, number?][][] = [
  [['14:31:48  download  C:\\Users\\Public\\Downloads\\invoice_0423.pdf.exe  412 KB, unsigned']],
  [['14:31:49  scan      sha256 9f2c…e41a  '], ['matches Trojan.Generic.F56 (61/72 engines)', 0]],
  [['14:31:52  registry  '], ['HKCU\\…\\CurrentVersion\\Run\\InvoiceHelper', 1]],
  [['14:31:55  network   outbound '], ['198.51.100.47:443  host not on allowlist', 2]],
]
type Verdict = 'ok' | 'no' | undefined

export function CtEvidence() {
  const [verdicts, setVerdicts] = useState<Verdict[]>([undefined, undefined, undefined])
  const [sel, setSel] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const reasons = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)

  const checked = verdicts.filter(Boolean).length
  const allNo = verdicts.every((v) => v === 'no')
  const ready = checked === WHY.length && !allNo

  /** Select a reason (from its row or its mark) and bring the other side into view. */
  const pick = (i: number, fromMark: boolean) => {
    const next = sel === i ? null : i
    setSel(next)
    if (next === null) return
    requestAnimationFrame(() => {
      const target = fromMark
        ? reasons.current?.querySelector(`[data-r="${i}"]`)
        : box.current?.querySelector(`mark[data-r="${i}"]`)
      target?.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' })
    })
  }
  const vote = (i: number, v: 'ok' | 'no') => setVerdicts((cur) => cur.map((x, k) => (k === i ? (x === v ? undefined : v) : x)))
  const reset = () => {
    setVerdicts([undefined, undefined, undefined])
    setSel(null)
    setDone(false)
  }

  if (done)
    return (
      <div className={cn(s.root, 'grid h-full place-items-center p-6 text-center')}>
        <div>
          <p className="text-[15px] font-semibold" style={{ color: 'var(--ok-t)' }}>
            {allNo ? 'Marked as a false positive' : 'Quarantined on Desktop-PC1'}
          </p>
          <p className={cn(s.meta, 'mt-1')}>
            {allNo ? 'Nothing was changed. Chrometooth learns from it.' : 'Every reason was reviewed before the fix ran.'}
          </p>
          <button type="button" className={cn(s.btn, s.sm, 'mt-4')} onClick={reset}>
            Start over
          </button>
        </div>
      </div>
    )

  return (
    <div className={cn(s.root, 'flex h-full flex-col gap-3 p-4 sm:p-5')}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <SevPill sev="critical" />
        <h3 className="m-0 text-[16px] font-semibold">Trojan.Generic.F56</h3>
        <span className={s.meta}>Desktop-PC1 · 98% confidence</span>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[1.05fr_1fr]">
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
            <h4 className={s.h}>Why Chrometooth flagged it</h4>
            <span className={cn(s.meta, 'inline-flex items-center gap-3 whitespace-nowrap')}>
              {checked} of {WHY.length} checked
              {verdicts.some((v) => v !== 'ok') && (
                <button type="button" className={s.linkbtn} onClick={() => setVerdicts(WHY.map(() => 'ok'))}>
                  Confirm all
                </button>
              )}
            </span>
          </div>
          <div ref={reasons} className="grid gap-2">
            {WHY.map(([a, b], i) => (
              <div
                key={a}
                data-r={i}
                role="button"
                tabIndex={0}
                aria-pressed={sel === i}
                aria-label={`Show the source for: ${a}`}
                className={cn(s.rsn, sel === i && s.on)}
                style={{ ['--mc' as string]: MARK[i] }}
                onClick={(e) => !(e.target as HTMLElement).closest('button') && pick(i, false)}
                onKeyDown={(e) => {
                  if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    pick(i, false)
                  }
                }}
              >
                <span className={s.dot} />
                <span>
                  {a}
                  <small>{b}</small>
                </span>
                <span className={s.vb}>
                  <button type="button" className={s.ok} aria-pressed={verdicts[i] === 'ok'} aria-label="Looks right" onClick={() => vote(i, 'ok')}>
                    <svg viewBox="0 0 14 14">
                      <path d="M3 7.4l2.6 2.6L11 4.6" />
                    </svg>
                  </button>
                  <button type="button" className={s.no} aria-pressed={verdicts[i] === 'no'} aria-label="Not right" onClick={() => vote(i, 'no')}>
                    <svg viewBox="0 0 14 14">
                      <path d="M4 4l6 6M10 4l-6 6" />
                    </svg>
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h4 className={s.h}>Source</h4>
            <span className={s.meta}>What Chrometooth read</span>
          </div>
          <div ref={box} className={cn(s.evbox, sel !== null && s.sel, 'min-h-0 flex-1 overflow-auto')}>
            {LOG.map((line, li) => (
              <div key={li}>
                {line.map(([text, r], k) =>
                  r === undefined ? (
                    <span key={k}>{text}</span>
                  ) : (
                    <mark
                      key={k}
                      data-r={r}
                      className={cn(s.ev, sel === r && s.on)}
                      style={{ ['--mc' as string]: MARK[r] }}
                      onClick={() => pick(r, true)}
                    >
                      {text}
                    </mark>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-3" style={{ borderColor: 'var(--hair)' }}>
        <p className={cn(s.gate, ready && s.ready, 'mr-auto')} aria-live="polite">
          {checked < WHY.length
            ? `Check ${WHY.length - checked} more reason${WHY.length - checked === 1 ? '' : 's'} to unlock the fix.`
            : allNo
              ? 'You marked every reason as not right.'
              : 'Reviewed. Ready when you are.'}
        </p>
        <button type="button" className={s.btn} onClick={reset}>
          Decide later
        </button>
        {allNo ? (
          <button type="button" className={cn(s.btn, s.ink)} onClick={() => setDone(true)}>
            Mark false positive
          </button>
        ) : (
          <button type="button" className={cn(s.btn, s.ink)} disabled={!ready} onClick={() => setDone(true)}>
            Quarantine
          </button>
        )}
      </div>
    </div>
  )
}

// ───────────────────────── the bite ─────────────────────────

const THREATS: { id: number; name: string; dev: string; sev: Sev; verb: string; past: string; w: number }[] = [
  { id: 1, name: 'Trojan.Generic.F56', dev: 'Desktop-PC1', sev: 'critical', verb: 'Quarantine', past: 'Quarantined', w: 25 },
  { id: 2, name: 'Unauthorized access attempt', dev: 'Server-02', sev: 'high', verb: 'Block IP', past: 'Blocked 203.0.113.89', w: 15 },
  { id: 3, name: 'Suspicious file download', dev: 'Laptop-X7', sev: 'medium', verb: 'Delete file', past: 'Deleted Suspicious_File.exe', w: 8 },
]
const TICKS = 30

/** A number that counts to its value. */
function useCount(target: number) {
  const [v, setV] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    const start = from.current
    if (start === target || reduced()) {
      from.current = target
      setV(target)
      return
    }
    const t0 = performance.now()
    let raf = 0
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 700)
      const e = 1 - Math.pow(1 - k, 3)
      setV(Math.round(start + (target - start) * e))
      if (k < 1) raf = requestAnimationFrame(step)
      else from.current = target
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      from.current = target
    }
  }, [target])
  return v
}

export function CtBite() {
  const [open, setOpen] = useState(THREATS.map((t) => t.id))
  const [eating, setEating] = useState<number | null>(null)
  const [toast, setToast] = useState<{ k: number; text: string } | null>(null)
  const enamel = 100 - THREATS.filter((t) => open.includes(t.id)).reduce((a, t) => a + t.w, 0)
  const shown = useCount(enamel)
  // ticks light one after another, like the prototype
  const [lit, setLit] = useState(Math.round((enamel / 100) * TICKS))
  const litRef = useRef(lit)
  useEffect(() => {
    const on = Math.round((enamel / 100) * TICKS)
    const from = litRef.current
    const set = (k: number) => {
      litRef.current = k
      setLit(k)
    }
    if (reduced() || on <= from) return set(on)
    const timers = Array.from({ length: on - from }, (_, j) => window.setTimeout(() => set(from + j + 1), j * 18))
    return () => timers.forEach(clearTimeout)
  }, [enamel])

  const fix = (id: number) => {
    if (eating) return
    const t = THREATS.find((x) => x.id === id)!
    setEating(id)
    window.setTimeout(
      () => {
        setOpen((o) => o.filter((x) => x !== id))
        setEating(null)
        setToast({ k: Date.now(), text: `${t.past} on ${t.dev}` })
      },
      reduced() ? 50 : 950,
    )
  }
  const n = open.length

  return (
    <div className={cn(s.root, 'relative grid h-full gap-3 p-4 sm:grid-cols-[0.9fr_1.1fr] sm:p-5')}>
      <section className={cn(s.panel, 'flex flex-col p-4')} aria-label="Enamel">
        <div className="flex items-baseline justify-between">
          <h4 className={s.h}>Enamel</h4>
          <span className={s.meta}>Protection score</span>
        </div>
        <p className={cn(s.score, 'mt-3 mb-0')} aria-live="polite">
          {shown}
          <small>%</small>
        </p>
        <div className={cn(s.ticks, 'mt-4 mb-3')} aria-hidden="true">
          {Array.from({ length: TICKS }, (_, k) => (
            <i key={k} className={k < lit ? s.on : undefined} style={{ ['--k' as string]: k }} />
          ))}
        </div>
        <p className={cn(s.meta, 'm-0')}>
          {n ? `${['', 'One open threat is', 'Two open threats are', 'Three open threats are'][n]} wearing it down.` : 'Fully intact. Nothing needs you.'}
        </p>
      </section>

      <section className={cn(s.panel, 'flex min-h-0 flex-col p-4')} aria-label="Threat queue">
        <div className="mb-3 flex items-baseline justify-between">
          <h4 className={s.h}>Threats</h4>
          <span className={s.meta}>{n} open</span>
        </div>
        {n ? (
          <div className="grid">
            {THREATS.filter((t) => open.includes(t.id)).map((t) => (
              <div key={t.id} className={cn(s.collapse, eating === t.id && s.gone)} style={{ marginBottom: eating === t.id ? 0 : 8 }}>
                <div>
                  <article className={cn(s.threat, eating === t.id && s.eaten)}>
                    <span>
                      <SevPill sev={t.sev} />
                    </span>
                    <h3>{t.name}</h3>
                    <div className="flex items-center justify-between gap-3">
                      <span className={s.meta}>{t.dev}</span>
                      <button type="button" className={cn(s.btn, s.ink, s.sm)} onClick={() => fix(t.id)} disabled={!!eating}>
                        {t.verb}
                      </button>
                    </div>
                  </article>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid flex-1 place-items-center text-center">
            <div>
              <p className="m-0 font-semibold">Nothing to bite.</p>
              <p className={cn(s.meta, 'm-0')}>Every device came back clean.</p>
              <button type="button" className={cn(s.btn, s.sm, 'mt-3')} onClick={() => setOpen(THREATS.map((t) => t.id))}>
                Bring the threats back
              </button>
            </div>
          </div>
        )}
      </section>
      {toast && (
        <p key={toast.k} className={cn(s.toast, 'm-0')} role="status">
          {toast.text}
        </p>
      )}
    </div>
  )
}

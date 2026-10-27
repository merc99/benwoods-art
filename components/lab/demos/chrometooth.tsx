'use client'
// Chrometooth demos, ported from the prototype (chrometooth/index.html, plain JS) to React. Each runs inside its
// own tokens (chrometooth.module.css), light or dark with the site.
//  - CtEvidence: the review gate. Each reason the AI gives links both ways to the log line behind it, and the fix
//    stays locked until every reason is confirmed or disputed.
//  - CtBite: fixing a threat takes a bite out of its card and the Enamel score climbs.
//  - CtActivity: a 300-row cut of the Activity log: query language, chips in sync with it, sorting, windowed rows.

import { useEffect, useMemo, useRef, useState } from 'react'
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

// ───────────────────────── the activity log ─────────────────────────
// A 300-row cut of Chrometooth's Activity view: the same seeded data, query language, chips that stay in sync with
// the query text, sortable columns and a windowed body (only the rows in view are in the DOM).

type Verdict3 = 'allowed' | 'flagged' | 'blocked'
type LogRow = { id: number; ts: number; dev: number; dir: 'in' | 'out'; dom: string; cc: string; proto: string; sent: number; recv: number; v: Verdict3; sev: '' | 'low' | Sev }
const DEVS: [string, string][] = [
  ['Router-Core', 'Router'], ['Desktop-PC1', 'Desktop'], ['Laptop-X7', 'Laptop'], ['NAS-01', 'Storage'], ['Server-02', 'Server'], ['Printer-HQ', 'Printer'],
  ['Echo-Dot', 'Speaker'], ['Phone-M2', 'Phone'], ['Doorbell-Cam', 'Doorbell camera'], ['Thermostat-T1', 'Thermostat'], ['Laptop-K4', 'Laptop'], ['Living-Room-TV', 'TV'],
]
// device, destination, country, protocol, direction, weight, bytes sent and received [min, max], verdict, severity
const DESTS: [number, string, string, string, 'in' | 'out', number, [number, number], [number, number], Verdict3, LogRow['sev']][] = [
  [0, '198.51.100.*', 'RU', 'TCP', 'in', 18, [0, 0], [60, 180], 'blocked', 'low'],
  [1, 'outlook.office365.com', 'IE', 'HTTPS', 'out', 26, [3e3, 6e4], [5e3, 4e5], 'allowed', ''],
  [1, 'github.com', 'US', 'HTTPS', 'out', 14, [2e3, 4e4], [1e4, 9e5], 'allowed', ''],
  [2, 'zoom.us', 'US', 'UDP', 'out', 10, [2e6, 4e7], [3e6, 6e7], 'allowed', ''],
  [2, 'slack.com', 'US', 'HTTPS', 'out', 20, [1e3, 2e4], [2e3, 8e4], 'allowed', ''],
  [3, 'backup.b2-storage.net', 'US', 'HTTPS', 'out', 10, [1e6, 2.6e8], [2e3, 9e3], 'allowed', ''],
  [4, '203.0.113.89', 'CN', 'SSH', 'in', 24, [0, 0], [380, 620], 'flagged', 'high'],
  [5, 'telemetry.printmaker-cloud.com', 'US', 'HTTPS', 'out', 20, [600, 2400], [300, 900], 'flagged', 'low'],
  [6, 'avs.voice-cloud.net', 'US', 'HTTPS', 'out', 6, [4e4, 3e5], [8e3, 6e4], 'flagged', 'high'],
  [7, 'instagram.com', 'US', 'QUIC', 'out', 24, [2e3, 4e4], [1e5, 9e6], 'allowed', ''],
  [8, 'clips.doorcam-cloud.com', 'US', 'HTTPS', 'out', 14, [1.5e6, 9e6], [600, 2e3], 'flagged', 'medium'],
  [9, 'home.thermo-cloud.io', 'US', 'MQTT', 'out', 20, [200, 600], [200, 600], 'allowed', ''],
  [10, 'cdn.adtrack-metrics.com', 'CN', 'HTTPS', 'out', 12, [400, 1200], [0, 0], 'blocked', 'low'],
  [11, 'acr.tvmaker-cloud.com', 'KR', 'HTTPS', 'out', 44, [4e3, 2.4e4], [300, 1200], 'flagged', 'high'],
  [11, 'ads.tvmaker-cloud.com', 'KR', 'HTTPS', 'out', 14, [500, 2e3], [0, 0], 'blocked', 'low'],
  [11, 'nflxvideo.net', 'US', 'HTTPS', 'out', 10, [2e3, 9e3], [5e7, 9e8], 'allowed', ''],
]
const NOW_S = 14 * 3600 + 32 * 60
function mulberry32(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
let LOG_ROWS: LogRow[] | null = null
/** Seeded, so every visit gets the same 300 rows. Built on first use, not at import. */
function logRows() {
  if (LOG_ROWS) return LOG_ROWS
  const rnd = mulberry32(0xc0ffee), total = DESTS.reduce((a, d) => a + d[5], 0), rows: LogRow[] = []
  const span = (a: number, b: number) => Math.round(a + (b - a) * Math.pow(rnd(), 2.2))
  for (let i = 0; i < 300; i++) {
    let w = rnd() * total, d = DESTS[0]
    for (const x of DESTS) if ((w -= x[5]) <= 0) { d = x; break }
    const [dev, dom, cc, proto, dir, , s0, r0, v, sev] = d
    rows.push({ id: i, ts: -Math.floor(rnd() * 6 * 3600), dev, dir, dom: dom.replace('*', String(2 + Math.floor(rnd() * 250))), cc, proto, sent: span(...s0), recv: v === 'blocked' ? 0 : span(...r0), v, sev })
  }
  return (LOG_ROWS = rows.sort((a, b) => b.ts - a.ts))
}
const hms = (ts: number) => {
  const c = (((NOW_S + ts) % 86400) + 86400) % 86400
  return [c / 3600, (c / 60) % 60, c % 60].map((n) => String(Math.floor(n)).padStart(2, '0')).join(':')
}
const fmtB = (b: number) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(b < 10240 ? 1 : 0)} KB` : b < 1073741824 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1073741824).toFixed(2)} GB`)

// The query language: key:value terms, AND across keys, OR within a key, a leading minus excludes.
type Term = { key: string; val: string; neg: boolean }
const KEYS = ['device', 'verdict', 'domain', 'country', 'proto', 'dir', 'sev', 'last', 'sent']
function parseQuery(q: string) {
  const terms: Term[] = [], text: string[] = [], re = /(-?)([a-z]+):("[^"]*"?|\S*)|("[^"]*"?|\S+)/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(q))) {
    if (m[2] && KEYS.includes(m[2].toLowerCase()) && m[3] !== '') terms.push({ key: m[2].toLowerCase(), val: m[3].replace(/"/g, ''), neg: !!m[1] })
    else { const t = (m[4] || m[0]).replace(/"/g, '').trim().toLowerCase(); if (t && t !== '-') text.push(t) }
  }
  return { terms, text }
}
const serialize = (terms: Term[], text: string[]) => terms.map((t) => `${t.neg ? '-' : ''}${t.key}:${/\s/.test(t.val) ? `"${t.val}"` : t.val}`).concat(text).join(' ')
function test(t: Term): (r: LogRow) => boolean {
  const v = t.val.toLowerCase()
  switch (t.key) {
    case 'device': return (r) => DEVS[r.dev][0].toLowerCase().includes(v) || DEVS[r.dev][1].toLowerCase().includes(v)
    case 'verdict': return (r) => r.v.startsWith(v)
    case 'domain': return (r) => r.dom.includes(v)
    case 'country': return (r) => r.cc.toLowerCase() === v
    case 'proto': return (r) => r.proto.toLowerCase() === v
    case 'dir': return (r) => r.dir === (v.startsWith('in') ? 'in' : 'out')
    case 'sev': return (r) => (v === 'none' ? !r.sev : r.sev === v)
    case 'last': { const s = v === '30m' ? 1800 : v === '1h' ? 3600 : v === '3h' ? 10800 : 86400; return (r) => r.ts >= -s }
    case 'sent': {
      const m = /^([<>])?(\d+(?:\.\d+)?)(b|kb|mb|gb)?$/.exec(v), n = m ? +m[2] * { b: 1, kb: 1024, mb: 1048576, gb: 1073741824 }[(m[3] || 'b') as 'b'] : 0
      return (r) => (!m ? true : m[1] === '<' ? r.sent < n : r.sent > n)
    }
  }
  return () => true
}
function compile(terms: Term[], text: string[]) {
  const by = new Map<string, ((r: LogRow) => boolean)[]>()
  for (const t of terms) { const k = t.key + (t.neg ? '-' : '+'); by.set(k, [...(by.get(k) || []), test(t)]) }
  const pos = [...by].filter(([k]) => k.endsWith('+')).map(([, f]) => f), neg = [...by].filter(([k]) => k.endsWith('-')).flatMap(([, f]) => f)
  return (r: LogRow) =>
    pos.every((fs) => fs.some((f) => f(r))) && !neg.some((f) => f(r)) && text.every((w) => `${DEVS[r.dev][0]} ${r.dom} ${r.cc} ${r.proto}`.toLowerCase().includes(w))
}

const VCOL: Record<Verdict3, [string, string, string]> = {
  allowed: ['var(--low)', 'var(--low)', 'var(--low-f)'],
  flagged: ['var(--high)', 'var(--high-t)', 'var(--high-f)'],
  blocked: ['var(--ok)', 'var(--ok-t)', 'var(--ok-f)'],
}
const SEVC: Record<string, string> = { low: 'var(--low)', medium: 'var(--med)', high: 'var(--high)', critical: 'var(--crit)' }
type SortKey = 'ts' | 'dev' | 'dom' | 'sent' | 'recv' | 'v'
const ACOLS: { k: SortKey | 'cc' | 'proto'; label: string; num?: boolean }[] = [
  { k: 'dev', label: 'Device' }, { k: 'dom', label: 'Destination' }, { k: 'cc', label: 'Country' }, { k: 'proto', label: 'Protocol' },
  { k: 'sent', label: 'Sent', num: true }, { k: 'recv', label: 'Received', num: true }, { k: 'v', label: 'Verdict' },
]
const SORTV: Record<string, (r: LogRow) => string | number> = {
  ts: (r) => r.ts, dev: (r) => DEVS[r.dev][0], dom: (r) => r.dom, cc: (r) => r.cc, proto: (r) => r.proto, sent: (r) => r.sent, recv: (r) => r.recv, v: (r) => r.v,
}
const ROW_H = 34

export function CtActivity() {
  const rows = useMemo(() => logRows(), [])
  const [q, setQ] = useState('verdict:flagged verdict:blocked')
  const [sort, setSort] = useState<{ k: string; dir: 1 | -1 }>({ k: 'ts', dir: -1 })
  const [top, setTop] = useState(0)
  const [view, setView] = useState({ h: 300 })
  const [active, setActive] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const raf = useRef(0)

  const { terms, text } = useMemo(() => parseQuery(q), [q])
  const list = useMemo(() => {
    const f = SORTV[sort.k], keep = compile(terms, text)
    return rows.filter(keep).sort((a, b) => { const x = f(a), y = f(b); return (x < y ? -1 : x > y ? 1 : 0) * sort.dir || b.ts - a.ts })
  }, [rows, terms, text, sort])

  // chips edit the parsed terms and write the text back
  const setTerms = (fn: (t: Term[]) => Term[]) => { setQ(serialize(fn(terms.slice()), text)); if (scroller.current) scroller.current.scrollTop = 0 }
  const has = (key: string, val: string) => terms.some((t) => t.key === key && !t.neg && t.val.toLowerCase() === val)
  const toggleVerdict = (v: Verdict3) => setTerms((t) => (has('verdict', v) ? t.filter((x) => !(x.key === 'verdict' && !x.neg && x.val.toLowerCase() === v)) : [...t, { key: 'verdict', val: v, neg: false }]))
  const lastT = terms.find((t) => t.key === 'last' && !t.neg)?.val ?? '6h'
  const setLast = (v: string) => setTerms((t) => [...t.filter((x) => x.key !== 'last'), ...(v === '6h' ? [] : [{ key: 'last', val: v, neg: false }])])

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const ro = new ResizeObserver(() => setView({ h: el.clientHeight }))
    ro.observe(el)
    return () => { ro.disconnect(); cancelAnimationFrame(raf.current) }
  }, [])
  const onScroll = () => {
    if (raf.current) return
    raf.current = requestAnimationFrame(() => { raf.current = 0; setTop(scroller.current?.scrollTop ?? 0) })
  }
  // windowing: only the rows in view, plus four either side
  const a = Math.max(0, Math.floor(top / ROW_H) - 4)
  const b = Math.min(list.length, Math.ceil((top + view.h) / ROW_H) + 4)
  const act = Math.min(active, Math.max(0, list.length - 1))

  const moveTo = (i: number) => {
    const n = Math.max(0, Math.min(list.length - 1, i)), el = scroller.current
    setActive(n)
    if (el) {
      const y = n * ROW_H, vh = el.clientHeight - ROW_H
      if (y < el.scrollTop) el.scrollTop = y
      else if (y + ROW_H > el.scrollTop + vh) el.scrollTop = y + ROW_H - vh
    }
    requestAnimationFrame(() => (bodyRef.current?.querySelector(`[data-i="${n}"]`) as HTMLElement | null)?.focus({ preventScroll: true }))
  }
  const onKey = (e: React.KeyboardEvent) => {
    const step: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, PageDown: 8, PageUp: -8 }
    if (e.key in step) { e.preventDefault(); moveTo(act + step[e.key]) }
    else if (e.key === 'Home') { e.preventDefault(); moveTo(0) }
    else if (e.key === 'End') { e.preventDefault(); moveTo(list.length - 1) }
  }
  const sortBy = (k: string) => setSort((cur) => (cur.k === k ? { k, dir: (cur.dir * -1) as 1 | -1 } : { k, dir: k === 'sent' || k === 'recv' || k === 'ts' ? -1 : 1 }))
  const cols = `92px 136px minmax(200px,1fr) 94px 98px 84px 104px 100px`
  const head = (k: string, label: string, num?: boolean) => {
    const on = sort.k === k
    return (
      <span key={k} role="columnheader" aria-sort={on ? (sort.dir < 0 ? 'descending' : 'ascending') : undefined} className={cn(s.alc, num && s.alnum, k === 'ts' && s.alfirst)}>
        <button type="button" className={cn(s.alsort, on && s.alon)} onClick={() => sortBy(k)}>
          {label}
          <svg viewBox="0 0 12 12" aria-hidden="true" className={cn(s.alar, on && sort.dir > 0 && s.alup)}><path d="M6 2.5v7M3 6.5l3 3 3-3" /></svg>
        </button>
      </span>
    )
  }

  return (
    <div className={cn(s.root, s.al, 'flex h-full flex-col gap-3 p-4')}>
      <div className={s.alsearch}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
        <label htmlFor="ct-al-q" className="sr-only">Filter the activity log</label>
        <input id="ct-al-q" value={q} onChange={(e) => { setQ(e.target.value); if (scroller.current) scroller.current.scrollTop = 0 }} spellCheck={false} autoComplete="off" placeholder="device:tv verdict:blocked country:CN" />
      </div>
      <div className={s.alchips}>
        <div role="group" aria-label="Verdict" className="flex gap-1">
          {(['allowed', 'flagged', 'blocked'] as Verdict3[]).map((v) => (
            <button key={v} type="button" aria-pressed={has('verdict', v)} className={s.alchip} style={{ ['--c' as string]: VCOL[v][0] }} onClick={() => toggleVerdict(v)}>
              <i />{v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Time range" className="flex gap-1">
          {[['6h', '6 hours'], ['1h', '1 hour'], ['30m', '30 min']].map(([v, l]) => (
            <button key={v} type="button" aria-pressed={lastT === v} className={s.alchip} onClick={() => setLast(v)}>{l}</button>
          ))}
        </div>
        <span className={cn(s.meta, 'ml-auto tabular-nums')} aria-live="polite">{list.length} of {rows.length} rows</span>
      </div>
      <div ref={scroller} onScroll={onScroll} className={cn(s.panel, s.alscroll, 'min-h-0 flex-1')}>
        <div role="grid" aria-label="Activity log" aria-rowcount={list.length + 1} className={s.algrid} style={{ ['--cols' as string]: cols }}>
          <div role="row" aria-rowindex={1} className={s.alhead}>
            {head('ts', 'Time')}
            {ACOLS.map((c) => head(c.k, c.label, c.num))}
          </div>
          <div ref={bodyRef} role="rowgroup" onKeyDown={onKey} className="relative" style={{ height: list.length * ROW_H }}>
            {list.slice(a, b).map((r, k) => {
              const i = a + k, [c, t, f] = VCOL[r.v]
              return (
                <div key={r.id} role="row" aria-rowindex={i + 2} data-i={i} tabIndex={i === act ? 0 : -1} onFocus={() => setActive(i)} className={s.alrow} style={{ top: i * ROW_H }}>
                  <span role="gridcell" className={cn(s.alc, s.alfirst, s.almono)}>{hms(r.ts)}</span>
                  <span role="gridcell" className={s.alc}>{DEVS[r.dev][0]}</span>
                  <span role="gridcell" className={cn(s.alc, s.almono)}>{r.dom}</span>
                  <span role="gridcell" className={cn(s.alc, s.almono)}>{r.cc}</span>
                  <span role="gridcell" className={cn(s.alc, s.almono)}>{r.proto}</span>
                  <span role="gridcell" className={cn(s.alc, s.alnum)} title={`${r.sent.toLocaleString('en-US')} bytes`}>{fmtB(r.sent)}</span>
                  <span role="gridcell" className={cn(s.alc, s.alnum)} title={`${r.recv.toLocaleString('en-US')} bytes`}>{fmtB(r.recv)}</span>
                  <span role="gridcell" className={s.alc}>
                    <span className={s.sev} style={{ ['--c' as string]: r.sev ? SEVC[r.sev] : c, ['--t' as string]: t, ['--f' as string]: f }}>{r.v[0].toUpperCase() + r.v.slice(1)}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        {!list.length && (
          <div className={s.alempty}>
            <p className="font-semibold" style={{ color: 'var(--ink)' }}>No rows match.</p>
            <p className={s.meta}>Remove a filter to widen the search.</p>
            <button type="button" className={cn(s.btn, s.sm, 'mt-3')} onClick={() => setQ('')}>Clear filters</button>
          </div>
        )}
      </div>
    </div>
  )
}

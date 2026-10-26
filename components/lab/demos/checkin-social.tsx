'use client'
// Check-in's social moments, ported from check-in-web (components/feed/TodayStrip, checkin/MemberSticker,
// checkin/Reactions) as self-contained demos with their own demo crew.
//  - CheckinWave: tap a crewmate who isn't in yet to wave (once a day). Crewmates answer by checking in, and when
//    the last one does, "in today" becomes "✓ all in" and a small burst rises from the banner.
//  - CheckinWho: hold a reaction chip (or hover or right-click it) to see who left it. Holding never toggles it.

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { Gloss } from '../checkin/gloss-sparkline/Gloss'
import { RollingCount } from '../checkin/rolling-count/RollingCount'
import '../checkin/_shared/tokens.css'
import { cn } from '@/lib/cn'
import s from './checkin-social.module.css'

const scope = 'lab-checkin relative h-full w-full bg-[var(--background)] text-[var(--foreground)] [font-family:var(--font-body)]'
const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Avatar({ name, hue, pending, size = 36, initial }: { name: string; hue: string; pending?: boolean; size?: number; initial?: string }) {
  return (
    <span
      className={cn(
        'grid flex-none place-items-center rounded-full border font-bold leading-none transition-opacity duration-200',
        pending ? 'border-dashed border-[var(--border-strong)] bg-[var(--card)] text-[var(--muted-foreground)] opacity-60' : 'border-[var(--border)] text-[var(--on-color)]',
      )}
      style={{ width: size, height: size, fontSize: size * 0.42, background: pending ? undefined : hue }}
    >
      {initial ?? name[0]}
    </span>
  )
}

function Check({ size = 10 }: { size?: number }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden="true">
      <path d="M2.5 6.4 5 8.8l4.6-5.3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** A small burst of round particles inside the demo frame (the app's fx/burst, scoped to a canvas). */
function burst(canvas: HTMLCanvasElement | null, from: HTMLElement | null, colors: string[]) {
  if (!canvas || !from || reduced()) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = Math.min(2, devicePixelRatio || 1)
  const box = canvas.getBoundingClientRect()
  canvas.width = box.width * dpr
  canvas.height = box.height * dpr
  const r = from.getBoundingClientRect()
  const x = r.left - box.left + r.width / 2
  const y = r.top - box.top + r.height / 2
  const parts = Array.from({ length: 34 }, (_, i) => {
    const a = Math.random() * Math.PI * 2
    const v = 2 + Math.random() * 5
    return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3, life: 1, size: 3 + Math.random() * 3, c: colors[i % colors.length] }
  })
  const tick = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, box.width, box.height)
    for (const p of parts) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.18
      p.vx *= 0.98
      p.life -= 0.018
      ctx.globalAlpha = Math.max(0, p.life)
      ctx.fillStyle = p.c
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
      ctx.fill()
    }
    if (parts.some((p) => p.life > 0)) requestAnimationFrame(tick)
    else ctx.clearRect(0, 0, box.width, box.height)
  }
  requestAnimationFrame(tick)
}

// ───────────────────────── wave + all in ─────────────────────────

type Member = { id: string; name: string; hue: string; in: boolean; me?: boolean }
const CREW: Member[] = [
  { id: 'you', name: 'You', hue: 'var(--leaf)', in: false, me: true },
  { id: 'priya', name: 'Priya', hue: 'var(--grape)', in: true },
  { id: 'sam', name: 'Sam', hue: 'var(--rose)', in: false },
  { id: 'maya', name: 'Maya', hue: 'var(--coral)', in: true },
  { id: 'dre', name: 'Dre', hue: 'var(--indigo)', in: false },
]

export function CheckinWave() {
  const [crew, setCrew] = useState(CREW)
  const [waved, setWaved] = useState<string[]>([])
  const [arrived, setArrived] = useState<string | null>(null)
  const [toast, setToast] = useState<{ k: number; text: string } | null>(null)
  const [round, setRound] = useState(0)
  const timers = useRef<number[]>([])
  const strip = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const n = crew.filter((m) => m.in).length
  const allIn = n === crew.length
  const say = (text: string) => setToast({ k: Date.now(), text })

  const arrive = (id: string) => {
    setCrew((c) => c.map((m) => (m.id === id ? { ...m, in: true } : m)))
    setArrived(id)
  }
  const wave = (m: Member) => {
    if (waved.includes(m.id)) return say(`You already waved at ${m.name} today.`)
    setWaved((w) => [...w, m.id])
    say(`You waved at ${m.name}. No pressure.`)
    // in the demo, about two waves in three get answered within seconds; the rest show up a little later anyway
    const answered = Math.random() < 0.67
    later(
      () => {
        arrive(m.id)
        say(`${m.name} checked in.`)
      },
      (answered ? 2400 + Math.random() * 1600 : 6500 + Math.random() * 2000) * (reduced() ? 0.3 : 1),
    )
  }

  // the whole-crew moment: once, when the last person checks in while you watch (never on load)
  const was = useRef(allIn)
  useEffect(() => {
    const before = was.current
    was.current = allIn
    if (before || !allIn) return
    later(() => burst(canvas.current, strip.current, ['#38BDF8', '#34D399', '#FACC15', '#ffffff']), 700)
  }, [allIn])

  const restart = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    was.current = false
    setCrew(CREW)
    setWaved([])
    setArrived(null)
    setToast(null)
    setRound((r) => r + 1)
  }
  const me = crew.find((m) => m.me)!

  return (
    <div className={cn(scope, 'flex flex-col items-center justify-center gap-4 overflow-hidden p-5')}>
      <Gloss hue="var(--sky)" className="w-full max-w-[420px] rounded-[22px] p-4 text-[var(--on-color)]">
        <p className="text-[24px] leading-none font-extrabold tracking-tight">DIALED</p>
        <p className="mt-1.5 text-[13px] font-semibold opacity-75">5 members · 22-day crew streak</p>
        <div ref={strip} className="mt-3 flex items-center gap-2 rounded-[14px] bg-black/10 p-2 shadow-[inset_0_1px_0_rgb(255_255_255/.18)]">
          <ul className="m-0 flex list-none items-center p-0 pl-1" aria-label="Who’s in today">
            {crew.map((m, i) => {
              const canWave = !m.me && !m.in
              return (
                <li
                  key={`${round}-${m.id}`}
                  className={cn('relative', i > 0 && '-ml-[6px]', waved.includes(m.id) && !m.in && 'z-10', arrived === m.id && s.stickpop)}
                >
                  {canWave ? (
                    <button
                      type="button"
                      onClick={() => wave(m)}
                      aria-label={waved.includes(m.id) ? `You waved at ${m.name}` : `Wave at ${m.name}`}
                      className="block rounded-full transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[.94]"
                    >
                      <Avatar name={m.name} hue={m.hue} pending />
                    </button>
                  ) : (
                    <Avatar name={m.name} hue={m.hue} pending={!m.in} initial={m.me ? 'B' : undefined} />
                  )}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'pointer-events-none absolute -right-[3px] -bottom-[3px] grid size-[16px] place-items-center rounded-full bg-[var(--on-color)] text-[var(--primary)]',
                      s.tick,
                      m.in ? 'scale-100' : 'scale-0',
                      arrived === m.id && s.tickpop,
                    )}
                  >
                    <Check size={9} />
                  </span>
                  {waved.includes(m.id) && !m.in && (
                    <span aria-hidden="true" className={cn('pointer-events-none absolute -top-2 -right-1 text-[15px] leading-none', s.handwave)}>
                      👋
                    </span>
                  )}
                  <span className="sr-only">{`${m.name}: ${m.in ? 'in today' : waved.includes(m.id) ? 'not yet, you waved' : 'not yet'}`}</span>
                </li>
              )
            })}
          </ul>
          <span className="flex-1" />
          <span className="inline-flex items-baseline gap-2 pr-1">
            <span className="inline-flex items-baseline text-[22px] leading-none font-extrabold">
              <RollingCount n={n} tight label={`${n} of ${crew.length} in today`} />
              <span aria-hidden="true" className="text-[14px] opacity-60">
                /{crew.length}
              </span>
            </span>
            {allIn ? (
              <span key={`all-${round}`} className={cn('inline-flex items-center gap-1 text-[12px] font-bold', s.allin)}>
                <Check size={12} /> all in
              </span>
            ) : (
              <span className="text-[12px] font-bold">in today</span>
            )}
          </span>
        </div>
      </Gloss>

      <div className="flex items-center gap-2">
        {allIn ? (
          <button type="button" onClick={restart} className="h-11 rounded-full border border-[var(--border-strong)] bg-[var(--card)] px-5 text-[14px] font-bold">
            Start over
          </button>
        ) : (
          <button
            type="button"
            onClick={() => arrive('you')}
            disabled={me.in}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--primary)] px-6 text-[14px] font-bold text-[var(--primary-foreground)] transition-opacity disabled:opacity-50"
          >
            <Check size={13} /> {me.in ? 'You’re in' : 'Check in'}
          </button>
        )}
      </div>

      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
      {toast && (
        <p
          key={toast.k}
          role="status"
          className={cn(
            'absolute bottom-3 left-1/2 m-0 rounded-full bg-[var(--foreground)] px-4 py-2 text-[13px] font-semibold whitespace-nowrap text-[var(--background)]',
            s.toast,
          )}
        >
          {toast.text}
        </p>
      )}
    </div>
  )
}

// ───────────────────────── who reacted ─────────────────────────

const PEOPLE: Record<string, string> = { Priya: 'var(--grape)', Sam: 'var(--rose)', Dre: 'var(--indigo)', You: 'var(--leaf)' }
const LABEL: Record<string, string> = { '❤️': 'Heart', '🔥': 'On fire', '💪': 'Strong' }
type Chip = { e: string; people: string[] }

export function CheckinWho() {
  const [chips, setChips] = useState<Chip[]>([
    { e: '❤️', people: ['Priya', 'Sam', 'Dre'] },
    { e: '🔥', people: ['Dre', 'You'] },
    { e: '💪', people: ['Priya'] },
  ])
  const [who, setWho] = useState<{ e: string; left: number; hover: boolean } | null>(null)
  const row = useRef<HTMLDivElement>(null)
  const press = useRef({ timer: 0, fired: false, x: 0, y: 0 })

  const show = (el: HTMLElement, e: string, hover = false) => {
    const max = (row.current?.clientWidth ?? 260) - 190
    setWho({ e, left: Math.max(0, Math.min(el.offsetLeft, max)), hover })
  }
  const toggle = (e: string) =>
    setChips((cs) => cs.map((c) => (c.e !== e ? c : { ...c, people: c.people.includes('You') ? c.people.filter((p) => p !== 'You') : [...c.people, 'You'] })))

  // one handler tells a hold (450ms, cancelled by 8px of movement) from a tap, and swallows the click that ends a hold
  const down = (ev: RPointerEvent<HTMLButtonElement>, e: string) => {
    clearTimeout(press.current.timer)
    press.current = { timer: 0, fired: false, x: ev.clientX, y: ev.clientY }
    if (ev.pointerType === 'mouse') return
    const el = ev.currentTarget
    press.current.timer = window.setTimeout(() => {
      press.current.fired = true
      try {
        navigator.vibrate?.(10)
      } catch {
        // not everywhere
      }
      show(el, e)
    }, 450)
  }
  const move = (ev: RPointerEvent<HTMLButtonElement>) => {
    if (ev.pointerType === 'mouse') return // a resting mouse is the hover timer's job
    const p = press.current
    if (Math.abs(ev.clientX - p.x) > 8 || Math.abs(ev.clientY - p.y) > 8) clearTimeout(p.timer)
  }
  const enter = (ev: RPointerEvent<HTMLButtonElement>, e: string) => {
    if (ev.pointerType !== 'mouse') return
    const el = ev.currentTarget
    clearTimeout(press.current.timer)
    press.current.timer = window.setTimeout(() => show(el, e, true), 500)
  }
  const leave = (ev: RPointerEvent<HTMLButtonElement>) => {
    clearTimeout(press.current.timer)
    if (ev.pointerType === 'mouse') setWho((w) => (w?.hover ? null : w))
  }

  // close on a press elsewhere or Escape
  useEffect(() => {
    if (!who) return
    const out = (ev: PointerEvent) => !(ev.target as Element | null)?.closest?.('[data-who]') && setWho(null)
    const key = (ev: KeyboardEvent) => ev.key === 'Escape' && setWho(null)
    document.addEventListener('pointerdown', out, true)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', out, true)
      document.removeEventListener('keydown', key)
    }
  }, [who])
  useEffect(() => () => clearTimeout(press.current.timer), [])

  const open = who && chips.find((c) => c.e === who.e)

  return (
    <div className={cn(scope, 'grid place-items-center p-5')}>
      <article className="w-full max-w-[400px] rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--elev-card)]">
        <div className="flex gap-3">
          <Avatar name="Maya" hue="var(--coral)" size={40} />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[15px] font-bold">
              Maya <span className="font-medium text-[var(--muted-foreground)]">39m</span>
            </p>
            <p className="m-0 mt-1 text-[15px] leading-snug">5x5 squats, finally felt smooth. Coffee is earned.</p>
            <div ref={row} className="relative mt-3 flex flex-wrap gap-1.5">
              {chips
                .filter((c) => c.people.length)
                .map((c) => {
                  const mine = c.people.includes('You')
                  return (
                    <button
                      key={c.e}
                      type="button"
                      data-who
                      aria-label={`${LABEL[c.e]}, ${c.people.length}${mine ? ', including you' : ''}. Hold to see who.`}
                      aria-pressed={mine}
                      onPointerDown={(ev) => down(ev, c.e)}
                      onPointerMove={move}
                      onPointerUp={() => clearTimeout(press.current.timer)}
                      onPointerCancel={() => clearTimeout(press.current.timer)}
                      onPointerEnter={(ev) => enter(ev, c.e)}
                      onPointerLeave={leave}
                      onContextMenu={(ev) => {
                        ev.preventDefault()
                        show(ev.currentTarget, c.e)
                      }}
                      onKeyDown={(ev) => {
                        if (ev.key === 'ContextMenu' || (ev.shiftKey && ev.key === 'F10')) {
                          ev.preventDefault()
                          show(ev.currentTarget, c.e)
                        }
                      }}
                      onClick={() => {
                        if (press.current.fired) {
                          press.current.fired = false
                          return
                        }
                        setWho(null)
                        toggle(c.e)
                      }}
                      className={cn(
                        'inline-flex h-9 touch-manipulation items-center gap-1.5 rounded-full border px-3 text-[14px] font-bold transition-colors duration-150 select-none [-webkit-touch-callout:none]',
                        mine ? 'border-[var(--primary)] bg-[var(--primary-soft)]' : 'border-[var(--border)] bg-[var(--muted)]',
                      )}
                    >
                      <span aria-hidden="true">{c.e}</span>
                      <RollingCount n={c.people.length} tight />
                    </button>
                  )
                })}
              {open && (
                <div
                  data-who
                  role="dialog"
                  aria-label={`${LABEL[open.e]}, from`}
                  className={cn(
                    'absolute bottom-[calc(100%+8px)] z-10 w-[190px] rounded-[16px] border border-[var(--border)] bg-[var(--popover)] p-3 shadow-[var(--elev-overlay)]',
                    s.pop,
                  )}
                  style={{ left: who?.left ?? 0 }}
                >
                  <p className="m-0 mb-2 text-[12px] font-bold text-[var(--muted-foreground)]">
                    {open.e} {LABEL[open.e]}
                  </p>
                  <ul className="m-0 grid list-none gap-2 p-0">
                    {open.people.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-[14px] font-semibold">
                        <Avatar name={p} hue={PEOPLE[p]} size={24} initial={p === 'You' ? 'B' : undefined} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

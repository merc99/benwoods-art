'use client'
// Rat Mats demos, ported from handoff/rat-mats/components (the-sheet, registry-lookup, scroll-ticker).
// The claim data is the storefront's seeded placeholder data for Series 001, kept so every record is stable.

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { reducedMotion, useInView } from '../useInView'
import s from './ratmats.module.css'

const LEFT = 453 // Series 001 "Dart": numbers still open (placeholder)
const CITIES = ['Nashville TN', 'Portland OR', 'Chicago IL', 'Austin TX', 'Brooklyn NY', 'Denver CO', 'Seattle WA', 'Oakland CA', 'Athens GA', 'Providence RI', 'Minneapolis MN', 'Richmond VA', 'Berlin', 'Rotterdam', 'Glasgow', 'Melbourne', 'Toronto', 'Lisbon', 'Osaka', 'Mexico City']
const LETTERS = 'ABCDEFGHJKLMNPRSTVW'
const TIERS: [string, number][] = [['Series 003, on us', 1], ["Artist's proof, signed", 2], ['Rat Club, a year', 3], ['25% off this mat', 6]]

/** Deterministic pseudo-random, so a number's record never changes between visits. */
const seeded = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function build() {
  const taken = 500 - LEFT
  const all = Array.from({ length: 500 }, (_, i) => i + 1)
  // low numbers tend to go first, but scattered: an edition sells in clusters
  all.sort((a, b) => seeded(a) * (0.42 + a / 500) - seeded(b) * (0.42 + b / 500))
  const claimed = new Set(all.slice(0, taken))
  const cand = Array.from({ length: 499 }, (_, i) => i + 2).sort((a, b) => seeded(a + 313) - seeded(b + 313))
  const picks: number[] = []
  for (const c of cand) {
    if (picks.length >= 12) break
    if (picks.every((p) => Math.abs(c - p) > 18)) picks.push(c)
  }
  picks.sort((a, b) => a - b)
  const marks = new Map<number, string>()
  let t = 0
  let used = 0
  for (const p of picks) {
    while (used >= TIERS[t][1]) {
      t++
      used = 0
    }
    marks.set(p, TIERS[t][0])
    used++
  }
  return { claimed, marks }
}

const SHEET = build()

function recordFor(num: number) {
  const a = seeded(num + 100)
  const b = seeded(num * 3 + 11)
  const d = new Date(2026, 2, 4)
  d.setDate(d.getDate() + Math.floor(b * 150))
  return {
    who: `${LETTERS[Math.floor(a * LETTERS.length)]}.${LETTERS[Math.floor(b * LETTERS.length)]}.`,
    city: CITIES[Math.floor(b * CITIES.length)],
    when: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
  }
}

/** The Sheet (500 numbered squares, 12 marked) with the Registry: type a number, its square flashes. */
export function RatSheet() {
  const { claimed, marks } = SHEET
  const [hover, setHover] = useState<number | null>(null)
  const [dial, setDial] = useState('')
  const [pulse, setPulse] = useState<number | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const seen = useInView(box)
  const [filled, setFilled] = useState(false)

  useEffect(() => {
    if (seen && !filled) setFilled(true) // eslint-disable-line react-hooks/set-state-in-effect -- one-shot reveal flag
  }, [seen, filled])

  const n = parseInt(dial, 10)
  const valid = n >= 1 && n <= 500
  useEffect(() => {
    if (!valid) return
    setPulse(n) // eslint-disable-line react-hooks/set-state-in-effect -- flash follows the typed number
    const t = setTimeout(() => setPulse(null), 2200)
    return () => clearTimeout(t)
  }, [n, valid])

  const pad = (x: number) => String(x).padStart(3, '0')
  const readout =
    hover === null
      ? 'Hover a square to see its number.'
      : `${pad(hover)} · ${claimed.has(hover) ? `claimed ${recordFor(hover).when}` : 'open'}${marks.has(hover) ? ` · marked: ${marks.get(hover)}` : ''}`

  let claimIndex = 0
  return (
    <div className={cn(s.stage, 'grid h-full gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]')}>
      <div ref={box}>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[clamp(1.5rem,1.2rem+1vw,2rem)] leading-none font-black tracking-[-0.04em]">Dart · 001</p>
          <p className="t-label">
            <b>{LEFT}</b> / 500 left
          </p>
        </div>
        <div
          className={cn(s.sheet, filled && !reducedMotion() && s.fill, 'mt-3')}
          role="img"
          aria-label={`${500 - LEFT} of 500 numbers claimed. Marked numbers still open: ${[...marks.keys()].filter((k) => !claimed.has(k)).join(', ')}. Use the registry to look up any number.`}
          onMouseLeave={() => setHover(null)}
        >
          {Array.from({ length: 500 }, (_, i) => {
            const num = i + 1
            const c = claimed.has(num)
            const delay = c ? `${claimIndex++ * 2.4}ms` : undefined
            return (
              <span
                key={num}
                className={s.cell}
                data-claimed={c || undefined}
                data-mark={marks.has(num) || undefined}
                data-pulse={pulse === num || undefined}
                style={delay && filled ? { animationDelay: delay } : undefined}
                onMouseEnter={() => setHover(num)}
              />
            )
          })}
        </div>
        <p className="t-label mt-2 min-h-[1.4em] text-[rgb(11_11_11/0.72)]">{readout}</p>
      </div>

      <div className="border-t-[1.25px] border-[#0b0b0b] pt-4 lg:border-t-0 lg:border-l-[1.25px] lg:pt-0 lg:pl-5">
        <label htmlFor="rm-dial" className="t-label block">
          The Registry · look up a number
        </label>
        <input
          id="rm-dial"
          inputMode="numeric"
          maxLength={3}
          value={dial}
          onChange={(e) => setDial(e.target.value.replace(/\D/g, ''))}
          placeholder="047"
          className={cn(s.dial, 'mt-2')}
        />
        <div className="mt-4 text-[0.9375rem]" aria-live="polite">
          {!dial ? (
            <p className="text-[rgb(11_11_11/0.7)]">Awaiting a number, 001 through 500.</p>
          ) : !valid ? (
            <p>No such number. Editions run 001 to 500.</p>
          ) : claimed.has(n) ? (
            <>
              <p className="font-black">{pad(n)} is gone.</p>
              {marks.has(n) && <p className="t-label mt-1 text-[#9a6a00]">Was marked · {marks.get(n)}</p>}
              <dl className="t-label mt-3">
                {[
                  ['Claimed by', recordFor(n).who],
                  ['Shipped to', recordFor(n).city],
                  ['Date', recordFor(n).when],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-[rgb(11_11_11/0.16)] py-1.5">
                    <dt className="opacity-60">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <>
              <p className="font-black">
                {pad(n)} is {marks.has(n) ? 'marked' : 'open'}.
              </p>
              {marks.has(n) && <p className="t-label mt-1 text-[#9a6a00]">Comes with: {marks.get(n)}</p>}
            </>
          )}
        </div>
        <p className="t-label mt-4 text-[rgb(11_11_11/0.55)]">Placeholder claim data for design review.</p>
      </div>
    </div>
  )
}

const WORDS = ['Editions of 500', 'Numbered by hand', 'Never reprinted', 'Printed in Nashville']

/** A ticker that runs with the page: scroll down and it runs left, scroll up and it reverses. */
export function RatTicker() {
  const run = useRef<HTMLDivElement>(null)
  const visible = useInView(run)

  useEffect(() => {
    const el = run.current
    if (!el || !visible || reducedMotion()) return
    let x = 0
    let dir = -1
    let boost = 0
    let last = window.scrollY
    let raf = 0
    const half = el.scrollWidth / 2
    const onScroll = () => {
      const d = window.scrollY - last
      last = window.scrollY
      if (Math.abs(d) > 1) dir = d > 0 ? -1 : 1
      boost = Math.min(3.4, Math.abs(d) * 0.09)
    }
    const tick = () => {
      boost *= 0.93
      x += dir * (0.4 + boost)
      if (x <= -half) x += half
      if (x >= 0) x -= half
      el.style.transform = `translate3d(${x}px,0,0)`
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [visible])

  const unit = [...WORDS, ...WORDS]
  return (
    <div className={cn(s.stage, 'flex h-full flex-col justify-center gap-6')}>
      <div className={s.band} aria-hidden>
        <div ref={run} className={s.run}>
          {[...unit, ...unit].map((w, i) => (
            <span key={i} className={cn(s.item, 't-label text-[0.8125rem]')}>
              <span aria-hidden>✦</span>
              {w}
            </span>
          ))}
        </div>
      </div>
      <p className="sr-only">{WORDS.join(' · ')}</p>
      <p className="t-label px-6 text-center text-[rgb(11_11_11/0.62)]">Scroll the page up and down</p>
    </div>
  )
}

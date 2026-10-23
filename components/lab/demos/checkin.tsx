'use client'
// Check-in demos. Each runs inside `.lab-checkin`, which carries Check-in's own tokens (its palette
// is allowed inside its own Lab frames, never in the site's chrome).

import { useEffect, useRef, useState } from 'react'
import { Foil, FoilLight } from '@/components/fx/Foil'
import { RingCarousel } from '../checkin/ring-carousel/RingCarousel'
import { Reactions, type ReactionChip } from '../checkin/reactions/Reactions'
import { HoldButton } from '../checkin/hold-to-confirm/HoldButton'
import { Gloss, GlossPill, GlassInset, Sparkline } from '../checkin/gloss-sparkline/Gloss'
import { RollingCount } from '../checkin/rolling-count/RollingCount'
import '../checkin/_shared/tokens.css'

const scope = 'lab-checkin h-full w-full bg-[var(--background)] text-[var(--foreground)] [font-family:var(--font-body)]'

export function CheckinFoil() {
  return (
    <div className={`${scope} grid place-items-center p-8`}>
      <Foil hue="white" tilt={12} strength={0.6} className="w-[210px]">
        <div
          className="relative overflow-hidden rounded-[22px] p-5"
          style={{ background: 'var(--lemon)', color: 'var(--on-color)', boxShadow: 'var(--elev-raised)' }}
        >
          <div className="grid size-16 place-items-center rounded-full bg-[#1C1B19] text-xl font-extrabold text-[#FACC15] shadow-[inset_0_2px_0_rgb(255_255_255/.15)]">
            40
          </div>
          <p className="mt-6 text-[22px] leading-tight font-extrabold tracking-tight">Forty days</p>
          <p className="mt-1 text-[13px] font-medium opacity-80">40 check-ins, all time</p>
          <FoilLight />
        </div>
      </Foil>
    </div>
  )
}

const CREWS = [
  { name: '5am Lifters', hue: 'var(--sky)', note: '22-day streak' },
  { name: 'Couch to 5K', hue: 'var(--leaf)', note: '33-day streak' },
  { name: 'Morning Pages', hue: 'var(--lemon)', note: '15-day streak' },
  { name: 'Sketchbook Daily', hue: 'var(--grape)', note: '9-day streak' },
  { name: 'Hydration Station', hue: 'var(--coral)', note: '12-day streak' },
  { name: 'No Phone Before 9', hue: 'var(--rose)', note: '21-day streak' },
]

export function CheckinRing() {
  const [front, setFront] = useState(0)
  return (
    <div className={`${scope} flex flex-col items-center justify-center overflow-hidden py-6`}>
      <RingCarousel
        label="Crews"
        className="w-full"
        stageWidth={520}
        stageHeight={290}
        cardWidth={170}
        cardHeight={200}
        orbit={175}
        lean={36}
        onFront={setFront}
        items={CREWS.map((c) => ({
          key: c.name,
          label: c.name,
          content: (
            <Gloss hue={c.hue} className="flex h-full flex-col justify-between rounded-[22px] p-4">
              <GlossPill>{c.note}</GlossPill>
              <p className="text-[20px] leading-tight font-extrabold tracking-tight">{c.name}</p>
            </Gloss>
          ),
        }))}
      />
      <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">
        Drag, flick or use the arrow keys · {CREWS[front]?.name}
      </p>
    </div>
  )
}

export function CheckinReactions() {
  const [chips, setChips] = useState<ReactionChip[]>([
    { emoji: '❤️', count: 2, mine: false },
    { emoji: '🔥', count: 1, mine: false },
  ])
  const onReact = (emoji: string, on: boolean) =>
    setChips((cs) => {
      const has = cs.find((c) => c.emoji === emoji)
      if (!has) return on ? [...cs, { emoji, count: 1, mine: true }] : cs
      return cs
        .map((c) => (c.emoji === emoji ? { ...c, count: c.count + (on ? 1 : -1), mine: on } : c))
        .filter((c) => c.count > 0)
    })
  return (
    <div className={`${scope} grid place-items-center p-6`}>
      <div className="w-full max-w-[380px] rounded-[16px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--elev-card)]">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-[var(--coral)] text-sm font-bold text-[var(--on-color)]">M</span>
          <p className="text-[15px] font-bold">
            Maya <span className="font-normal text-[var(--muted-foreground)]">39m</span>
          </p>
        </div>
        <p className="mt-3 text-[15px]">5x5 squats, finally felt smooth. Coffee is earned.</p>
        <div className="mt-3">
          <Reactions chips={chips} onReact={onReact} />
        </div>
      </div>
    </div>
  )
}

export function CheckinHold() {
  const [gone, setGone] = useState(false)
  const [hint, setHint] = useState('')
  useEffect(() => {
    if (!gone) return
    const t = setTimeout(() => setGone(false), 2200)
    return () => clearTimeout(t)
  }, [gone])
  return (
    <div className={`${scope} grid place-items-center p-6`}>
      <div className="w-full max-w-[340px]">
        {gone ? (
          <p className="rounded-[16px] border border-dashed border-[var(--border-strong)] p-6 text-center text-[14px] text-[var(--muted-foreground)]">
            Crew deleted. Bringing it back…
          </p>
        ) : (
          <HoldButton
            label="Hold to delete crew"
            hint="Hold the button to delete the crew"
            onHint={(h) => {
              setHint(h)
              setTimeout(() => setHint(''), 1800)
            }}
            onConfirm={() => setGone(true)}
            detail="5am Lifters, its check-ins and its streak"
          />
        )}
        <p className="mt-3 h-5 text-center text-[13px] font-semibold text-[var(--destructive-ink)]" aria-live="polite">
          {hint}
        </p>
      </div>
    </div>
  )
}

const WEEK = [1, 3, 2, 4, 3, 5, 4, 2, 3, 5, 4, 5, 3, 4]

export function CheckinGloss() {
  const [n, setN] = useState(2)
  const btn = useRef<HTMLButtonElement>(null)
  return (
    <div className={`${scope} grid place-items-center p-6`}>
      <Gloss hue="var(--sky)" className="w-full max-w-[340px] rounded-[22px] p-5">
        <div className="flex items-center justify-between">
          <GlossPill>In today</GlossPill>
          <button
            ref={btn}
            type="button"
            onClick={() => setN((v) => (v >= 5 ? 1 : v + 1))}
            className="rounded-full bg-[var(--on-color)] px-3 py-1.5 text-[12px] font-bold text-[#fff] active:scale-[.97]"
          >
            Check in
          </button>
        </div>
        <p className="mt-3 flex items-baseline text-[56px] leading-none font-extrabold tracking-[-0.035em]">
          <RollingCount n={n} tight label={`${n} of 5 in today`} />
          <span className="ml-0.5 text-[26px] opacity-70">/5</span>
        </p>
        <GlassInset className="mt-4 p-3">
          <p className="mb-2 flex justify-between text-[12px] font-semibold">
            <span>Last 14 days</span>
            <span className="opacity-70">today</span>
          </p>
          <Sparkline values={WEEK} label="Check-ins over the last 14 days" pointLabel={(i) => `${14 - i} days ago · ${WEEK[i]} in`} />
        </GlassInset>
      </Gloss>
    </div>
  )
}

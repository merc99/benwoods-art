'use client'
// Live token views for the System page. Values come from app/globals.css (parsed at build time in lib/system.ts);
// contrast is computed here, in the browser, from those same values.

import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Play } from 'lucide-react'
import type { Token, TypeStyle } from '@/lib/system'
import { cn } from '@/lib/cn'

// ---------- color math ----------
type RGBA = [number, number, number, number]
let ctx: CanvasRenderingContext2D | null = null
/** Any CSS color to RGBA, using the browser's own parser. */
function rgba(value: string): RGBA {
  ctx ??= document.createElement('canvas').getContext('2d')
  if (!ctx) return [0, 0, 0, 1]
  ctx.fillStyle = '#000'
  ctx.fillStyle = value
  const s = String(ctx.fillStyle)
  if (s.startsWith('#')) return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16), 1]
  const n = s.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 1]
  return [n[0], n[1], n[2], n[3] ?? 1]
}
const over = (top: RGBA, base: RGBA): RGBA => [0, 1, 2].map((i) => top[i] * top[3] + base[i] * (1 - top[3])).concat(1) as RGBA
const lum = ([r, g, b]: RGBA) =>
  [r, g, b].map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0)
export function contrast(fg: string, bg: string, under?: string) {
  const base = rgba(bg)
  const b = under ? over(base, rgba(under)) : base
  const f = over(rgba(fg), b)
  const [hi, lo] = [lum(f), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** What each color is checked against, and the bar it has to clear. */
const PAIRS: Record<string, { fg?: string; bg: string; under?: string; min: number; what: string }> = {
  bg: { fg: 'fg', bg: 'bg', min: 4.5, what: 'ink on it' },
  surface: { fg: 'fg', bg: 'surface', min: 4.5, what: 'ink on it' },
  sunken: { fg: 'fg', bg: 'sunken', min: 4.5, what: 'ink on it' },
  fg: { bg: 'bg', min: 4.5, what: 'text on bg' },
  'fg-2': { bg: 'bg', min: 4.5, what: 'text on bg' },
  'fg-3': { bg: 'bg', min: 4.5, what: 'text on bg' },
  rule: { bg: 'bg', min: 0, what: 'decorative line' },
  'rule-strong': { bg: 'bg', min: 3, what: 'control edge on bg' },
  signal: { bg: 'bg', min: 4.5, what: 'text on bg' },
  'on-signal': { bg: 'signal', min: 4.5, what: 'text on signal' },
  selection: { fg: 'fg', bg: 'selection', under: 'bg', min: 4.5, what: 'ink on a selection' },
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(text)
        setDone(true)
        setTimeout(() => setDone(false), 1400)
      }}
      className="hit-44 inline-grid size-7 place-items-center text-fg-3 transition-colors duration-[var(--dur-chrome)] hover:text-fg"
      aria-label={`Copy ${text}`}
    >
      {done ? <Check className="size-3.5" strokeWidth={1.75} aria-hidden /> : <Copy className="size-3.5" strokeWidth={1.75} aria-hidden />}
      <span className="sr-only" aria-live="polite">
        {done ? 'Copied' : ''}
      </span>
    </button>
  )
}

function Chip({ token, scheme, all }: { token: Token; scheme: 'light' | 'dark'; all: Map<string, Token> }) {
  const [ratio, setRatio] = useState<number | null>(null)
  const pair = PAIRS[token.name]
  const v = (n: string) => all.get(n)?.[scheme] ?? ''
  useEffect(() => {
    if (!pair) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- measured in the browser, which has the color parser
    setRatio(contrast(pair.fg ? v(pair.fg) : v(token.name), v(pair.bg), pair.under ? v(pair.under) : undefined))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheme, token.name])
  const textToken = !!pair && !pair.fg && pair.min > 0 && token.name !== 'rule-strong'
  const pass = ratio !== null && pair && (pair.min === 0 || ratio >= pair.min)
  return (
    <div className="min-w-0">
      <div
        className="flex h-16 items-center px-3"
        style={{
          background: textToken || token.name === 'rule' || token.name === 'rule-strong' ? v(pair!.bg) : token.name === 'selection' ? v('bg') : token[scheme],
          boxShadow: 'inset 0 0 0 1px ' + v('rule'),
        }}
      >
        {textToken ? (
          <span className="t-title text-[1.5rem]" style={{ color: token[scheme] }}>
            Aa
          </span>
        ) : token.name === 'rule' || token.name === 'rule-strong' ? (
          <span className="block h-px w-full" style={{ background: token[scheme], height: token.name === 'rule-strong' ? 2 : 1 }} />
        ) : token.name === 'selection' ? (
          <span className="px-1" style={{ background: token[scheme], color: v('fg') }}>
            Selected
          </span>
        ) : pair?.fg ? (
          <span className="t-title text-[1.5rem]" style={{ color: v(pair.fg) }}>
            Aa
          </span>
        ) : null}
      </div>
      <p className="t-label mt-2 flex flex-wrap items-center gap-x-2 text-fg-3">
        <span className="text-fg-2">{scheme}</span>
        <span className="break-all normal-case">{token[scheme]}</span>
      </p>
      {pair && ratio !== null && (
        <p className="t-label mt-1 text-fg-3">
          {ratio.toFixed(2)}:1 · {pair.what}
          {pair.min > 0 && <span className={cn('ml-1.5', pass ? 'text-fg' : 'text-signal')}>{pass ? `AA pass (${pair.min})` : `AA fail (${pair.min})`}</span>}
        </p>
      )}
    </div>
  )
}

/** The stylesheet comment, minus its ratio (shown live below) and asides in parentheses. */
const noteText = (n: string) => {
  const t = n.replace(/\s*\([^)]*\)/g, '').replace(/[,.]?\s*[\d.]+:1\.?$/, '').trim()
  return t ? t[0].toUpperCase() + t.slice(1) : ''
}

export function Swatches({ tokens }: { tokens: Token[] }) {
  const all = new Map(tokens.map((t) => [t.name, t]))
  return (
    <ul className="grid gap-x-[var(--gutter)] gap-y-8 sm:grid-cols-2">
      {tokens.map((t) => (
        <li key={t.name} className="border-t border-rule pt-3">
          <div className="flex items-center justify-between gap-3">
            <code className="t-label text-fg">--{t.name}</code>
            <CopyButton text={`var(--${t.name})`} />
          </div>
          {t.note && <p className="mt-1 mb-3 text-[0.875rem] text-fg-2">{noteText(t.note)}</p>}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Chip token={t} scheme="light" all={all} />
            <Chip token={t} scheme="dark" all={all} />
          </div>
        </li>
      ))}
    </ul>
  )
}

// ---------- type ----------
export function TypeScale({ styles }: { styles: TypeStyle[] }) {
  const refs = useRef<(HTMLElement | null)[]>([])
  const [specs, setSpecs] = useState<string[]>([])
  useEffect(() => {
    const read = () =>
      setSpecs(
        refs.current.map((el) => {
          if (!el) return ''
          const s = getComputedStyle(el)
          const lh = s.lineHeight === 'normal' ? 'normal' : `${Math.round(parseFloat(s.lineHeight))}px`
          return `${Math.round(parseFloat(s.fontSize))}px / ${lh} · ${s.fontWeight}`
        }),
      )
    read()
    void document.fonts?.ready.then(read)
    window.addEventListener('resize', read)
    return () => window.removeEventListener('resize', read)
  }, [])
  // display roles take their size where they're used; these are the sizes the site uses most
  const sample: Record<string, { text: string; cls?: string; size?: string }> = {
    't-display': { text: 'Work', cls: 'text-[clamp(3rem,1rem+8vw,7rem)]', size: 'set per page: clamp(3rem, 1rem + 8vw, 7rem) here' },
    't-heading': { text: 'Featured builds', cls: 'text-[clamp(1.75rem,1.2rem+2.4vw,3.25rem)]', size: 'clamp(1.75rem, 1.2rem + 2.4vw, 3.25rem)' },
    't-title': { text: 'Check-in', cls: 'text-[1.25rem]', size: 'set per use: 1.25rem here' },
    't-label': { text: 'Designed and built' },
    't-lede': { text: 'Designer and builder working across product, front end, brand and print.' },
  }
  return (
    <ul>
      {styles.map((t, i) => (
        <li key={t.name} className="grid gap-x-[var(--gutter)] gap-y-2 border-t border-rule py-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <div className="t-label text-fg-3">
            <code className="text-fg">.{t.name}</code>
            <p className="mt-1 normal-case">{specs[i] || ' '}</p>
            <p className="mt-1 normal-case">
              {t.family} · tracking {t.tracking}
              {t.upper ? ' · uppercase' : ''}
            </p>
            <p className="mt-1 normal-case">size {t.size ?? sample[t.name]?.size}</p>
          </div>
          <p
            ref={(el) => {
              refs.current[i] = el
            }}
            className={cn(t.name, sample[t.name]?.cls, 'min-w-0 break-words')}
          >
            {sample[t.name]?.text}
          </p>
        </li>
      ))}
      <li className="grid gap-x-[var(--gutter)] gap-y-2 border-t border-rule py-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="t-label text-fg-3">
          <span className="text-fg">body</span>
          <p className="mt-1 normal-case">Inter · 16px, 17px from 1024px · 1.55</p>
        </div>
        <p className="max-w-[60ch]">Body copy is Inter at 1rem, 1.0625rem on large screens, with a 1.55 line height. Long reads cap at about 65 characters a line.</p>
      </li>
    </ul>
  )
}

// ---------- motion ----------
function Replay({ duration, easing, label }: { duration: string; easing: string; label: string }) {
  const [on, setOn] = useState(false)
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setOn((x) => !x)}
        aria-label={`Play ${label}`}
        className="hit-44 inline-grid size-8 shrink-0 place-items-center border border-rule-strong text-fg transition-colors duration-[var(--dur-chrome)] hover:bg-fg hover:text-bg"
      >
        <Play className="size-3.5" strokeWidth={1.75} aria-hidden />
      </button>
      <div className="relative h-8 min-w-0 flex-1 border-b border-rule">
        <span
          aria-hidden
          className="absolute bottom-1.5 left-0 size-4 rounded-pill bg-signal motion-reduce:!transition-none"
          style={{ transitionProperty: 'left', transitionDuration: duration, transitionTimingFunction: easing, left: on ? 'calc(100% - 1rem)' : 0 }}
        />
      </div>
    </div>
  )
}

export function MotionList({ durations, easings }: { durations: Token[]; easings: Token[] }) {
  const row = 'grid items-center gap-x-[var(--gutter)] gap-y-2 border-t border-rule py-4 sm:grid-cols-[11rem_minmax(0,1fr)] lg:grid-cols-[11rem_12rem_minmax(0,1fr)]'
  return (
    <div className="grid gap-10">
      <div>
        <h4 className="t-label mb-2 text-fg-3">Durations, on --ease-out</h4>
        <ul>
          {durations.map((d) => (
            <li key={d.name} className={row}>
              <code className="t-label text-fg">--{d.name}</code>
              <span className="t-label text-fg-3 normal-case">
                {d.light}
                {d.note ? ` · ${d.note}` : ''}
              </span>
              <Replay duration={`var(--${d.name})`} easing="var(--ease-out)" label={`${d.name}, ${d.light}`} />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="t-label mb-2 text-fg-3">Easing, over 800ms</h4>
        <ul>
          {easings.map((e) => (
            <li key={e.name} className={row}>
              <code className="t-label text-fg">--{e.name}</code>
              <span className="t-label break-all text-fg-3 normal-case">{e.light}</span>
              <Replay duration="var(--dur-settle)" easing={`var(--${e.name})`} label={e.name} />
            </li>
          ))}
        </ul>
      </div>
      <p className="text-[0.875rem] text-fg-2">With reduced motion on, every dot jumps to the end instead of moving.</p>
    </div>
  )
}

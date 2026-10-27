// The System page's data. Tokens are read from app/globals.css at build time, so the page always shows what the
// site actually runs on; nothing here is retyped. The changelog is the one hand-written list.
import 'server-only'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export type Token = { name: string; light: string; dark: string; note?: string }
export type TypeStyle = { name: string; family: string; weight: string; size?: string; lineHeight: string; tracking: string; upper: boolean }

const css = () => readFileSync(join(/*turbopackIgnore: true*/ process.cwd(), 'app', 'globals.css'), 'utf8')

/** `--name: value; /* note *\/` pairs inside the first block that starts with `selector`. */
function block(src: string, selector: string, from = 0) {
  const start = src.indexOf(selector, from)
  if (start < 0) return new Map<string, { value: string; note?: string }>()
  const open = src.indexOf('{', start)
  const close = src.indexOf('}', open)
  const out = new Map<string, { value: string; note?: string }>()
  for (const line of src.slice(open + 1, close).split('\n')) {
    const m = line.match(/^\s*--([\w-]+):\s*([^;]+);\s*(?:\/\*\s*(.*?)\s*\*\/)?/)
    if (m) out.set(m[1], { value: m[2].trim(), note: m[3] })
  }
  return out
}

/** Every `:root { … }` and `.dark, [data-surface='ink'] { … }` block, merged in file order. */
function scopes() {
  const src = css()
  const light = new Map<string, { value: string; note?: string }>()
  const dark = new Map<string, { value: string; note?: string }>()
  for (let i = src.indexOf(':root {'); i >= 0; i = src.indexOf(':root {', i + 1)) block(src, ':root {', i).forEach((v, k) => light.set(k, v))
  for (let i = src.indexOf('.dark,\n[data-surface'); i >= 0; i = src.indexOf('.dark,\n[data-surface', i + 1)) block(src, '.dark,\n[data-surface', i).forEach((v, k) => dark.set(k, v))
  return { src, light, dark }
}

const pick = (names: string[]): Token[] => {
  const { light, dark } = scopes()
  return names
    .filter((n) => light.has(n))
    .map((n) => ({ name: n, light: light.get(n)!.value, dark: (dark.get(n) ?? light.get(n)!).value, note: light.get(n)!.note }))
}

export const colorTokens = () => pick(['bg', 'surface', 'sunken', 'fg', 'fg-2', 'fg-3', 'rule', 'rule-strong', 'signal', 'on-signal', 'selection'])
export const shadowTokens = () => pick(['shadow-float', 'frame-shadow', 'frame-shadow-hover'])
export const radiusTokens = () => pick(['radius-none', 'radius-pill'])
export const easeTokens = () => pick(['ease-out', 'ease-in', 'ease-in-out', 'ease-glide', 'ease-pop', 'fx-spring'])
export const durationTokens = () => {
  const { light } = scopes()
  return [...light.entries()]
    .filter(([k]) => k.startsWith('dur-'))
    .map(([name, v]) => ({ name, light: v.value, dark: v.value, note: v.note }))
    .sort((a, b) => parseFloat(a.light) - parseFloat(b.light))
}

/** The gutter and header height step up at 640px and 1024px. */
export function layoutTokens() {
  const { src } = scopes()
  const at = (name: string) => [...src.matchAll(new RegExp(`--${name}:\\s*([^;]+);`, 'g'))].map((m) => m[1].trim())
  return [
    { name: 'gutter', steps: at('gutter'), note: 'Page edge padding: phones, 640px and up, 1024px and up' },
    { name: 'header-h', steps: at('header-h'), note: 'Header height: phones and tablets, 1024px and up' },
  ]
}

/** The five type roles, from their @utility blocks. */
export function typeStyles(): TypeStyle[] {
  const src = css()
  return ['t-display', 't-heading', 't-title', 't-label', 't-lede'].map((name) => {
    const i = src.indexOf(`@utility ${name} {`)
    const body = src.slice(i, src.indexOf('}', i))
    const get = (p: string) => body.match(new RegExp(`${p}:\\s*([^;]+);`))?.[1].trim() ?? ''
    return {
      name,
      family: get('font-family').replace(/var\(--font-(\w+)\)/, '$1'),
      weight: get('font-weight') || '400',
      size: get('font-size') || undefined,
      lineHeight: get('line-height'),
      tracking: get('letter-spacing'),
      upper: get('text-transform') === 'uppercase',
    }
  })
}

/** Dated, plain entries. Newest first. */
export const changelog: { date: string; items: string[] }[] = [
  {
    date: '2026-10-26',
    items: [
      'System: a new tab in the Lab, with every token read from the stylesheet.',
      'Motion: named the 9 durations and 2 easing curves the site already used. 26 inline values now point at them, with no change in timing.',
      'Color: text on the signal pill is now a token (--on-signal) instead of two hardcoded colors.',
      'Radii: square and pill are named tokens.',
      'Text field: new component. The command palette search now uses it.',
      'Button, filter pills and toast: new shared components.',
    ],
  },
  { date: '2026-10-25', items: ['Theme: the site opens in dark mode for everyone. The toggle still switches and remembers the choice.'] },
  { date: '2026-10-23', items: ['Site rebuilt in Next.js, with one stylesheet holding the color, type and motion tokens.'] },
]

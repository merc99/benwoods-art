/**
 * Eased fades. A plain `#000 70%, transparent 100%` mask (or gradient) changes at a constant rate, which on
 * near-black shows as visible steps; easing the alpha through many stops spreads the change out so it reads as
 * one smooth fade. Grain in globals.css dithers whatever banding is left.
 */

const smoothstep = (t: number) => t * t * (3 - 2 * t)

/**
 * A CSS gradient that fades `color` (default solid black, for masks) out between two positions,
 * e.g. easedFade('to bottom', '62%', '100%').
 */
export function easedFade(direction: string, from: string, to: string, steps = 12, rgb = '0 0 0') {
  const stops = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps
    const a = 1 - smoothstep(t)
    return `rgb(${rgb} / ${a.toFixed(3)}) calc(${from} + (${to} - ${from}) * ${t.toFixed(3)})`
  })
  return `linear-gradient(${direction}, rgb(${rgb} / 1) 0, ${stops.join(', ')})`
}

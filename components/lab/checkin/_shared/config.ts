// Portfolio handoff copy. Origin: check-in-web/components/fx/config.ts (commit 558f14a).
// Dependencies: none
// The JS timings for every effect. CSS knobs are the --fx-* tokens in tokens.css.
/**
 * Check-in's effect system: the JS timings. CSS knobs are the --fx-* tokens in app/globals.css.
 * Where each effect is allowed (the motion budget) is in CLAUDE.md, "Effects".
 */
export const FX = {
  /** Hold-to-confirm: how long a destructive button must be held. */
  holdMs: 1100,
  /** A press shorter than this on a hold button is a tap: it shows the "hold to…" hint. */
  holdHintMs: 220,
  /** Check-in burst: particles from the button. */
  burstCount: 60,
  /** Milestone reveal: particles when the card opens. */
  revealBurstCount: 110,
  /** Milestone reveal: the medal shakes this long before it opens. */
  revealShakeMs: 800,
  /** Fly-to: how long a "+1" or an emoji takes to land. */
  flyMs: 650,
  /** Toasts: how long one stays, and the window in which arrivals batch into one. */
  toastMs: 4200,
  toastBatchMs: 180,
  /** Toasts: the most on screen at once. */
  toastMax: 3,
} as const

/** The overshoot used for landings and pops (same as --fx-spring). */
export const FX_SPRING = 'cubic-bezier(0.24, 1.34, 0.38, 1)'

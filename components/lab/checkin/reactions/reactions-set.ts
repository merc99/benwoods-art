// Portfolio handoff copy. Origin: check-in-web/lib/reactions.ts (commit 558f14a).
// Dependencies: none
// Swap: the emoji and labels. Keep to Emoji 11 (2018) or older so Windows 10 can draw them.
/** The heart: the reaction a double-tap sends, and the one the old heart pill counted. */
export const HEART = '❤️'

/**
 * The crew reaction set, in picker order. The data layer stores these strings; the Reactions
 * component gives each its label and arrival animation.
 * Only emoji old enough for Windows 10's emoji font (Emoji 11, 2018, or earlier): newer ones such as
 * 🫡 or 😮‍💨 show up there as an empty box.
 */
export const REACTIONS = [
  { emoji: HEART, label: 'Heart' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '🔥', label: 'On fire' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🙌', label: 'Hands up' },
  { emoji: '🙏', label: 'Respect' },
  { emoji: '😅', label: 'Tough one' },
] as const

export type ReactionEmoji = (typeof REACTIONS)[number]['emoji']

/** One emoji's chip: how many left it and whether you did (a data-layer type in the app). */
export interface ReactionCount {
  emoji: string
  count: number
  mine: boolean
}

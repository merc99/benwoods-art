// Portfolio handoff copy. Origin: check-in-web/lib/motion.ts (prefersReducedMotion only) (commit 558f14a).
// Dependencies: none
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

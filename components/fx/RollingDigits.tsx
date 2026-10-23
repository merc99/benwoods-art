// Ported from the Check-in handoff: components/rolling-count/RollingCount.tsx (check-in-web, commit 558f14a).
// Pattern: Bencho / Emoji reactions (MIT). Changed for benwoods.art: takes a string, so clock separators
// (":") and leading zeros stay put while each digit rolls like an odometer.
import { cn } from '@/lib/cn'
import styles from './RollingDigits.module.css'

const DIGITS = '0123456789'.split('')

/**
 * Columns are keyed from the right, so 9 → 10 adds a column on the left instead of reshuffling.
 * Pass `label` so screen readers hear the value once instead of every column.
 */
export function RollingDigits({ value, label, className }: { value: string; label?: string; className?: string }) {
  const chars = value.split('')
  return (
    <span className={cn(styles.count, className)}>
      <span aria-hidden="true" className={styles.digits}>
        {chars.map((c, i) => {
          const key = chars.length - i
          if (!/\d/.test(c)) {
            return (
              <span key={key} className={styles.sep}>
                {c}
              </span>
            )
          }
          return (
            <span key={key} className={styles.col}>
              <span className={styles.strip} style={{ transform: `translateY(calc(${-Number(c)} * var(--roll-h)))` }}>
                {DIGITS.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </span>
            </span>
          )
        })}
      </span>
      {label !== undefined && <span className="sr-only">{label}</span>}
    </span>
  )
}

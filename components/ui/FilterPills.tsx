'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

export type FilterOption = { value: string; label: string; count?: number; disabled?: boolean }

/**
 * A row of pills where one is chosen; an ink highlight slides under the chosen pill. Each pill is a toggle
 * button (aria-pressed) inside a labeled group, so Tab reaches each one and Enter or Space chooses it.
 * `state` forces a hover or focus look on one pill for documentation (the System page).
 */
export function FilterPills({
  label,
  options,
  value,
  onChange,
  state,
  className,
}: {
  label: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
  state?: { value: string; look: 'hover' | 'focus' }
  className?: string
}) {
  const row = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState({ left: 0, width: 0 })
  useLayoutEffect(() => {
    const measure = () => {
      const b = row.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(value)}"]`)
      if (b) setPill({ left: b.offsetLeft, width: b.offsetWidth })
    }
    measure()
    void document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [value])

  return (
    <div role="group" aria-label={label} ref={row} className={cn('relative flex w-max gap-0.5 rounded-pill border border-rule p-1', className)}>
      <span
        aria-hidden
        className="absolute top-1 bottom-1 rounded-pill bg-fg transition-[left,width] duration-[var(--dur-move)] ease-glide motion-reduce:transition-none"
        style={{ left: pill.left, width: pill.width, opacity: pill.width ? 1 : 0 }}
      />
      {options.map((o) => {
        const on = o.value === value
        const forced = state?.value === o.value ? state.look : undefined
        return (
          <button
            key={o.value}
            type="button"
            data-value={o.value}
            data-state={forced}
            aria-pressed={on}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              'hit-44 t-label z-[1] inline-flex h-9 shrink-0 items-center gap-2 rounded-pill px-3.5 transition-colors duration-[var(--dur-fade)] motion-reduce:transition-none',
              on ? 'text-bg' : 'text-fg-2 hover:text-fg data-[state=hover]:text-fg',
              'data-[state=focus]:outline-2 data-[state=focus]:outline-offset-2 data-[state=focus]:outline-fg',
              o.disabled && 'cursor-not-allowed opacity-45 hover:text-fg-2',
            )}
          >
            {o.label}
            {o.count !== undefined && <span className={on ? 'text-bg/60' : 'text-fg-3'}>{String(o.count).padStart(2, '0')}</span>}
          </button>
        )
      })}
    </div>
  )
}

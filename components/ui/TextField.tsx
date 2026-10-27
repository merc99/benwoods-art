'use client'

import { useId } from 'react'
import { cn } from '@/lib/cn'

/**
 * A labeled text input. `boxed` sits on a page (forms); `bare` sits inside a panel that already frames it, like
 * the command palette search. The label is always there for screen readers; `hideLabel` only hides it visually.
 * A hint and an error are tied to the input with aria-describedby, and an error sets aria-invalid.
 * `state` forces a state for documentation (the System page); leave it unset everywhere else.
 */
export function TextField({
  label,
  hideLabel = false,
  hint,
  error,
  icon,
  trailing,
  variant = 'boxed',
  state,
  className,
  inputClassName,
  ref,
  id: idProp,
  ...input
}: {
  label: string
  hideLabel?: boolean
  hint?: string
  error?: string
  icon?: React.ReactNode
  trailing?: React.ReactNode
  variant?: 'boxed' | 'bare'
  state?: 'hover' | 'focus'
  className?: string
  inputClassName?: string
  ref?: React.Ref<HTMLInputElement>
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'>) {
  const auto = useId()
  const id = idProp ?? auto
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const bare = variant === 'bare'

  return (
    <div className={cn(!bare && 'grid gap-2', className)}>
      <label htmlFor={id} className={cn(hideLabel || bare ? 'sr-only' : 't-label text-fg-3')}>
        {label}
      </label>
      <div
        data-state={state}
        className={cn(
          'flex items-center gap-3',
          !bare && [
            'h-11 border bg-surface px-3 transition-colors duration-[var(--dur-chrome)] motion-reduce:transition-none',
            error ? 'border-signal' : 'border-rule-strong hover:border-fg data-[state=hover]:border-fg',
            'focus-within:border-fg focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-fg',
            'data-[state=focus]:border-fg data-[state=focus]:outline-2 data-[state=focus]:outline-offset-3 data-[state=focus]:outline-fg',
            input.disabled && 'cursor-not-allowed opacity-45 hover:border-rule-strong',
          ],
        )}
      >
        {icon && <span className="shrink-0 text-fg-3">{icon}</span>}
        <input
          ref={ref}
          id={id}
          aria-describedby={cn(hintId, errorId) || undefined}
          aria-invalid={error ? true : undefined}
          {...input}
          className={cn(
            'w-full min-w-0 bg-transparent text-fg outline-none placeholder:text-fg-3 disabled:cursor-not-allowed',
            bare ? 'h-14 text-[1rem]' : 'h-full text-[0.9375rem]',
            inputClassName,
          )}
        />
        {trailing}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-[0.875rem] text-fg-3">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-[0.875rem] text-signal">
          {error}
        </p>
      )}
    </div>
  )
}

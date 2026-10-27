import Link from 'next/link'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'solid' | 'outline' | 'signal'
export type ButtonState = 'hover' | 'focus' | 'active'

/**
 * The site's button, in three variants. One hover and one press for each:
 *  - solid: ink fill. Hover softens the fill to fg-2; press scales to 0.97.
 *  - outline: a strong rule. Hover fills with ink; press scales to 0.97.
 *  - signal: the vermilion pill (Contact). Hover mixes 12% ink into the fill, which raises contrast in both themes;
 *    press scales to 0.97.
 * `href` renders a link (external links open in a new tab). `loading` keeps the width, marks the button busy and
 * blocks clicks. `state` forces a state for documentation (the System page); leave it unset everywhere else.
 */
export function Button({
  variant = 'solid',
  size = 'md',
  href,
  loading = false,
  disabled = false,
  state,
  className,
  children,
  ref,
  ...rest
}: {
  variant?: ButtonVariant
  size?: 'md' | 'sm'
  href?: string
  loading?: boolean
  disabled?: boolean
  state?: ButtonState
  className?: string
  children: React.ReactNode
  ref?: React.Ref<HTMLButtonElement>
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'>) {
  const off = disabled || loading
  const cls = cn(
    't-label inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap select-none',
    'transition-[background-color,color,border-color,transform] duration-[var(--dur-chrome)] ease-out motion-reduce:transition-none',
    size === 'md' ? 'h-11 px-5' : 'hit-44 h-9 px-4',
    variant === 'signal' && 'rounded-pill',
    variant === 'solid' && 'bg-fg text-bg',
    variant === 'outline' && 'border border-rule-strong text-fg',
    variant === 'signal' && 'bg-signal text-on-signal',
    !off && [
      'active:scale-[0.97] data-[state=active]:scale-[0.97] motion-reduce:active:scale-100',
      variant === 'solid' && 'hover:bg-fg-2 data-[state=hover]:bg-fg-2',
      variant === 'outline' && 'hover:border-fg hover:bg-fg hover:text-bg data-[state=hover]:border-fg data-[state=hover]:bg-fg data-[state=hover]:text-bg',
      variant === 'signal' &&
        'hover:bg-[color-mix(in_srgb,var(--signal)_88%,var(--fg))] data-[state=hover]:bg-[color-mix(in_srgb,var(--signal)_88%,var(--fg))]',
    ],
    'data-[state=focus]:outline-2 data-[state=focus]:outline-offset-3 data-[state=focus]:outline-fg',
    off && 'cursor-not-allowed opacity-45',
    loading && 'cursor-progress',
    className,
  )
  const body = (
    <>
      {children}
      {loading && (
        <span aria-hidden className="inline-flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-1 animate-pulse rounded-pill bg-current motion-reduce:animate-none" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </span>
      )}
    </>
  )

  if (href && !off) {
    const external = /^https?:/.test(href)
    const props = { className: cls, 'data-state': state, ...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>) }
    return external ? (
      <a href={href} target="_blank" rel="noreferrer" {...props}>
        {body}
      </a>
    ) : (
      <Link href={href} {...props}>
        {body}
      </Link>
    )
  }
  return (
    <button
      ref={ref}
      type="button"
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      disabled={disabled}
      aria-disabled={off || undefined}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : (rest as React.ButtonHTMLAttributes<HTMLButtonElement>).onClick}
      data-state={state}
      className={cls}
    >
      {body}
    </button>
  )
}

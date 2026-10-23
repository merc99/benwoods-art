'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/cn'

/** Icons swap by CSS (`dark:`), so there's no mount flash and no hydration mismatch. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle dark theme"
      className={cn(
        'inline-grid size-11 place-items-center text-fg transition-colors duration-[var(--dur-chrome)] hover:bg-sunken',
        className,
      )}
    >
      <Moon className="size-[18px] dark:hidden" strokeWidth={1.5} aria-hidden />
      <Sun className="hidden size-[18px] dark:block" strokeWidth={1.5} aria-hidden />
    </button>
  )
}

'use client'
// Pattern: MMO Nodes command palette (handoff/mmo-nodes/components/command-palette), ported to React and
// restyled to this site. ⌘K / Ctrl+K anywhere; filter, arrow keys, Enter.

import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { links, nav, site } from '@/lib/site'
import { cn } from '@/lib/cn'

type Cmd = { label: string; group: string; run: () => void; keywords?: string }

const EVENT = 'bw:open-palette'
export const openPalette = () => window.dispatchEvent(new Event(EVENT))

export function CommandPalette({ projects }: { projects: { title: string; slug: string; category: string }[] }) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)

  const commands = useMemo<Cmd[]>(() => {
    const go = (href: string) => () => router.push(href)
    const ext = (href: string) => () => window.open(href, href.startsWith('mailto:') ? '_self' : '_blank', 'noopener')
    return [
      ...nav.map((n) => ({ label: `Go to ${n.label}`, group: 'Pages', run: go(n.href) })),
      ...projects.map((p) => ({ label: p.title, group: 'Work', run: go(`/work/${p.slug}`), keywords: p.category })),
      { label: 'Open the economy simulator', group: 'Lab', run: ext('/lab/economy-simulator/index.html'), keywords: 'mmo nodes' },
      {
        label: resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        group: 'Settings',
        run: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
        keywords: 'theme mode',
      },
      { label: `Copy email (${site.email})`, group: 'Contact', run: () => navigator.clipboard?.writeText(site.email), keywords: 'mail' },
      ...links.map((l) => ({ label: `Open ${l.label}`, group: 'Links', run: ext(l.href), keywords: l.handle })),
    ]
  }, [projects, router, resolvedTheme, setTheme])

  const hits = useMemo(() => {
    const s = q.toLowerCase().trim()
    if (!s) return commands
    return commands.filter((c) => `${c.label} ${c.group} ${c.keywords ?? ''}`.toLowerCase().includes(s))
  }, [commands, q])

  const active = Math.min(sel, Math.max(0, hits.length - 1))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener(EVENT, onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(EVENT, onOpen)
    }
  }, [])

  // focus in, scroll lock, restore focus on close
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    requestAnimationFrame(() => input.current?.focus())
    return () => {
      root.style.overflow = prev
      opener?.focus?.()
    }
  }, [open])

  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const close = () => {
    setOpen(false)
    setQ('')
    setSel(0)
  }
  const run = (i: number) => {
    const c = hits[i]
    if (!c) return
    close()
    c.run()
  }

  let lastGroup = ''
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Command palette">
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close command palette"
            className="absolute inset-0 cursor-default bg-[rgb(10_10_9/0.5)]"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
          <motion.div
            className="relative w-full max-w-[560px] border border-rule-strong bg-surface shadow-[var(--shadow-float)]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                close()
              } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSel((active + 1) % Math.max(1, hits.length))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSel((active - 1 + hits.length) % Math.max(1, hits.length))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                run(active)
              } else if (e.key === 'Tab') {
                e.preventDefault() // one field; arrows move through results
              }
            }}
          >
            <div className="flex items-center gap-3 border-b border-rule px-4">
              <Search className="size-4 shrink-0 text-fg-3" strokeWidth={1.5} aria-hidden />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setSel(0)
                }}
                placeholder="Jump to a page, project or link"
                aria-label="Search commands"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={hits[active] ? `cmd-${active}` : undefined}
                className="h-14 w-full bg-transparent text-[1rem] text-fg outline-none placeholder:text-fg-3"
              />
              <kbd className="t-label shrink-0 border border-rule px-1.5 py-0.5 text-fg-3">Esc</kbd>
            </div>
            <ul ref={list} id="palette-list" role="listbox" className="max-h-[min(60vh,420px)] overflow-y-auto py-2">
              {hits.length === 0 && <li className="px-4 py-6 text-center text-fg-2">Nothing matches. Try “work” or “email”.</li>}
              {hits.map((c, i) => {
                const head = c.group !== lastGroup
                lastGroup = c.group
                return (
                  <li key={`${c.group}-${c.label}`} role="presentation">
                    {head && <p className="t-label px-4 pt-3 pb-1 text-fg-3">{c.group}</p>}
                    <div
                      id={`cmd-${i}`}
                      role="option"
                      aria-selected={i === active}
                      onMouseMove={() => setSel(i)}
                      onClick={() => run(i)}
                      className={cn(
                        'mx-2 flex cursor-pointer items-center justify-between px-3 py-2.5 text-fg',
                        i === active && 'bg-sunken',
                      )}
                    >
                      <span>{c.label}</span>
                      {i === active && <span aria-hidden className="t-label text-fg-3">↵</span>}
                    </div>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

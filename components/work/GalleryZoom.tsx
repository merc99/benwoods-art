'use client'
// Lets a server-rendered Gallery open its images in the shared Lightbox: ZoomProvider holds the photo list
// and the open state, ZoomButton wraps one image (the card frame lifts on hover, as on the merch grid).

import { createContext, useContext, useRef, useState } from 'react'
import { Lightbox, type LightboxItem } from '@/components/ui/Lightbox'

const Open = createContext<((i: number, el: HTMLElement) => void) | null>(null)

export function ZoomProvider({ items, children }: { items: LightboxItem[]; children: React.ReactNode }) {
  const [open, setOpen] = useState<number | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  return (
    <Open.Provider
      value={(i, el) => {
        opener.current = el
        setOpen(i)
      }}
    >
      {children}
      <Lightbox items={items} open={open} onChange={setOpen} opener={() => opener.current} />
    </Open.Provider>
  )
}

export function ZoomButton({ index, label, children }: { index: number; label: string; children: React.ReactNode }) {
  const open = useContext(Open)
  return (
    <button type="button" onClick={(e) => open?.(index, e.currentTarget)} aria-label={`${label}, view larger`} className="group block w-full cursor-zoom-in text-left">
      {children}
    </button>
  )
}

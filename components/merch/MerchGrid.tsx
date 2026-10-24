'use client'
// Merch photo grid with a lightbox: click a photo for a larger view; arrow keys, swipe or the buttons move
// between photos, Escape closes. Focus stays in the lightbox and returns to the photo you opened.

import Image from 'next/image'
import { useMemo, useRef, useState } from 'react'
import type { MerchItem } from '@/lib/merch'
import { Bezel, bezelRadius } from '@/components/ui/Bezel'
import { Lightbox } from '@/components/ui/Lightbox'
import { cn } from '@/lib/cn'

const caption = (m: MerchItem) => [m.item, m.brand, m.year].filter(Boolean).join(' · ')

export function MerchGrid({ items }: { items: MerchItem[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const thumbs = useRef<(HTMLButtonElement | null)[]>([])
  const photos = useMemo(() => items.map((m) => ({ src: m.src, alt: m.alt, caption: caption(m) })), [items])

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {items.map((m, i) => (
          <li key={m.slug}>
            <button
              ref={(el) => {
                thumbs.current[i] = el
              }}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`${m.alt}, view larger`}
              className="group block w-full text-left"
            >
              <Bezel size="small">
                <span className={cn('relative block aspect-[5/4] overflow-hidden bg-sunken', bezelRadius.small.inner)}>
                  <Image src={m.src} alt={m.alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="object-cover" />
                </span>
              </Bezel>
              <span className="t-label mt-3 block text-fg-2">{caption(m)}</span>
            </button>
          </li>
        ))}
      </ul>

      <Lightbox items={photos} open={open} onChange={setOpen} opener={() => (open === null ? null : thumbs.current[open])} />
    </>
  )
}

'use client'

import dynamic from 'next/dynamic'
import { LazyMount } from '@/components/lab/LazyMount'

const GlyphField = dynamic(() => import('./GlyphField').then((m) => m.GlyphField), { ssr: false })

/** The glyph field's code loads only when the band nears the viewport. */
export function GlyphFieldLazy({ className }: { className?: string }) {
  return (
    <LazyMount margin="200px" className={className}>
      <GlyphField className="size-full" />
    </LazyMount>
  )
}

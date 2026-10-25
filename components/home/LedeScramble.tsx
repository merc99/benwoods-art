'use client'
// The Home hero line, decoded with the site's shared effect (the same timing and look as the wordmark).

import { DecodeText } from '@/components/fx/DecodeText'

export function LedeScramble({ text }: { text: string }) {
  return <DecodeText text={text} className="block" />
}

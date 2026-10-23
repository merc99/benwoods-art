'use client'

import dynamic from 'next/dynamic'
import { LazyMount } from './LazyMount'

const load = <K extends string>(mod: () => Promise<Record<K, React.ComponentType>>, name: K) =>
  dynamic(() => mod().then((m) => m[name]), { ssr: false, loading: () => null })

// Each demo's code is split out and fetched only when its frame nears the viewport.
const DEMOS = {
  'checkin-foil': load(() => import('./demos/checkin'), 'CheckinFoil'),
  'checkin-ring': load(() => import('./demos/checkin'), 'CheckinRing'),
  'checkin-reactions': load(() => import('./demos/checkin'), 'CheckinReactions'),
  'checkin-hold': load(() => import('./demos/checkin'), 'CheckinHold'),
  'checkin-gloss': load(() => import('./demos/checkin'), 'CheckinGloss'),
  'club-crest': load(() => import('./demos/club'), 'ClubCrest'),
  'club-metal': load(() => import('./demos/club'), 'ClubMetal'),
  'club-silk': load(() => import('./demos/club'), 'ClubSilk'),
  'mmo-mesh': load(() => import('./demos/mmo'), 'MmoMesh'),
  'mmo-palette': load(() => import('./demos/mmo'), 'MmoPalette'),
  'mega-holo': load(() => import('./demos/megaroll'), 'MegaHolo'),
  'mega-fan': load(() => import('./demos/megaroll'), 'MegaFan'),
  'rat-sheet': load(() => import('./demos/ratmats'), 'RatSheet'),
  'rat-ticker': load(() => import('./demos/ratmats'), 'RatTicker'),
} as const

export type DemoId = keyof typeof DEMOS

export function DemoStage({ id }: { id: DemoId }) {
  const Demo = DEMOS[id]
  return (
    <LazyMount className="h-full">
      <Demo />
    </LazyMount>
  )
}

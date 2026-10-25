'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
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
  'club-hero': load(() => import('./demos/club'), 'ClubHero'),
  'mega-hero': load(() => import('./demos/covers'), 'MegaRollHero'),
  'rat-hero': load(() => import('./demos/ratmats-hero'), 'RatMatsHero'),
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

/**
 * A demo that sits over a case study's still cover (a capture of the demo's own first frame). It mounts once the page
 * has loaded and the browser is idle (the still covers the gap, so the page's first paint never waits on it), and stays invisible until it has drawn: its images decoded, fonts ready and a few frames painted, then fades in over
 * the still, so the swap doesn't show.
 */
export function HeroDemo({ id }: { id: DemoId }) {
  const Demo = DEMOS[id]
  const box = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  const [mount, setMount] = useState(false)
  useEffect(() => {
    let id = 0
    const go = () => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
      id = ric ? ric(() => setMount(true), { timeout: 1500 }) : window.setTimeout(() => setMount(true), 300)
    }
    if (document.readyState === 'complete') go()
    else window.addEventListener('load', go, { once: true })
    return () => {
      window.removeEventListener('load', go)
      const cic = (window as Window & { cancelIdleCallback?: (n: number) => void }).cancelIdleCallback
      ;(cic ?? clearTimeout)(id)
    }
  }, [])
  useEffect(() => {
    const el = box.current
    if (!el || !mount) return
    let gone = false
    const started = performance.now()
    const check = async () => {
      if (gone) return
      const imgs = [...el.querySelectorAll('img')]
      const mounted = el.childElementCount > 0 && el.firstElementChild!.childElementCount > 0
      if (!mounted && performance.now() - started < 4000) return void window.setTimeout(check, 80)
      await Promise.all(imgs.map((i) => (i.complete ? Promise.resolve() : i.decode().catch(() => {}))))
      await document.fonts?.ready
      // a few frames so canvases and springs have painted their first state
      for (let k = 0; k < 6; k++) await new Promise((r) => requestAnimationFrame(r))
      if (!gone) setShown(true)
    }
    void check()
    return () => {
      gone = true
    }
  }, [mount])
  return (
    <div ref={box} className={`size-full transition-opacity duration-500 ${shown ? 'opacity-100' : 'opacity-0'}`}>
      {mount && <Demo />}
    </div>
  )
}

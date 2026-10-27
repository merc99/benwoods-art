'use client'

import { useEffect, useState } from 'react'
import { FilterPills } from '@/components/ui/FilterPills'

type Tab = 'demos' | 'system'

/**
 * Lab's two tabs, Demos and System, on the same sticky pill row as the Work filters. The choice lives in the URL
 * (?tab=system), so it can be shared; a link to something inside System (#color, #button) opens that tab.
 * Both panels are rendered on the server; the hidden one is only hidden.
 */
export function LabTabs({ demos, system, demoCount }: { demos: React.ReactNode; system: React.ReactNode; demoCount: number }) {
  const [tab, setTab] = useState<Tab>('demos')

  useEffect(() => {
    const pick = () => {
      const q = new URLSearchParams(window.location.search).get('tab')
      const id = decodeURIComponent(window.location.hash.slice(1))
      const inSystem = !!id && !!document.getElementById('lab-system')?.querySelector(`[id="${CSS.escape(id)}"]`)
      return q === 'system' || inSystem ? 'system' : 'demos'
    }
    const sync = () => {
      const next = pick()
      setTab(next)
      // the panel was hidden when the browser tried to jump to the hash: jump now that it's shown
      const id = window.location.hash.slice(1)
      if (id) requestAnimationFrame(() => document.getElementById(decodeURIComponent(id))?.scrollIntoView())
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const choose = (v: string) => {
    const next = v as Tab
    setTab(next)
    const url = new URL(window.location.href)
    if (next === 'system') url.searchParams.set('tab', 'system')
    else url.searchParams.delete('tab')
    url.hash = ''
    window.history.replaceState(null, '', url.pathname + url.search)
    // if the reader is already below the tab row, start the new tab at its top, just under the row
    requestAnimationFrame(() => {
      const panel = document.getElementById(`lab-${next}`)
      const bar = document.getElementById('lab-tabs')
      if (!panel || !bar) return
      const y = panel.getBoundingClientRect().top + window.scrollY - parseFloat(getComputedStyle(bar).top) - bar.offsetHeight
      if (window.scrollY > y) window.scrollTo({ top: y, behavior: 'instant' })
    })
  }

  return (
    <div style={{ ['--tabs-h' as string]: '57px' }}>
      <div id="lab-tabs" className="sticky top-[var(--header-h)] z-20 border-y border-rule bg-bg">
        <div className="shell flex items-center py-2">
          <div className="-ml-1 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterPills
              label="Lab sections"
              options={[
                { value: 'demos', label: 'Demos', count: demoCount },
                { value: 'system', label: 'System' },
              ]}
              value={tab}
              onChange={choose}
            />
          </div>
        </div>
      </div>
      <div id="lab-demos" hidden={tab !== 'demos'}>
        {demos}
      </div>
      <div id="lab-system" hidden={tab !== 'system'}>
        {system}
      </div>
    </div>
  )
}

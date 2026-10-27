'use client'

import { useSyncExternalStore } from 'react'
import { RollingDigits } from '@/components/fx/RollingDigits'
import { site } from '@/lib/site'

// One shared ticking store for every clock on the page.
let snapshot = ''
const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | undefined

const fmt = () =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: site.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'short',
  }).format(new Date())

function subscribe(cb: () => void) {
  listeners.add(cb)
  if (!timer) {
    snapshot = fmt()
    timer = setInterval(() => {
      snapshot = fmt()
      listeners.forEach((l) => l())
    }, 1000)
  }
  return () => {
    listeners.delete(cb)
    if (!listeners.size && timer) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

/** Nashville local time, e.g. 14:07:32 CDT. Renders a placeholder on the server. */
export function Clock({ className }: { className?: string }) {
  const value = useSyncExternalStore(subscribe, () => snapshot, () => '')
  const [time, zone] = value ? value.split(' ') : ['--:--:--', '']
  return (
    <span className={className}>
      {value ? <RollingDigits value={time} label={`Nashville time ${time} ${zone}`} /> : <span aria-hidden>{time}</span>}
      {/* visual only: the label above already says the zone */}
      {zone && <span aria-hidden data-zone={` ${zone}`} className="whitespace-pre before:content-[attr(data-zone)]" />}
    </span>
  )
}

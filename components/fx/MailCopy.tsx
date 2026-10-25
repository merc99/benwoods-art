'use client'
// Clicking an email link copies the address and says so, as well as opening the mail app. Without a mail app set
// up, a mailto: link does nothing visible, so the copy (and its note) is what tells you it worked. Applies to every
// mailto: link on the site.

import { useEffect, useState } from 'react'

export function MailCopy() {
  const [note, setNote] = useState<string | null>(null)

  useEffect(() => {
    let hide = 0
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="mailto:"]')
      if (!a) return
      const address = decodeURIComponent(a.getAttribute('href')!.slice(7).split('?')[0])
      void navigator.clipboard?.writeText(address).then(
        () => {
          setNote(`${address} copied`)
          clearTimeout(hide)
          hide = window.setTimeout(() => setNote(null), 2600)
        },
        () => {},
      )
    }
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
      clearTimeout(hide)
    }
  }, [])

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
      {note && (
        <p className="t-label animate-[wm-in_220ms_ease-out_both] rounded-full bg-fg px-4 py-2.5 text-bg shadow-[var(--shadow-float)] motion-reduce:animate-none">
          {note} <span aria-hidden>✓</span>
        </p>
      )}
    </div>
  )
}

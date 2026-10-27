'use client'
// Clicking an email link copies the address and says so, as well as opening the mail app. Without a mail app set
// up, a mailto: link does nothing visible, so the copy (and its note) is what tells you it worked. Applies to every
// mailto: link on the site.

import { useEffect, useState } from 'react'
import { Toast, ToastRegion } from '@/components/ui/Toast'

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
    <ToastRegion>{note && <Toast>{note}</Toast>}</ToastRegion>
  )
}

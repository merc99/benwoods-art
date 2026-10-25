'use client'
// Images fade in softly once they've loaded, instead of popping into an empty frame. Applies to every image the
// site renders (next/image, data-nimg) that hasn't loaded yet, including ones added later (galleries, lightbox).
// Already-loaded and high-priority images (the first screen) are left alone. Reduced motion: no fade.

import { useEffect } from 'react'

const FADE = 'opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)'

export function ImageFade() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const seen = new WeakSet<HTMLImageElement>()
    const take = (img: HTMLImageElement) => {
      if (seen.has(img)) return
      seen.add(img)
      if (img.complete && img.naturalWidth > 0) return
      if (img.getAttribute('fetchpriority') === 'high') return
      // the fade rides on top of the image's own transitions (e.g. a hover zoom) and is removed once done, so
      // those keep their own timing and easing
      const own = getComputedStyle(img).transition
      img.style.opacity = '0'
      img.style.transition = own && own !== 'all 0s ease 0s' ? own + ', ' + FADE : FADE
      const show = () => {
        img.style.opacity = ''
        window.setTimeout(() => (img.style.transition = ''), 460)
        img.removeEventListener('load', show)
        img.removeEventListener('error', show)
      }
      img.addEventListener('load', show)
      img.addEventListener('error', show)
    }
    const scan = (root: ParentNode) => root.querySelectorAll<HTMLImageElement>('img[data-nimg]').forEach(take)
    scan(document)
    const mo = new MutationObserver((list) => {
      for (const m of list)
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLImageElement && n.dataset.nimg) take(n)
          else if (n instanceof HTMLElement) scan(n)
        })
    })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [])
  return null
}

'use client'

import { ViewTransition } from 'react'

/**
 * Page transition (calm tier), on the browser's View Transitions: on a route change the old page fades out fast and
 * the new one fades in with an 8px rise. Project images named `cover-<slug>` (work cards, featured builds,
 * previous/next thumbnails, the case-study cover) morph from where they were to where they land instead of fading.
 * Nothing runs on the first load; reduced motion and browsers without the API just swap pages. CSS in globals.css.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div>{children}</div>
    </ViewTransition>
  )
}

import { ViewTransition } from 'react'

/**
 * Names a project's image frame for the card-to-cover morph: the same `slug` on a work card, a featured build, a
 * previous/next thumbnail and the case-study cover, so on navigation the frame travels and resizes from one to the
 * other (see app/template.tsx and the view-transition CSS in globals.css). One name per page.
 */
export function CoverMorph({ slug, children }: { slug: string; children: React.ReactNode }) {
  return (
    <ViewTransition name={`cover-${slug}`} share="morph" default="none">
      {children}
    </ViewTransition>
  )
}

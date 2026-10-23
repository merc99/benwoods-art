import type { DemoId } from '@/components/lab/DemoStage'

export type Demo = {
  id: DemoId
  title: string
  note: string
  /** Wide demos take the full row on desktop. */
  wide?: boolean
  height?: number
  /** Let the frame grow to its content on phones (tall demos). */
  autoOnPhone?: boolean
}

export type LabGroup = {
  project: string
  slug: string
  liveUrl?: string
  demos: Demo[]
}

/** Lab demos, grouped by the build they came from. Ports of the handoff components, restyled where noted. */
export const lab: LabGroup[] = [
  {
    project: 'Check-in',
    slug: 'checkin',
    liveUrl: 'https://check-in-web-six.vercel.app',
    demos: [
      { id: 'checkin-ring', title: 'Ring carousel', note: 'A 3D carousel. Drag, flick or use the arrow keys.', wide: true, height: 400 },
      { id: 'checkin-reactions', title: 'Emoji reactions', note: 'Pick an emoji and it flies to its chip as the count updates. On touch, hold and slide.' },
      { id: 'checkin-foil', title: 'Foil card', note: 'A card that tilts and catches the light under the pointer. The featured tiles on this site use it.' },
      { id: 'checkin-gloss', title: 'Glossy panel, rolling digits', note: 'Press Check in to update the count. Scrub the chart with a mouse, a finger or the arrow keys.' },
      { id: 'checkin-hold', title: 'Hold to confirm', note: 'Destructive actions confirm with a short hold. A quick tap shows a hint.' },
    ],
  },
  {
    project: '100K Club',
    slug: '100k-club',
    liveUrl: 'https://100k-club.netlify.app',
    demos: [
      { id: 'club-crest', title: 'Crest tilt and holo', note: 'The crest tilts toward the pointer with a gold sweep. Click to cycle the five rank finishes.', height: 420 },
      { id: 'club-silk', title: 'Silk shader', note: 'A WebGL background that brightens toward the pointer. Click to send a ring.', height: 420 },
      { id: 'club-metal', title: 'Metal lettering', note: 'Rank names in metal lettering, one finish per rank.', wide: true, height: 320 },
    ],
  },
  {
    project: 'MMO Nodes',
    slug: 'mmo-nodes',
    liveUrl: 'https://mmo-nodes.netlify.app/',
    demos: [
      { id: 'mmo-mesh', title: 'WebGL mesh gradient', note: 'A WebGL gradient with one color that follows the pointer.' },
      { id: 'mmo-palette', title: 'Command palette', note: 'The command palette from the prototype, also used across this site (⌘K).' },
    ],
  },
  {
    project: 'Mega Roll',
    slug: 'mega-roll',
    liveUrl: 'https://mega-roll.netlify.app/',
    demos: [
      { id: 'mega-holo', title: 'Holo character cards', note: 'Character cards that tilt, with foil on the art window.' },
      { id: 'mega-fan', title: 'Playable ability cards', note: 'Tap to shuffle the fan, or drag the top card up to play it. Enter plays it from the keyboard.', height: 400 },
    ],
  },
  {
    project: 'Rat Mats',
    slug: 'rat-mats',
    liveUrl: 'https://rat-mats.netlify.app/',
    demos: [
      { id: 'rat-sheet', title: 'The Sheet and the Registry', note: 'Every number in a 500-mat edition, with 12 marked squares. Type a number to find it on the sheet.', wide: true, height: 360, autoOnPhone: true },
      { id: 'rat-ticker', title: 'Scroll-direction ticker', note: 'A ticker that changes direction as you scroll the page.', wide: true, height: 200 },
    ],
  },
]

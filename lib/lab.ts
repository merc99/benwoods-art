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
      { id: 'checkin-wave', title: 'Wave, then all in', note: 'Wave at a crewmate who isn’t in yet. When the last one checks in, the banner says all in.', wide: true, height: 320 },
      { id: 'checkin-ring', title: 'Ring carousel', note: 'Drag or flick the ring.', wide: true, height: 400 },
      { id: 'checkin-reactions', title: 'Emoji reactions', note: 'Pick an emoji and it flies to its chip.' },
      { id: 'checkin-foil', title: 'Foil card', note: 'A card that catches the light as you move over it.' },
      { id: 'checkin-gloss', title: 'Glossy panel, rolling digits', note: 'Press Check in, then scrub the chart.' },
      { id: 'checkin-hold', title: 'Hold to confirm', note: 'Hold to confirm. A quick tap shows a hint.' },
    ],
  },
  {
    project: 'Chrometooth',
    slug: 'chrometooth',
    liveUrl: 'https://chrometooth.vercel.app',
    demos: [
      { id: 'ct-evidence', title: 'Evidence you can check', note: 'Pick a reason to find the log line behind it. The fix unlocks once every reason is checked.', wide: true, height: 440, autoOnPhone: true },
      { id: 'ct-bite', title: 'The bite', note: 'Fix a threat and it takes a bite out of its card.', wide: true, height: 470, autoOnPhone: true },
      { id: 'ct-activity', title: 'Activity log', note: 'Search the network’s log by typing or with the chips, then sort any column.', wide: true, height: 520 },
    ],
  },
  {
    project: '100K Club',
    slug: '100k-club',
    liveUrl: 'https://100k-club.netlify.app',
    demos: [
      { id: 'club-crest', title: 'Crest tilt and holo', note: 'The crest tilts toward the pointer. Click to change its finish.', height: 420 },
      { id: 'club-silk', title: 'Silk shader', note: 'A silk background that brightens toward the pointer. Click to send a ring.', height: 420 },
      { id: 'club-metal', title: 'Metal lettering', note: 'Rank names in metal lettering, one finish per rank.', wide: true, height: 320 },
    ],
  },
  {
    project: 'MMO Nodes',
    slug: 'mmo-nodes',
    liveUrl: 'https://mmo-nodes.netlify.app/',
    demos: [
      { id: 'mmo-mesh', title: 'Mesh gradient', note: 'A gradient with one color that follows the pointer.' },
      { id: 'mmo-palette', title: 'Command palette', note: 'The command palette from the prototype. This site uses it too (⌘K).' },
    ],
  },
  {
    project: 'Mega Roll',
    slug: 'mega-roll',
    liveUrl: 'https://mega-roll.netlify.app/',
    demos: [
      { id: 'mega-holo', title: 'Holo character cards', note: 'Character cards that tilt, with foil on the art window.' },
      { id: 'mega-fan', title: 'Playable ability cards', note: 'Tap to shuffle, or drag the top card up to play it.', height: 400 },
    ],
  },
]

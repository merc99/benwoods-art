// Merch photos, prepared by scripts/prepare-merch.mjs (assets/merch -> public/merch, 5:4).
// `placement` says where each one belongs: 'merch' (Home grid + Swag & Product), a project slug
// (that project's gallery), or 'ask' (not decided yet; shown on Home for review only).
// Captions only say what is printed on the piece. Brand and year are empty where unknown (left out of the caption).

export type MerchItem = {
  slug: string
  src: string
  alt: string
  item: string
  brand: string
  year: string
  placement: 'merch' | 'ask' | string
}

const m = (slug: string, item: string, brand: string, alt: string): MerchItem => ({
  slug,
  src: `/merch/${slug}.webp`,
  alt,
  item,
  brand,
  year: '', // add the year when known; empty fields are left out of the caption
  placement: 'merch',
})

export const merch: MerchItem[] = [
  m('bwtb-mockup-2', 'Tee', 'BWTB', 'A heather gray t-shirt with a front print of two armored figures in an arched frame above red lettering.'),
  m('frame-1', 'Tee', 'BWTB', 'A heather gray t-shirt with a small red “BWTB” print on the chest.'),
  m('group-43-1', 'Tee', '', 'A black t-shirt with two lines of red and orange script lettering across the chest.'),
  m('sunnyside-tee-brown', 'Tee', 'Sunnyside', 'A brown t-shirt with a white starburst emblem around the words “Sunnyside cannabis co.” on the chest.'),
  m('dreamline-script-cream', 'Tee', 'Dreamline', 'A cream t-shirt with “DreamLine” in orange script across the chest.'),
  m('dreamline-emblem-small', 'Tee', 'Dreamline', 'A black t-shirt with a tiny star, eye and globe emblem on the left chest.'),
  m('dreamline-arch-olive', 'Tee', 'Dreamline', 'An olive t-shirt with a small arched landscape print and text beneath it on the chest.'),
  m('dreamline-globe', 'Tee', 'Dreamline', 'A black t-shirt with a green wireframe globe and a wordmark across the chest.'),
  m('dreamline-hotline-forest', 'Tee', 'Dreamline', 'A forest green t-shirt with a short block of small code-style text on the left chest.'),
  m('dreamline-orb', 'Tee', 'Dreamline', 'A black t-shirt with a small blue-green orb and a white DREAMLINE wordmark on the chest.'),
  m('dreamline-emblem-maroon', 'Tee', 'Dreamline', 'A maroon t-shirt with the star, eye and globe emblem above a DREAMLINE wordmark.'),
  m('dreamline-patch', 'Tee', 'Dreamline', 'A black t-shirt with a small rectangular landscape patch print on the chest.'),
  m('dreamline-belief', 'Tee', 'Dreamline', 'A black t-shirt with “belief is just a habit of thought.” in small type on the left chest.'),
  m('dreamline-resistance-desire', 'Tee', 'Dreamline', 'A black t-shirt with “letting go means releasing resistance, not desire.” in small type, the last words in red and green.'),
  m('dreamline-polygon-bird-navy', 'Tee', 'Dreamline', 'A navy t-shirt with a yellow, orange and red line drawing of a polygon bird on the chest.'),
  m('cyberblade-chart', 'Tee', 'Cyberblade', 'A black t-shirt with a small gray line chart, marked with green and red points, on the chest.'),
  m('cyberblade-signal', 'Tee', 'Cyberblade', 'A black t-shirt with three thin candlestick bars in red and green, and a small yellow arrow, on the left chest.'),
  m('cyberblade-slippage-red', 'Tee', 'Cyberblade', 'A red t-shirt with “SLIPPAGE” in black pixel type on a white speech-bubble tag across the chest.'),
  m('cyberblade-patch', 'Tee', 'Cyberblade', 'A black t-shirt with a rectangular print of a pink frog in a robe holding a glowing sword, above star, eye and globe icons.'),
  m('cyberblade-wordmark', 'Tee', 'Cyberblade', 'A black t-shirt with a green barcode and a spaced-out CYBERBLADE wordmark on the left chest.'),
]

/** The shirts shown in the Merch grid (Home and the Merch project). The NGNC cap and the van tee are left out on purpose. */
export const homeMerch = merch.filter((x) => x.placement === 'merch')

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
  m('group-45', 'Tee', '', 'A black t-shirt with a white starburst emblem in the middle of the chest.'),
  m('t-shirt-mockup-2', 'Tee', 'Dreamline', 'A black t-shirt with “DreamLine” in orange script across the chest.'),
  m('t-shirt-mockup-3', 'Tee', '', 'A black t-shirt with a tiny star, eye and globe emblem on the left chest.'),
  m('t-shirt-mockup-4', 'Tee', '', 'A black t-shirt with a small arched landscape print and text beneath it on the chest.'),
  m('t-shirt-mockup-5', 'Tee', '', 'A black t-shirt with a green circular emblem and a wordmark across the chest.'),
  m('t-shirt-mockup-6', 'Tee', '', 'A black t-shirt with a short block of small text on the left chest.'),
  m('t-shirt-mockup-7', 'Tee', '', 'A black t-shirt with a small blue-green orb and a wordmark on the chest.'),
  m('t-shirt-mockup-8', 'Tee', 'Dreamline', 'A black t-shirt with the star, eye and globe emblem above a DREAMLINE wordmark.'),
  m('t-shirt-mockup-9', 'Tee', '', 'A black t-shirt with a small rectangular landscape patch print on the chest.'),
]

/** The shirts shown in the Merch grid (Home and the Merch project). The NGNC cap and the van tee are left out on purpose. */
export const homeMerch = merch.filter((x) => x.placement === 'merch')

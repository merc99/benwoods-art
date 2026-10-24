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
  m('bwtb-mockup-2', 'Tee', 'Bussin’ With the Boys', 'Bussin’ With the Boys armored knights tee in heather gray'),
  m('frame-1', 'Tee', 'Bussin’ With the Boys', 'Bussin’ With the Boys chest logo tee in heather gray'),
  m('group-43-1', 'Tee', 'Dreamline', 'Dreamline red and orange script tee in black'),
  m('sunnyside-tee-brown', 'Tee', 'Sunnyside', 'Sunnyside starburst tee in brown'),
  m('dreamline-script-cream', 'Tee', 'Dreamline', 'Dreamline script tee in cream'),
  m('dreamline-emblem-small', 'Tee', 'Dreamline', 'Dreamline small emblem tee in black'),
  m('dreamline-arch-olive', 'Tee', 'Dreamline', 'Dreamline arch landscape tee in olive'),
  m('dreamline-globe', 'Tee', 'Dreamline', 'Dreamline wireframe globe tee in black'),
  m('dreamline-hotline-forest', 'Tee', 'Dreamline', 'Dreamline hotline code tee in forest green'),
  m('dreamline-orb', 'Tee', 'Dreamline', 'Dreamline orb tee in black'),
  m('dreamline-emblem-maroon', 'Tee', 'Dreamline', 'Dreamline emblem and wordmark tee in maroon'),
  m('dreamline-patch', 'Tee', 'Dreamline', 'Dreamline landscape patch tee in black'),
  m('dreamline-belief', 'Tee', 'Dreamline', 'Dreamline “belief is just a habit of thought” tee in black'),
  m('dreamline-resistance-desire', 'Tee', 'Dreamline', 'Dreamline “releasing resistance, not desire” tee in black'),
  m('dreamline-polygon-bird-navy', 'Tee', 'Dreamline', 'Dreamline polygon bird tee in navy'),
  m('cyberblade-chart', 'Tee', 'Cyberblade', 'Cyberblade line chart tee in black'),
  m('cyberblade-signal', 'Tee', 'Cyberblade', 'Cyberblade candlestick tee in black'),
  m('cyberblade-slippage-red', 'Tee', 'Cyberblade', 'Cyberblade SLIPPAGE tag tee in red'),
  m('cyberblade-patch', 'Tee', 'Cyberblade', 'Cyberblade frog swordsman patch tee in black'),
  m('cyberblade-wordmark', 'Tee', 'Cyberblade', 'Cyberblade barcode wordmark tee in black'),
]

/** Every shirt, for the Merch project page. */
export const allMerch = merch.filter((x) => x.placement === 'merch')

/** The 8 on Home: a mix of brands and colors. The full set is on /work/merch. */
const HOME = ['bwtb-mockup-2', 'sunnyside-tee-brown', 'dreamline-script-cream', 'cyberblade-slippage-red', 'dreamline-polygon-bird-navy', 'cyberblade-patch', 'dreamline-arch-olive', 'frame-1']
export const homeMerch = HOME.map((s) => allMerch.find((x) => x.slug === s)).filter((x): x is MerchItem => !!x)

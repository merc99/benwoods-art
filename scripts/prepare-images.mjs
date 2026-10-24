// Covers for the five builds come from scripts/make-covers.mjs; this script never writes a cover.webp for them.
// Copies source images (assets/, handoff/*/assets) into public/work/<slug>/ as WebP, max 2400px wide.
// Run: node scripts/prepare-images.mjs   (re-run after adding or replacing a source image)
import sharp from 'sharp'
import { mkdirSync, existsSync, statSync } from 'node:fs'
import { dirname } from 'node:path'

const map = {
  'checkin/feed-dark': 'assets/captures/checkin-feed.png',
  'checkin/phone': 'assets/framer/checkin-cover.png',
  '100k-club/crest-lineup': 'handoff/100k-club/assets/og-image.png',
  '100k-club/crest': 'handoff/100k-club/assets/crest-hero-gold-logo.webp',
    'rat-mats/dart': 'handoff/rat-mats/assets/mat-dart.jpg',
  'rat-mats/currents': 'handoff/rat-mats/assets/mat-currents.jpg',
  'mega-roll/d20': 'handoff/mega-roll/assets/d20-hero.webp',
  'mega-roll/spellbender-card': 'handoff/mega-roll/assets/spellbender-card.webp',
  'dreamline/cover': 'assets/framer/dreamline-cover.png',
  'mamie-s-sunday-best/cover': 'assets/framer/mamie-s-sunday-best-cover.png',
  'gildedcan/cover': 'assets/framer/gildedcan-cover.png',
  'flexible/cover': 'assets/framer/flexible-cover.png',
  'solar-punk/cover': 'assets/framer/solar-punk-cover.png',
  'wagdie/cover': 'assets/framer/wagdie-cover.png',
  'retrofuturism/cover': 'assets/framer/retrofuturism-cover.png',
  // live builds (scripts/capture-live.mjs)
  '100k-club/site-hero': 'assets/captures/100k-hero.png',
  '100k-club/site-inside': 'assets/captures/100k-inside.png',
  '100k-club/site-ladder': 'assets/captures/100k-ladder.png',
  '100k-club/site-leaderboard': 'assets/captures/100k-leaderboard.png',
  '100k-club/site-wins': 'assets/captures/100k-wins.png',
  '100k-club/site-membership': 'assets/captures/100k-membership.png',
  'rat-mats/site-hero': 'assets/captures/ratmats-hero.png',
  'rat-mats/site-series': 'assets/captures/ratmats-series.png',
  'rat-mats/site-registry': 'assets/captures/ratmats-registry.png',
  'rat-mats/site-archive': 'assets/captures/ratmats-archive.png',
  'mmo-nodes/app-dashboard': 'assets/captures/mmo-dashboard.png',
  'mmo-nodes/app-dungeons': 'assets/captures/mmo-dungeons.png',
  'mmo-nodes/app-character': 'assets/captures/mmo-character.png',
  'mmo-nodes/app-summon': 'assets/captures/mmo-summon.png',
  'mmo-nodes/app-map': 'assets/captures/mmo-map.png',
  'mmo-nodes/app-burn': 'assets/captures/mmo-burn.png',
  'mmo-nodes/app-stats': 'assets/captures/mmo-stats.png',
  // galleries
  'checkin/explore': 'assets/captures/checkin-explore.png',
  'checkin/you': 'assets/captures/checkin-you.png',
  'checkin/concept-01': 'assets/framer/checkin-01.png',
  'checkin/concept-02': 'assets/framer/checkin-02.png',
  'checkin/concept-03': 'assets/framer/checkin-03.png',
  'checkin/logo': 'assets/framer/checkin-04.png',
  '100k-club/crest-member': 'handoff/100k-club/assets/crest-hero-member.webp',
  '100k-club/crest-rising-sharp': 'handoff/100k-club/assets/crest-hero-rising-sharp.webp',
  '100k-club/crest-sharp': 'handoff/100k-club/assets/crest-hero-sharp.webp',
  '100k-club/crest-club-legend': 'handoff/100k-club/assets/crest-hero-club-legend.webp',
  '100k-club/win-slip': 'handoff/100k-club/assets/win-slip-01.jpg',
  'mmo-nodes/simulator': 'assets/captures/mmo-simulator.png',
  'rat-mats/storefront': 'assets/captures/rat-mats-storefront.png',
  'rat-mats/archive': 'assets/captures/rat-mats-archive.png',
  'mega-roll/landing': 'assets/captures/mega-roll-landing.png',
  'mega-roll/rot-paladin-card': 'handoff/mega-roll/assets/rot-paladin-card.webp',
  'mega-roll/dream-beast-card': 'handoff/mega-roll/assets/dream-beast-card.webp',
  'mega-roll/spellbender-mini': 'handoff/mega-roll/assets/spellbender-mini.webp',
  'mega-roll/rot-paladin-mini': 'handoff/mega-roll/assets/rot-paladin-mini.webp',
  'mega-roll/dream-beast-mini': 'handoff/mega-roll/assets/dream-beast-mini.webp',
  'mega-roll/spellbender-dice': 'handoff/mega-roll/assets/spellbender-dice.webp',
  'mega-roll/rot-paladin-dice': 'handoff/mega-roll/assets/rot-paladin-dice.webp',
  'mega-roll/dream-beast-dice': 'handoff/mega-roll/assets/dream-beast-dice.webp',
  'mega-roll/ability-power': 'handoff/mega-roll/assets/ability-card-power.webp',
  'mega-roll/ability-reaction': 'handoff/mega-roll/assets/ability-card-reaction.webp',
  'mega-roll/ability-modifier': 'handoff/mega-roll/assets/ability-card-modifier.webp',
  'dreamline/01': 'assets/framer/dreamline-01.png',
  'dreamline/02': 'assets/framer/dreamline-02.png',
  'dreamline/03': 'assets/framer/dreamline-03.png',
  'dreamline/04': 'assets/framer/dreamline-04.png',
  'mamie-s-sunday-best/01': 'assets/framer/mamie-s-sunday-best-01.png',
  'mamie-s-sunday-best/02': 'assets/framer/mamie-s-sunday-best-02.png',
  'mamie-s-sunday-best/03': 'assets/framer/mamie-s-sunday-best-03.png',
  'mamie-s-sunday-best/04': 'assets/framer/mamie-s-sunday-best-04.png',
  'gildedcan/01': 'assets/framer/gildedcan-01.png',
  'gildedcan/02': 'assets/framer/gildedcan-02.png',
  'gildedcan/03': 'assets/framer/gildedcan-03.png',
  'flexible/01': 'assets/framer/flexible-01.png',
  'flexible/02': 'assets/framer/flexible-02.png',
  'flexible/03': 'assets/framer/flexible-03.png',
  'solar-punk/01': 'assets/framer/solar-punk-01.png',
  'solar-punk/02': 'assets/framer/solar-punk-02.png',
  'solar-punk/03': 'assets/framer/solar-punk-03.png',
  'wagdie/01': 'assets/framer/wagdie-01.png',
  'wagdie/02': 'assets/framer/wagdie-02.png',
  'wagdie/03': 'assets/framer/wagdie-03.png',
  'wagdie/04': 'assets/framer/wagdie-04.png',
  'retrofuturism/01': 'assets/framer/retrofuturism-01.png',
  'retrofuturism/02': 'assets/framer/retrofuturism-02.png',
  'retrofuturism/03': 'assets/framer/retrofuturism-03.png',
  'retrofuturism/04': 'assets/framer/retrofuturism-04.png',
}

for (const [out, src] of Object.entries(map)) {
  if (!existsSync(src)) { console.warn('missing', src); continue }
  const dest = `public/work/${out}.webp`
  // skip outputs that are already newer than their source (and files the dev server has open)
  if (existsSync(dest) && statSync(dest).mtimeMs >= statSync(src).mtimeMs) continue
  mkdirSync(dirname(dest), { recursive: true })
  try {
    const info = await sharp(src).resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 92, smartSubsample: true }).toFile(dest)
    console.log(dest, `${info.width}x${info.height}`, Math.round(info.size / 1024) + 'KB')
  } catch (e) {
    console.warn('could not write', dest, '-', e.message, '(stop the dev server and rerun)')
  }
}

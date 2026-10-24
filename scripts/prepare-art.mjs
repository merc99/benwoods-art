// Prepares new artwork sets. Originals in assets/ are never touched.
//  - Rat Mats designs  assets/MOUSEPAD/*.png      -> public/work/rat-mats/mats/design-NN.webp (whole, wide ratio)
//  - Merc Eats drawings assets/merceats/*.png     -> public/work/merc-eats/drawing-NN.webp (whole; exact duplicates skipped)
//  - Playlist covers   assets/PLAYLIST ART/*.png  -> public/work/playlist-covers/<title>.webp (square, see lib/playlists.ts)
// Every image gets its solid borders trimmed first (scripts/lib/trim.mjs). Writes assets/review/art-report.json.
// Run: node scripts/prepare-art.mjs
import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { trimBorders } from './lib/trim.mjs'
import { playlistArt } from './playlist-art.mjs'

const report = []
const out = async (buf, dest, opts) => {
  rmSync(dest, { force: true })
  return sharp(buf).resize({ width: opts.max, height: opts.max, fit: 'inside', withoutEnlargement: true }).webp({ quality: opts.q ?? 84 }).toFile(dest)
}

// Rat Mats designs: whole artwork at the mats' own ratio, named in filename order
{
  const dir = 'assets/MOUSEPAD'
  mkdirSync('public/work/rat-mats/mats', { recursive: true })
  const files = readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort((a, b) => a.localeCompare(b))
  for (const [i, f] of files.entries()) {
    const t = await trimBorders(join(dir, f))
    const dest = `public/work/rat-mats/mats/design-${String(i + 1).padStart(2, '0')}.webp`
    const info = await out(t.buffer, dest, { max: 2800 })
    report.push({ set: 'mats', file: f, out: dest, trim: t.trim, original: `${t.original.w}x${t.original.h}`, size: `${info.width}x${info.height}` })
  }
}

// Merc drawings: whole, square originals; exact duplicates are skipped
{
  const dir = 'assets/merceats'
  mkdirSync('public/work/merc-eats', { recursive: true })
  const seen = new Map()
  // phone exports (IMG_####) were added later: they go after the originals so earlier numbers never shift
  const later = (f) => (/^IMG_\d+/i.test(f) ? 1 : 0)
  const files = readdirSync(dir)
    .filter((f) => /\.(png|jpe?g)$/i.test(f))
    .sort((a, b) => later(a) - later(b) || a.localeCompare(b))
  let n = 0
  for (const f of files) {
    const hash = createHash('md5').update(readFileSync(join(dir, f))).digest('hex')
    if (seen.has(hash)) {
      report.push({ set: 'merc', file: f, duplicateOf: seen.get(hash) })
      continue
    }
    seen.set(hash, f)
    const t = await trimBorders(join(dir, f))
    const dest = `public/work/merc-eats/drawing-${String(++n).padStart(2, '0')}.webp`
    const info = await out(t.buffer, dest, { max: 1800 })
    report.push({ set: 'merc', file: f, out: dest, trim: t.trim, original: `${t.original.w}x${t.original.h}`, size: `${info.width}x${info.height}` })
  }
}

// Playlist covers: Spotify shows them square, so a centered square of the (slightly portrait) artwork
const covers = {}
{
  mkdirSync('public/work/playlist-covers', { recursive: true })
  for (const p of playlistArt) {
    const t = await trimBorders(join('assets/PLAYLIST ART', p.file))
    const s = Math.min(t.width, t.height)
    const sq = await sharp(t.buffer).extract({ left: Math.floor((t.width - s) / 2), top: Math.floor((t.height - s) / 2), width: s, height: s }).png().toBuffer()
    // the file name carries a fingerprint of the art, so a changed cover never shows a cached old one
    const hash = createHash('md5').update(readFileSync(join('assets/PLAYLIST ART', p.file))).digest('hex').slice(0, 8)
    for (const f of readdirSync('public/work/playlist-covers')) if (f.startsWith(`${p.slug}.`) || f.startsWith(`${p.slug}-`)) rmSync(`public/work/playlist-covers/${f}`)
    const dest = `public/work/playlist-covers/${p.slug}-${hash}.webp`
    covers[p.slug] = dest.replace('public', '')
    const info = await out(sq, dest, { max: 1200 })
    report.push({ set: 'playlist', file: p.file, out: dest, title: p.title, url: p.url, matched: p.match, trim: t.trim, original: `${t.original.w}x${t.original.h}`, size: `${info.width}x${info.height}` })
  }
}

// record each cover's file in content/playlists.json
{
  const list = JSON.parse(readFileSync('content/playlists.json', 'utf8'))
  for (const p of list) if (covers[p.title]) p.cover = covers[p.title]
  const rows = list.map((p) => '  ' + JSON.stringify(p).replace(/,"/g, ', "').replace(/":/g, '": '))
  writeFileSync('content/playlists.json', `[\n${rows.join(',\n')}\n]\n`)
}

mkdirSync('assets/review', { recursive: true })
writeFileSync('assets/review/art-report.json', JSON.stringify(report, null, 1))
for (const r of report) console.log(r.set.padEnd(9), r.file.padEnd(42), r.duplicateOf ? `duplicate of ${r.duplicateOf}` : `${r.original} -> ${r.size} trim ${JSON.stringify(r.trim)}`)

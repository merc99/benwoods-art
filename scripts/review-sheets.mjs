// Review sheets for Ben: new covers side by side, and every new image with its caption / link.
// Run: node scripts/review-sheets.mjs  -> assets/review/covers.jpg, assets/review/new-images.jpg
import sharp from 'sharp'
import { readFileSync } from 'node:fs'

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const label = (w, h, lines, size = 18) =>
  Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#0f0f0e"/>${lines
    .map((l, i) => `<text x="10" y="${24 + i * (size + 8)}" font-family="monospace" font-size="${size}" fill="${l.c ?? '#f4ecdc'}">${esc(l.t)}</text>`)
    .join('')}</svg>`)

async function sheet(out, cells, { cols, cw, ch, lh }) {
  const rows = Math.ceil(cells.length / cols)
  const W = cols * cw + (cols + 1) * 16
  const H = rows * (ch + lh) + (rows + 1) * 16
  const comp = []
  for (const [i, c] of cells.entries()) {
    const x = 16 + (i % cols) * (cw + 16)
    const y = 16 + Math.floor(i / cols) * (ch + lh + 16)
    const img = await sharp(c.src).resize(cw, ch, { fit: 'contain', background: '#1a1917' }).toBuffer()
    comp.push({ input: img, left: x, top: y }, { input: label(cw, lh, c.lines), left: x, top: y + ch })
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: '#0f0f0e' } }).composite(comp).jpeg({ quality: 84 }).toFile(out)
  console.log(out)
}

// 1. covers, as the cards show them (16:10)
await sheet(
  'assets/review/covers.jpg',
  [
    ['checkin', 'cover-dark', 'kept'],
    ['100k-club', 'cover-mark', 'mark only'],
    ['mmo-nodes', 'cover-mark', 'mark only'],
    ['rat-mats', 'cover-mark2', 'mark only'],
    ['mega-roll', 'cover-mark', 'mark only'],
    ['playlist-covers', 'cover', 'new · Personal'],
    ['merc-eats', 'cover', 'new · Personal'],
  ].map(([slug, name, note]) => ({ src: `public/work/${slug}/${name}.webp`, lines: [{ t: `${slug} · ${note}` }] })),
  { cols: 3, cw: 640, ch: 400, lh: 40 },
)

// 2. every new image
const report = JSON.parse(readFileSync('assets/review/art-report.json', 'utf8'))
const cells = []
for (const r of report.filter((x) => x.set === 'mats'))
  cells.push({ src: r.out, lines: [{ t: `RAT MATS · ${r.out.split('/').pop().replace('.webp', '').replace('design-', 'Design ')}` }, { t: `from ${r.file} (unnamed)`, c: '#b8b09f' }] })
const pl = JSON.parse(readFileSync('content/playlists.json', 'utf8'))
for (const p of pl)
  cells.push({
    src: `public/work/playlist-covers/${p.title}.webp`,
    lines: [
      { t: `PLAYLIST · ${p.title} · ${p.month}${p.match === 'tentative' ? '  (match to confirm)' : ''}`, c: p.match === 'tentative' ? '#ff5a2e' : '#f4ecdc' },
      { t: `open.spotify.com/playlist/${p.id}`, c: '#b8b09f' },
      { t: `from ${p.file}`, c: '#b8b09f' },
    ],
  })
for (const p of pl) cells.push({ src: `assets/playlist-oembed/${p.id}.jpg`, lines: [{ t: `SPOTIFY'S OWN COVER · ${p.title}`, c: '#b8b09f' }, { t: 'for comparison only, not used', c: '#b8b09f' }] })
const july = 'assets/playlist-oembed/5E7yuCMolw8cNWi7H4tZ3r.jpg'
cells.push({ src: july, lines: [{ t: "SPOTIFY'S OWN COVER · july26", c: '#ff5a2e' }, { t: 'no matching file in PLAYLIST ART', c: '#ff5a2e' }] })
for (const f of ['SDFSDfSDF.png', 'adfgkl;adsjfkgl;ksdlf;kg.png', 'mar26new.png', 'sadgadfhsfdgjhsfgjsfgj.png', 'this1.png'])
  cells.push({ src: `assets/PLAYLIST ART/${f}`, lines: [{ t: 'PLAYLIST ART · no link', c: '#ff5a2e' }, { t: f, c: '#b8b09f' }] })
const captions = { 'drawing-01': 'Infinite Merc', 'drawing-02': 'Merc in a jar', 'drawing-03': 'Wizard Merc (cover)', 'drawing-04': 'Spooked', 'drawing-05': 'Portrait' }
for (const r of report.filter((x) => x.set === 'merc' && x.out)) {
  const k = r.out.split('/').pop().replace('.webp', '')
  cells.push({ src: r.out, lines: [{ t: `MERC EATS · ${captions[k]}` }, { t: `from ${r.file}`, c: '#b8b09f' }] })
}
await sheet('assets/review/new-images.jpg', cells, { cols: 4, cw: 480, ch: 360, lh: 84 })

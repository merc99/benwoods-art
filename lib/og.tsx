// Share cards (Open Graph / Twitter) for every page, rendered at build time with next/og.
// Fonts: Munro (OFL, see app/fonts/README.md), Space Grotesk and Roboto Mono from @fontsource (OFL / Apache 2.0).
import 'server-only'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import sharp from 'sharp'

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

const ink = '#0f0f0e'
const cream = '#f4ecdc'
const muted = '#a8a194'
const signal = '#ff5a2e'

// Build-time only (every card is prerendered), so keep these reads out of the server bundle trace.
const font = (p: string) => readFile(join(/*turbopackIgnore: true*/ process.cwd(), p))

/** Cover art as a PNG data URL (next/og can't read webp). */
async function cover(src: string) {
  const buf = await sharp(join(/*turbopackIgnore: true*/ process.cwd(), 'public', decodeURI(src)))
    .resize(1080, 1080, { fit: 'inside' })
    .png()
    .toBuffer()
  return `data:image/png;base64,${buf.toString('base64')}`
}

export async function ogImage({ eyebrow, title, image }: { eyebrow: string; title: string; image?: string }) {
  const [munro, grotesk, mono] = await Promise.all([
    font('app/fonts/Munro.ttf'),
    font('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff'),
    font('node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-500-normal.woff'),
  ])
  const art = image ? await cover(image) : null
  const big = title.length > 22 ? 76 : 104

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: ink, color: cream }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 64, flex: 1 }}>
          <div style={{ fontFamily: 'Munro', fontSize: 56, lineHeight: 1 }}>ben woods</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Roboto Mono', fontSize: 24, letterSpacing: 2, color: muted, textTransform: 'uppercase' }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: signal, marginRight: 16 }} />
              {eyebrow}
            </div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: big, lineHeight: 0.95, letterSpacing: -2, marginTop: 20, textTransform: 'uppercase' }}>
              {title}
            </div>
          </div>
          <div style={{ fontFamily: 'Roboto Mono', fontSize: 22, color: muted, letterSpacing: 1 }}>benwoods.art</div>
        </div>
        {art && (
          <div style={{ width: 500, height: '100%', display: 'flex', background: '#1b1a18' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={art} alt="" width={500} height={630} style={{ width: 500, height: 630, objectFit: 'cover' }} />
          </div>
        )}
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: 'Munro', data: munro, weight: 400 },
        { name: 'Space Grotesk', data: grotesk, weight: 700 },
        { name: 'Roboto Mono', data: mono, weight: 500 },
      ],
    },
  )
}

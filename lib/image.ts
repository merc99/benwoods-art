// Reads an image's pixel size from /public at build time, so case-study images render uncropped
// at their own proportions with next/image (no layout shift).
import 'server-only'
import { join } from 'node:path'
import sharp from 'sharp'

const cache = new Map<string, { width: number; height: number }>()

export async function imageSize(src: string): Promise<{ width: number; height: number }> {
  const hit = cache.get(src)
  if (hit) return hit
  const meta = await sharp(join(process.cwd(), 'public', src)).metadata()
  const size = { width: meta.width ?? 1600, height: meta.height ?? 1000 }
  cache.set(src, size)
  return size
}

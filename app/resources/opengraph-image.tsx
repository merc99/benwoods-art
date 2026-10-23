import { ogContentType, ogImage, ogSize } from '@/lib/og'

export const alt = 'Ben Woods — Resources'
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return ogImage({ eyebrow: 'Tools and references', title: 'Resources' })
}

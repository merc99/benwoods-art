import { ogContentType, ogImage, ogSize } from '@/lib/og'

export const alt = 'Ben Woods — About'
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return ogImage({ eyebrow: 'Nashville, TN', title: 'About' })
}

import { ogContentType, ogImage, ogSize } from '@/lib/og'

export const alt = 'Ben Woods — Work'
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return ogImage({ eyebrow: 'Selected work', title: 'Work' })
}

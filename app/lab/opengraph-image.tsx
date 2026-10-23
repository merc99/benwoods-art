import { ogContentType, ogImage, ogSize } from '@/lib/og'

export const alt = 'Ben Woods — Lab'
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return ogImage({ eyebrow: 'Experiments', title: 'Lab' })
}

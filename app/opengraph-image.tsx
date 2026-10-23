import { ogContentType, ogImage, ogSize } from '@/lib/og'

export const alt = 'Ben Woods — Designer and builder'
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return ogImage({ eyebrow: 'Product design · Front end · Brand & print', title: 'Designer and builder' })
}

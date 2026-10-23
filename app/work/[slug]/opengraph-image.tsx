import { ogContentType, ogImage, ogSize } from '@/lib/og'
import { categoryName } from '@/lib/categories'
import { getProject, getProjects } from '@/lib/work'

export const alt = 'A project by Ben Woods'
export const size = ogSize
export const contentType = ogContentType

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProject((await params).slug)!
  return ogImage({ eyebrow: categoryName[p.category], title: p.title, image: p.cover || undefined })
}

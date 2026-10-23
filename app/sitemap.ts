import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'
import { getProjects } from '@/lib/work'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/work', '/lab', '/resources', '/about'].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.8,
  }))
  const projects = getProjects().map((p) => ({ url: `${site.url}/work/${p.slug}`, changeFrequency: 'yearly' as const, priority: 0.6 }))
  return [...pages, ...projects]
}

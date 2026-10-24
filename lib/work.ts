// Reads /content/work/*.mdx. Adding a project = one MDX file + its images in /public/work/<slug>/.
import 'server-only'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import type { Category } from './categories'

export { categories, categoryLabel, type Category } from './categories'

export type GalleryItem = {
  /** Image (.webp/.jpg/.png) or short video (.mp4/.webm). Omit with `placeholder`. */
  src?: string
  alt?: string
  caption?: string
  /** Shown as a dashed slot instead of media, e.g. "Recording coming. ..." */
  placeholder?: string
  span?: 'full' | 'half' | 'third' | 'quarter'
  /** Items sharing a group get a heading in the gallery, e.g. "The mats". */
  group?: string
}

export type Project = {
  title: string
  slug: string
  category: Category
  tags: string[]
  year: number
  role: string
  stack: string[]
  status: string
  liveUrl: string
  /** Button text for the live link (defaults to "View live site"). */
  liveLabel: string
  repoUrl: string
  /** A custom section rendered on the case study, e.g. 'playlists'. */
  module: '' | 'playlists' | 'merch'
  /** 'playful' sets the gallery as loose, tilted prints. */
  galleryStyle: '' | 'playful'
  cover: string
  /** Optional 2:1 cover for the full-width Home tile. */
  coverWide: string
  coverAlt: string
  /** CSS object-position for cropped tiles, e.g. "top" or "left top". Defaults to center. */
  coverPosition: string
  /** 'contain' fits the whole cover inside cropped tiles, on `coverBg` (the project's own color). */
  coverFit: 'cover' | 'contain'
  coverBg: string
  /** A product screenshot shown in a DeviceFrame as the case-study cover instead of `cover`. */
  coverScreen: string
  /** Alt text for `coverScreen`. */
  coverScreenAlt: string
  summary: string
  order: number
  featured: boolean
  draft: boolean
  interesting: string[]
  gallery: GalleryItem[]
  body: string
}

/** What list views and tiles need (safe to pass to client components). */
export type ProjectCard = Pick<
  Project,
  'title' | 'slug' | 'category' | 'tags' | 'year' | 'role' | 'cover' | 'coverWide' | 'coverAlt' | 'coverPosition' | 'coverFit' | 'coverBg' | 'summary' | 'featured'
>

const dir = join(process.cwd(), 'content', 'work')

function load(): Project[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const { data, content } = matter(readFileSync(join(dir, f), 'utf8'))
      return {
        tags: [],
        stack: [],
        liveUrl: '',
        liveLabel: '',
        repoUrl: '',
        module: '',
        galleryStyle: '',
        cover: '',
        coverWide: '',
        coverAlt: '',
        coverPosition: 'center',
        coverFit: 'cover',
        coverBg: '',
        coverScreen: '',
        coverScreenAlt: '',
        summary: '',
        featured: false,
        draft: false,
        interesting: [],
        gallery: [],
        ...data,
        year: Number(data.year),
        order: Number(data.order ?? 99),
        body: content.trim(),
      } as unknown as Project
    })
    .sort((a, b) => a.order - b.order)
}

/** Published projects (drafts hidden), in `order`. */
export function getProjects(): Project[] {
  return load().filter((p) => !p.draft)
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug)
}

export function bySlug(slugs: string[]): Project[] {
  const all = getProjects()
  return slugs.map((s) => all.find((p) => p.slug === s)).filter((p): p is Project => Boolean(p))
}

export function toCard(p: Project): ProjectCard {
  const { title, slug, category, tags, year, role, cover, coverWide, coverAlt, coverPosition, coverFit, coverBg, summary, featured } = p
  return { title, slug, category, tags, year, role, cover, coverWide, coverAlt, coverPosition, coverFit, coverBg, summary, featured }
}

/** Previous and next project in site order, wrapping around. */
export function getAdjacent(slug: string): { prev: Project; next: Project } {
  const all = getProjects()
  const i = all.findIndex((p) => p.slug === slug)
  return { prev: all[(i - 1 + all.length) % all.length], next: all[(i + 1) % all.length] }
}

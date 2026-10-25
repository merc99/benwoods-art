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
  /** Bold name shown before the caption, e.g. a single's title. */
  title?: string
}

/** One ink in a palette section: its name, what it's used for, and its hex. */
export type Ink = { name: string; use: string; hex: string }

/**
 * A titled section of its own on the case study, after the story: optional intro text (markdown), then
 * figures (laid out like the gallery) or palette swatches. Rendered in order, before modules and the gallery.
 */
export type CaseSection = {
  title: string
  intro?: string
  items?: GalleryItem[]
  /** Open the figures in the lightbox on click. */
  lightbox?: boolean
  /** Word after the count in the section header, e.g. "details" (default "images"). */
  unit?: string
  palette?: Ink[]
  /** Paper the swatches sit on (hex). */
  paper?: string
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
  /** Optional cover for grid cards only, when `cover` doesn't crop well to the card's shape. */
  coverTile: string
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
  /** false: the cover only shows on cards; the case study goes straight from the header to the story. */
  pageCover: boolean
  /** A live demo laid over the case-study cover (the static cover shows until it draws), e.g. 'club-hero'. */
  heroDemo: string
  /** Sharp cover sizes (WebP, served as-is) that switch the case-study cover to a hover glow on its linework. */
  coverGlow: { src: string; w: number }[]
  /** Lab demo ids shown in an Interactive section on the case study. */
  demos: string[]
  /** The live site, run inside the cover frame on desktop (over `coverScreen` or `cover`). */
  liveFrame: string
  /** The viewport width the live frame renders at (default 1440). */
  liveFrameWidth: number
  /** How the work was made, shown in the spec table, e.g. "Drawn by hand, digitally. No AI." */
  medium: string
  summary: string
  order: number
  featured: boolean
  draft: boolean
  interesting: string[]
  gallery: GalleryItem[]
  sections: CaseSection[]
  body: string
}

/** What list views and tiles need (safe to pass to client components). */
export type ProjectCard = Pick<
  Project,
  'title' | 'slug' | 'category' | 'tags' | 'year' | 'role' | 'cover' | 'coverWide' | 'coverTile' | 'coverAlt' | 'coverPosition' | 'coverFit' | 'coverBg' | 'summary' | 'featured'
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
        coverTile: '',
        coverAlt: '',
        coverPosition: 'center',
        coverFit: 'cover',
        coverBg: '',
        coverScreen: '',
        coverScreenAlt: '',
        pageCover: true,
        heroDemo: '',
        demos: [],
        coverGlow: [],
        liveFrame: '',
        liveFrameWidth: 1440,
        medium: '',
        summary: '',
        featured: false,
        draft: false,
        interesting: [],
        gallery: [],
        sections: [],
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
  const { title, slug, category, tags, year, role, cover, coverWide, coverTile, coverAlt, coverPosition, coverFit, coverBg, summary, featured } = p
  return { title, slug, category, tags, year, role, cover, coverWide, coverTile, coverAlt, coverPosition, coverFit, coverBg, summary, featured }
}

/** Previous and next project in site order, wrapping around. */
/** Neighbors in Work order (flagships first). No wraparound: the first has no prev, the last no next. */
export function getAdjacent(slug: string): { prev: Project | null; next: Project | null } {
  const all = getProjects()
  const i = all.findIndex((p) => p.slug === slug)
  return { prev: i > 0 ? all[i - 1] : null, next: i >= 0 && i < all.length - 1 ? all[i + 1] : null }
}

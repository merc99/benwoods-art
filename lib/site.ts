// Everything editable about the site in one place: the status strip, nav and links.

export const site = {
  name: 'Ben Woods',
  url: 'https://benwoods.art',
  description: 'Ben Woods — designer in Nashville. Product design, front end, brand and print.',
  hero: {
    title: 'Ben Woods',
    lede: 'Designer and builder working across product, front end, brand and print.',
    disciplines: ['Product design', 'Front end', 'Brand & print'],
    location: 'Nashville, TN',
  },
  /** The mono status strip on Home. Edit `currently`; add a `note` to show a second item after it. */
  status: {
    currently: 'Building Check-in for web',
    note: '',
  } as { currently: string; note: string },
  timeZone: 'America/Chicago',
  /** Nashville, for the coordinate detail in the hero. */
  coords: 'N 36.1627° W 86.7816°',
  email: 'benwoods.design@gmail.com',
  /** Ben's resume in /public (the filename has spaces, so it's URL-encoded here). */
  resume: '/Benjamin%20Woods%20-%20Resume.pdf',
} as const

export const nav = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/lab', label: 'Lab' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About' },
] as const

export type SocialLink = { label: string; href: string; handle: string }

/** Leave an href empty to hide a link (LinkedIn until the URL is added). */
const allLinks: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/merc99', handle: 'merc99' },
  { label: 'LinkedIn', href: '', handle: 'Ben Woods' },
  { label: 'Email', href: `mailto:${site.email}`, handle: site.email },
  { label: 'X', href: 'https://x.com/benwoods__', handle: '@benwoods__' },
  { label: 'Instagram', href: 'https://www.instagram.com/benrz', handle: '@benrz' },
]

export const links = allLinks.filter((l) => l.href)

export const ticker = ['Product design', 'Front end', 'Brand & print', 'Illustration', 'Packaging', 'Nashville, TN']

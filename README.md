# benwoods.art

The portfolio of Ben Woods, a designer in Nashville working across product design, front end, brand and print.
It has a work index with case studies, a Lab of live interaction demos, a Resources page, and an About page.

Live at **https://benwoods.art**.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) with React 19 and TypeScript
- Tailwind CSS v4 (tokens in `app/globals.css`)
- MDX case studies (`gray-matter` + `next-mdx-remote`)
- `motion` for page and UI transitions, `next-themes` for light/dark
- `next/og` share images, rendered at build time
- Hosted on Vercel

## Run locally

Needs Node 20 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

Before pushing:

```bash
npm run typecheck
npm run lint
npm run build      # the same build Vercel runs
```

## Add a project

A project is one MDX file plus its images.

1. Put the images in `public/work/<slug>/` as `.webp` (max 2400px wide). A cover is required; gallery images and short
   `.mp4`/`.webm` clips are optional.
2. Create `content/work/<slug>.mdx`. Copy an existing file such as `content/work/dreamline.mdx` and edit the
   frontmatter:

   ```yaml
   ---
   title: Project name
   slug: project-name          # must match the file name and the image folder
   category: brand             # product | brand | illustration | swag | personal
   tags: [Identity, Print]
   year: 2026
   role: Designer
   stack: []
   status: Shipped
   liveUrl: ""                 # optional "View live site" link
   repoUrl: ""
   cover: /work/project-name/cover.webp
   coverAlt: What the cover shows, in a sentence.
   summary: One line for tiles and search results.
   order: 10                   # position in the work index
   featured: false
   gallery:
     - src: /work/project-name/01.webp
       alt: What the image shows.
       caption: Optional caption.
       span: full              # full | half | third | quarter
   ---

   The case study text, in Markdown.
   ```

3. Run `npm run dev` and check `/work/<slug>`. The page, its share image and its sitemap entry are generated
   automatically. Add `draft: true` to hide a project while you work on it.

YAML tip: wrap alt text or captions in quotes if they start with a quote mark or contain `: `.

Merch shirts are listed in `lib/merch.ts` (images in `public/merch/`). Playlist covers are listed in
`content/playlists.json` (images in `public/work/playlist-covers/`).

The scripts in `scripts/` prepare images from local source folders (`assets/`, which isn't committed). You only need
them when re-processing originals.

## How deploys work

The repo is connected to Vercel:

- Every push to `main` builds and deploys to production at https://benwoods.art.
- Every other branch, and every pull request, gets its own preview URL.
- A failed build never replaces the live site; the previous deployment stays up.

Old Framer URLs keep working: every `/work/<slug>` still exists, and `/contact`, `/merc`, `/motion`, `/web-design`
and `/more-art` redirect to their new pages (see `next.config.ts`).

## Licenses

Code is © Ben Woods. Fonts: Munro (SIL OFL 1.1, see `app/fonts/README.md`); Space Grotesk, Inter and Roboto Mono via
Google Fonts / Fontsource (OFL, OFL, Apache 2.0). Some Lab demos adapt open components; their source and license
notes are kept in the file headers.

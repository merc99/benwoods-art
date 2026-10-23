export type ResourceLink = { name: string; href: string; note: string }

export const tools: ResourceLink[] = [
  { name: 'Figma', href: 'https://www.figma.com', note: 'Where most interfaces start: layout, components and prototypes.' },
  { name: 'Claude and Claude Code', href: 'https://claude.ai', note: 'My pair programmer on every build on this site.' },
  { name: 'Illustrator', href: 'https://www.adobe.com/products/illustrator.html', note: 'Logos, marks and vector illustration.' },
  { name: 'InDesign', href: 'https://www.adobe.com/products/indesign.html', note: 'Print layout, packaging and editorial work.' },
  { name: 'Higgsfield', href: 'https://higgsfield.ai', note: 'AI video and image generation for motion pieces.' },
  { name: 'Midjourney', href: 'https://www.midjourney.com', note: 'Image exploration and mood before anything is drawn.' },
  { name: 'Runway', href: 'https://runwayml.com', note: 'Video generation and editing.' },
  { name: 'Supabase', href: 'https://supabase.com', note: 'Postgres, auth and realtime; Check-in’s backend in progress.' },
  { name: 'Vercel', href: 'https://vercel.com', note: 'Hosting and a preview deploy for every branch.' },
]

/** From the ui-references skill catalog (October 2026), grouped as it is there. */
export const references: { group: string; items: ResourceLink[] }[] = [
  {
    group: 'Component libraries',
    items: [
      { name: 'Arc UI', href: 'https://uiarc.dev/', note: 'Animated React components and blocks for shadcn, with an MCP server.' },
      { name: 'ReUI', href: 'https://reui.io/components', note: 'A very large free shadcn set, plus data grid, kanban and calendar.' },
      { name: 'Tailgrids', href: 'https://tailgrids.com/', note: 'Open-source React and Tailwind components and templates.' },
      { name: 'BoardUI', href: 'https://www.boardui.com/', note: 'A design system for dashboards and agent interfaces.' },
      { name: 'HeroUI', href: 'https://heroui.com/', note: 'Accessible React components on React Aria, with a React Native version.' },
      { name: 'Launch UI', href: 'https://www.launchuicomponents.com/', note: 'Landing-page blocks on shadcn and Tailwind v4.' },
    ],
  },
  {
    group: 'Motion and micro-interactions',
    items: [
      { name: 'Transitions.dev', href: 'https://transitions.dev/', note: 'UI transitions, a builder and an agent skill.' },
      { name: 'Bencho', href: 'https://bencho.dev/', note: 'Live interactive React blocks; the carousel and reactions here started there.' },
      { name: 'Feral UI', href: 'https://feralui.dev/', note: 'Small, playful, physics-driven React elements.' },
      { name: 'Reverse UI', href: 'https://reverseui.com/', note: 'Premium animated components: docks, radial menus, shaders.' },
      { name: 'Cue', href: 'https://www.cuedesign.space/', note: 'Curated hero flows and interactions, each with a build prompt.' },
      { name: 'Aura', href: 'https://www.aura.build/components?componentType=free', note: 'A landing-page builder with a component library.' },
      { name: 'Opensource UI', href: 'https://opensourceui.in/components', note: 'Free copy-paste React and Tailwind components with live previews.' },
    ],
  },
  {
    group: 'Specialized registries',
    items: [
      { name: 'Gauge UI', href: 'https://www.gauge-ui.dev/', note: 'Composable SVG gauge primitives as a shadcn registry.' },
      { name: 'audiocn', href: 'https://www.audiocn.dev/', note: 'Audio UI for React: faders, knobs, waveforms, meters.' },
      { name: 'mdxcn', href: 'https://www.mdxcn.dev/', note: 'MDX-friendly components: callouts, steps, timelines.' },
      { name: 'Pele', href: 'https://pele.run/', note: 'Mermaid diagrams to light SVG themed with CSS variables.' },
    ],
  },
  {
    group: 'Templates',
    items: [{ name: 'Oversight Supply', href: 'https://supply.madebyoversight.com/', note: 'Webflow and Framer templates, free sections and explainer-video skills.' }],
  },
  {
    group: 'Research and craft',
    items: [
      { name: 'The Component Gallery', href: 'https://component.gallery/components', note: 'How 100+ design systems build each common component.' },
      { name: 'The Iconography Encyclopedia', href: 'https://encyclopedia.iconography.co/#view=directory', note: 'A field guide to icon design vocabulary and craft.' },
    ],
  },
  {
    group: 'Design tools',
    items: [
      { name: 'squig', href: 'https://squig.sh/', note: 'An infinite canvas of real components drawn as sketches, for wireframes.' },
      { name: 'Squints', href: 'https://squints.app/', note: 'A Chrome extension to measure, inspect and slow down any live page.' },
    ],
  },
]

export const code: ResourceLink[] = [
  { name: 'github.com/merc99', href: 'https://github.com/merc99', note: 'Everything public.' },
  { name: 'check-in-web', href: 'https://github.com/merc99/check-in-web', note: 'Check-in’s web app: Next.js 16, React 19, Tailwind v4.' },
]

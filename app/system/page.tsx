import type { Metadata } from 'next'
import Link from 'next/link'
import { PageIntro } from '@/components/ui/PageIntro'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { MotionList, Swatches, TypeScale } from '@/components/system/Tokens'
import {
  ButtonSpecimen,
  DialogSpecimen,
  FieldSpecimen,
  FrameSpecimen,
  PaletteSpecimen,
  PillsSpecimen,
  ThemeSpecimen,
  ToastSpecimen,
} from '@/components/system/Specimens'
import { changelog, colorTokens, durationTokens, easeTokens, layoutTokens, radiusTokens, shadowTokens, typeStyles } from '@/lib/system'

export const metadata: Metadata = {
  title: 'System',
  description: 'The design system benwoods.art runs on: tokens, components, patterns and principles.',
  alternates: { canonical: '/system' },
  openGraph: { type: 'website', siteName: 'Ben Woods', url: '/system', title: 'System — Ben Woods', description: 'The design system benwoods.art runs on: tokens, components, patterns and principles.' },
}

type Prop = [name: string, type: string, note: string]
type Spec = { id: string; name: string; keys: string; props: Prop[]; good: string; bad: string; demo: React.ReactNode; file: string }

const components: Spec[] = [
  {
    id: 'button',
    name: 'Button',
    file: 'components/ui/Button.tsx',
    keys: 'Tab to reach it, Enter or Space to press. Disabled and loading buttons ignore presses.',
    props: [
      ['variant', "'solid' | 'outline' | 'signal'", 'solid for the main action, outline for the rest, signal only for Contact'],
      ['size', "'md' | 'sm'", 'md is 44px tall; sm is 36px with a 44px tap area'],
      ['href', 'string', 'renders a link; external links open in a new tab'],
      ['loading', 'boolean', 'keeps the width and marks it busy'],
      ['disabled', 'boolean', ''],
    ],
    good: 'One solid button per view, for the thing most people came to do.',
    bad: 'Don’t put two solid buttons side by side. Neither reads as the main action.',
    demo: <ButtonSpecimen />,
  },
  {
    id: 'filter-pills',
    name: 'Filter pills',
    file: 'components/ui/FilterPills.tsx',
    keys: 'Tab moves between pills, Enter or Space chooses one. Screen readers hear which is pressed.',
    props: [
      ['label', 'string', 'names the group for screen readers'],
      ['options', '{ value, label, count?, disabled? }[]', ''],
      ['value', 'string', 'the chosen option'],
      ['onChange', '(value) => void', ''],
    ],
    good: 'Show a count on each pill, so nobody picks a filter that comes back empty.',
    bad: 'Don’t use pills for more than about six choices. Past that, use a list.',
    demo: <PillsSpecimen />,
  },
  {
    id: 'text-field',
    name: 'Text field',
    file: 'components/ui/TextField.tsx',
    keys: 'Tab to focus. The label, hint and error are read with the field.',
    props: [
      ['label', 'string', 'always rendered; hideLabel hides it visually only'],
      ['hint', 'string', 'shown under the field'],
      ['error', 'string', 'replaces the hint and marks the field invalid'],
      ['variant', "'boxed' | 'bare'", 'bare sits inside a panel, like the command palette'],
      ['icon, trailing', 'ReactNode', 'a leading icon and a trailing key hint'],
    ],
    good: 'Check a field when the reader leaves it, and clear the error as soon as they edit.',
    bad: 'Don’t use the placeholder as the label. It disappears the moment someone types.',
    demo: <FieldSpecimen />,
  },
  {
    id: 'toast',
    name: 'Toast',
    file: 'components/ui/Toast.tsx',
    keys: 'Nothing to press. It’s announced through a polite live region and leaves after about 2.5 seconds.',
    props: [
      ['children', 'ReactNode', 'what just happened, in a few words'],
      ['done', 'boolean', 'shows the check mark (on by default)'],
    ],
    good: 'Confirm something the reader just did: “benwoods.design@gmail.com copied”.',
    bad: 'Don’t put an error or a choice in a toast. It’s gone before anyone can act on it.',
    demo: <ToastSpecimen />,
  },
  {
    id: 'dialog',
    name: 'Dialog',
    file: 'components/ui/Lightbox.tsx',
    keys: 'Arrow keys move between photos, Escape closes, Tab stays inside, and focus returns to the opener.',
    props: [
      ['items', '{ src, alt, caption }[]', ''],
      ['open', 'number | null', 'the photo shown, or null when closed'],
      ['onChange', '(i) => void', ''],
      ['opener', '() => HTMLElement', 'where focus goes back to'],
    ],
    good: 'Open a dialog for something that needs the whole screen, like a photo at full size.',
    bad: 'Don’t open a dialog for a quick edit. Change it in place instead.',
    demo: <DialogSpecimen />,
  },
  {
    id: 'command-palette',
    name: 'Command palette',
    file: 'components/layout/CommandPalette.tsx',
    keys: '⌘K or Ctrl K opens it, typing filters, arrows move, Enter runs, Escape closes.',
    props: [['projects', '{ title, slug, category }[]', 'the work it can jump to; pages, links and settings come from lib/site']],
    good: 'Give every command a plain verb: “Go to Work”, “Copy email”.',
    bad: 'Don’t make the palette the only way to reach something. It’s a shortcut, not the map.',
    demo: <PaletteSpecimen />,
  },
  {
    id: 'theme-toggle',
    name: 'Theme toggle',
    file: 'components/layout/ThemeToggle.tsx',
    keys: 'Tab to reach it, Enter or Space to switch. The choice is remembered.',
    props: [['className', 'string', 'placement only; it brings its own 44px target']],
    good: 'Keep it in the header, so it’s in the same place on every page.',
    bad: 'Don’t follow the device setting silently. The site opens dark, and the toggle is how you change it.',
    demo: <ThemeSpecimen />,
  },
  {
    id: 'media-frame',
    name: 'Media frame',
    file: 'components/ui/DeviceFrame.tsx',
    keys: 'The frame itself takes no focus. The link around it does, and lifts the frame the same way hover does.',
    props: [
      ['src, alt', 'string', 'alt is empty when the link around it already names it'],
      ['size', "'wide' | 'half'", 'sets the corner radius and padding'],
      ['sizes', 'string', 'image sizes for the layout it sits in'],
      ['aspect', 'string', 'defaults to 16:10'],
    ],
    good: 'Frame product screens, so they read as software rather than pictures.',
    bad: 'Don’t frame illustration or print. It turns art into a screenshot.',
    demo: <FrameSpecimen />,
  },
]

const patterns = [
  {
    name: 'Evidence linking',
    note: 'Every claim points at the line that supports it, and the line points back. Pick either side to find the other.',
    href: '/work/chrometooth',
    where: 'Chrometooth',
  },
  {
    name: 'Review before action',
    note: 'A fix that changes something stays locked until each reason behind it has been checked.',
    href: '/work/chrometooth',
    where: 'Chrometooth',
  },
  {
    name: 'Empty states',
    note: 'Say what happened and offer the next step: “Nothing matches. Try ‘work’ or ‘email’.”',
    href: '/work/checkin',
    where: 'Check-in, Chrometooth and the command palette',
  },
  {
    name: 'Error copy',
    note: 'Name what’s missing and how to fix it, never blame the reader, and keep the submit button clickable.',
    href: '/work/checkin',
    where: 'Check-in',
  },
]

const principles = [
  {
    name: 'Accessibility',
    lines: [
      'Text clears WCAG AA in both themes. The swatches above check it live.',
      'Everything works from the keyboard, with a visible focus ring.',
      'Tap targets are at least 44px, and no text is smaller than 12px.',
    ],
  },
  {
    name: 'Motion',
    lines: [
      'Shared UI only uses the durations and curves above. One-off effects, like the hero rise, keep their own timing.',
      'Only transform and opacity animate on things that move often.',
      'Reduced motion turns movement off and keeps fades short.',
    ],
  },
  {
    name: 'Writing',
    lines: ['Sentence case, plain words, no filler.', 'Buttons start with a verb.', 'Errors say how to fix the problem, not what the reader did wrong.'],
  },
]

const toc = [
  { id: 'tokens', label: 'Tokens', subs: ['color', 'type', 'spacing', 'radii', 'shadows', 'motion'] },
  { id: 'components', label: 'Components', subs: components.map((c) => c.id) },
  { id: 'patterns', label: 'Patterns' },
  { id: 'principles', label: 'Principles' },
  { id: 'changelog', label: 'Changelog' },
]
const subLabel = (s: string) => components.find((c) => c.id === s)?.name ?? s[0].toUpperCase() + s.slice(1)

function Toc() {
  return (
    <ol className="t-label grid gap-1 text-fg-3">
      {toc.map((t, i) => (
        <li key={t.id}>
          <a href={`#${t.id}`} className="inline-flex min-h-8 items-center gap-2 text-fg-2 hover:text-fg">
            <span className="text-fg-3">({String(i + 1).padStart(2, '0')})</span> {t.label}
          </a>
          {t.subs && (
            <ol className="mb-2 ml-8 grid">
              {t.subs.map((s) => (
                <li key={s}>
                  <a href={`#${s}`} className="inline-flex min-h-7 items-center normal-case hover:text-fg">
                    {subLabel(s)}
                  </a>
                </li>
              ))}
            </ol>
          )}
        </li>
      ))}
    </ol>
  )
}

function Sub({ id, title, note, children }: { id: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-[calc(var(--header-h)+24px)] pt-12 first:pt-8">
      <h3 id={`${id}-h`} className="t-title text-[1.5rem]">
        {title}
      </h3>
      {note && <p className="mt-2 max-w-[60ch] text-fg-2">{note}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

export default function SystemPage() {
  const colors = colorTokens()
  const layout = layoutTokens()
  const space = [1, 2, 3, 4, 6, 8, 10, 14, 20]
  return (
    <>
      <PageIntro
        label="(Index) System"
        title="System"
        lede="The tokens, components and patterns this site runs on."
        seed={61}
        bordered={false}
        revealLede={false}
        padding="pt-10 pb-12 lg:pt-16 lg:pb-16"
        titleSize="text-[clamp(3.5rem,0.5rem+12vw,12rem)]"
        ledeClass="mt-6 max-w-[34ch]"
      >
        <div className="mt-8 flex items-center gap-3">
          <ThemeToggle className="border border-rule" />
          <span className="t-label text-fg-3">Light or dark: switches every swatch and component below</span>
        </div>
      </PageIntro>

      <div className="shell border-t border-rule lg:grid lg:grid-cols-12 lg:gap-x-[var(--gutter)]">
        {/* contents: sticky beside the page on desktop, a fold-down list on phones */}
        <nav aria-label="On this page" className="lg:col-span-3">
          <details className="border-b border-rule py-3 lg:hidden">
            <summary className="t-label flex min-h-11 cursor-pointer items-center text-fg-2">On this page</summary>
            <div className="pt-2 pb-3">
              <Toc />
            </div>
          </details>
          <div className="sticky top-[calc(var(--header-h)+24px)] hidden max-h-[calc(100svh-var(--header-h)-48px)] overflow-y-auto py-12 lg:block">
            <Toc />
          </div>
        </nav>

        <div className="min-w-0 lg:col-span-9">
          <section id="tokens" aria-labelledby="tokens-h" className="scroll-mt-[calc(var(--header-h)+24px)] py-12 lg:py-16">
            <SectionHeader index="01" id="tokens-h" title="Tokens" meta="From app/globals.css" />

            <Sub id="color" title="Color" note="Light and dark values side by side. Each is checked against what it sits on, in your browser.">
              <Swatches tokens={colors} />
            </Sub>

            <Sub id="type" title="Type" note="Five roles. Sizes are measured from the text as it renders at this width.">
              <TypeScale styles={typeStyles()} />
            </Sub>

            <Sub id="spacing" title="Spacing" note="Tailwind’s 4px scale, plus two layout tokens.">
              <ul className="grid gap-3">
                {space.map((n) => (
                  <li key={n} className="grid grid-cols-[4rem_5rem_minmax(0,1fr)] items-center gap-3">
                    <code className="t-label text-fg">{n}</code>
                    <span className="t-label text-fg-3 normal-case">{n * 4}px</span>
                    <span className="block h-3 bg-fg-3" style={{ width: n * 4 }} />
                  </li>
                ))}
              </ul>
              <ul className="mt-8">
                {layout.map((l) => (
                  <li key={l.name} className="grid gap-x-[var(--gutter)] gap-y-1 border-t border-rule py-3 sm:grid-cols-[11rem_minmax(0,1fr)]">
                    <code className="t-label text-fg">--{l.name}</code>
                    <span className="t-label text-fg-3 normal-case">
                      {l.steps.join(' → ')} · {l.note}
                    </span>
                  </li>
                ))}
              </ul>
            </Sub>

            <Sub id="radii" title="Radii" note="Square by default. Pills for chips and the signal button.">
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {radiusTokens().map((r) => (
                  <li key={r.name}>
                    <span className="block h-16 border border-rule-strong bg-sunken" style={{ borderRadius: `var(--${r.name})` }} />
                    <code className="t-label mt-2 block text-fg">--{r.name}</code>
                    <span className="t-label text-fg-3 normal-case">{r.light}</span>
                  </li>
                ))}
              </ul>
            </Sub>

            <Sub id="shadows" title="Shadows" note="Soft and warm on cream, deep on dark.">
              <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-3">
                {shadowTokens().map((s) => (
                  <li key={s.name}>
                    <span className="block h-24 bg-surface" style={{ boxShadow: `var(--${s.name})` }} />
                    <code className="t-label mt-4 block text-fg">--{s.name}</code>
                  </li>
                ))}
              </ul>
            </Sub>

            <Sub id="motion" title="Motion" note="Press play to see each one.">
              <MotionList durations={durationTokens()} easings={easeTokens()} />
            </Sub>
          </section>

          <section id="components" aria-labelledby="components-h" className="scroll-mt-[calc(var(--header-h)+24px)] border-t border-rule py-12 lg:py-16">
            <SectionHeader index="02" id="components-h" title="Components" meta={`${components.length} components`} />
            {components.map((c) => (
              <Sub key={c.id} id={c.id} title={c.name}>
                <div className="border border-rule p-4 sm:p-6">{c.demo}</div>
                <p className="mt-4 text-fg-2">
                  <span className="t-label mr-2 text-fg-3">Keyboard</span>
                  {c.keys}
                </p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[32rem] text-left text-[0.875rem]">
                    <thead className="t-label text-fg-3">
                      <tr className="border-b border-rule">
                        <th className="py-2 pr-4 font-medium">Prop</th>
                        <th className="py-2 pr-4 font-medium">Type</th>
                        <th className="py-2 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.props.map(([n, t, note]) => (
                        <tr key={n} className="border-b border-rule align-top">
                          <td className="py-2 pr-4">
                            <code className="text-fg">{n}</code>
                          </td>
                          <td className="py-2 pr-4">
                            <code className="text-fg-2">{t}</code>
                          </td>
                          <td className="py-2 text-fg-2">{note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <p className="border-t-2 border-fg pt-3 text-fg-2">
                    <span className="t-label mr-2 text-fg">Do</span>
                    {c.good}
                  </p>
                  <p className="border-t-2 border-signal pt-3 text-fg-2">
                    <span className="t-label mr-2 text-signal">Don’t</span>
                    {c.bad}
                  </p>
                </div>
                <p className="t-label mt-4 text-fg-3 normal-case">{c.file}</p>
              </Sub>
            ))}
          </section>

          <section id="patterns" aria-labelledby="patterns-h" className="scroll-mt-[calc(var(--header-h)+24px)] border-t border-rule py-12 lg:py-16">
            <SectionHeader index="03" id="patterns-h" title="Patterns" meta="Reused across projects" />
            <ul className="mt-6">
              {patterns.map((p) => (
                <li key={p.name} className="grid gap-x-[var(--gutter)] gap-y-2 border-b border-rule py-5 sm:grid-cols-[13rem_minmax(0,1fr)]">
                  <h3 className="t-title text-[1.25rem]">{p.name}</h3>
                  <div>
                    <p className="text-fg-2">{p.note}</p>
                    <Link href={p.href} className="t-label mt-2 inline-flex min-h-11 items-center gap-1.5 text-fg-2 hover:text-fg">
                      Seen in {p.where} <span aria-hidden>→</span>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section id="principles" aria-labelledby="principles-h" className="scroll-mt-[calc(var(--header-h)+24px)] border-t border-rule py-12 lg:py-16">
            <SectionHeader index="04" id="principles-h" title="Principles" />
            <div className="mt-6 grid gap-x-[var(--gutter)] gap-y-8 md:grid-cols-3">
              {principles.map((p) => (
                <div key={p.name}>
                  <h3 className="t-title text-[1.25rem]">{p.name}</h3>
                  <ul className="mt-3 grid gap-2 text-fg-2">
                    {p.lines.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section id="changelog" aria-labelledby="changelog-h" className="scroll-mt-[calc(var(--header-h)+24px)] border-t border-rule py-12 lg:py-16">
            <SectionHeader index="05" id="changelog-h" title="Changelog" />
            <ol className="mt-6">
              {changelog.map((c) => (
                <li key={c.date} className="grid gap-x-[var(--gutter)] gap-y-2 border-b border-rule py-5 sm:grid-cols-[13rem_minmax(0,1fr)]">
                  <time dateTime={c.date} className="t-label text-fg-3">
                    {c.date}
                  </time>
                  <ul className="grid gap-2 text-fg-2">
                    {c.items.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </>
  )
}

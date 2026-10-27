'use client'
// Live specimens for the System page: the site's real components, each shown in every state at once. Forced
// states (hover, focus, pressed) use each component's `state` prop, so they match the real interaction exactly.

import { useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Button, type ButtonVariant } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { FilterPills } from '@/components/ui/FilterPills'
import { Toast, ToastRegion } from '@/components/ui/Toast'
import { Lightbox } from '@/components/ui/Lightbox'
import { DeviceFrame } from '@/components/ui/DeviceFrame'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { openPalette } from '@/components/layout/CommandPalette'

function State({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-2">
      {children}
      <span className="t-label text-fg-3">{name}</span>
    </div>
  )
}
const grid = 'grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3'

export function ButtonSpecimen() {
  const variants: { v: ButtonVariant; label: string }[] = [
    { v: 'solid', label: 'Download resume' },
    { v: 'outline', label: 'View on GitHub' },
    { v: 'signal', label: 'Contact' },
  ]
  return (
    <div className="grid gap-8">
      {variants.map(({ v, label }) => (
        <div key={v}>
          <p className="t-label mb-3 text-fg-2">{v}</p>
          <div className={grid}>
            <State name="default">
              <Button variant={v} size={v === 'signal' ? 'sm' : 'md'}>{label}</Button>
            </State>
            <State name="hover">
              <Button variant={v} size={v === 'signal' ? 'sm' : 'md'} state="hover" tabIndex={-1}>{label}</Button>
            </State>
            <State name="focus">
              <Button variant={v} size={v === 'signal' ? 'sm' : 'md'} state="focus" tabIndex={-1}>{label}</Button>
            </State>
            <State name="pressed">
              <Button variant={v} size={v === 'signal' ? 'sm' : 'md'} state="active" tabIndex={-1}>{label}</Button>
            </State>
            <State name="disabled">
              <Button variant={v} size={v === 'signal' ? 'sm' : 'md'} disabled>{label}</Button>
            </State>
            <State name="loading">
              <Button variant={v} size={v === 'signal' ? 'sm' : 'md'} loading>{label}</Button>
            </State>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PillsSpecimen() {
  const [value, setValue] = useState('product')
  const options = [
    { value: 'all', label: 'All', count: 18 },
    { value: 'product', label: 'Product', count: 4 },
    { value: 'brand', label: 'Brand', count: 4 },
    { value: 'swag', label: 'Swag', count: 4 },
  ]
  const still = (look?: 'hover' | 'focus', disabled = false) => (
    <div className="max-w-full overflow-x-auto [scrollbar-width:none]">
      <FilterPills
        label={`Example filter, ${look ?? (disabled ? 'disabled' : 'default')}`}
        options={options.map((o) => ({ ...o, disabled: disabled && o.value === 'swag' }))}
        value="product"
        onChange={() => {}}
        state={look ? { value: 'brand', look } : undefined}
      />
    </div>
  )
  return (
    <div className="grid gap-6">
      <State name="live: choose one">
        <div className="max-w-full overflow-x-auto [scrollbar-width:none]">
          <FilterPills label="Example filter" options={options} value={value} onChange={setValue} />
        </div>
      </State>
      <div className="grid gap-6 lg:grid-cols-3">
        <State name="hover on Brand">{still('hover')}</State>
        <State name="focus on Brand">{still('focus')}</State>
        <State name="one option disabled">{still(undefined, true)}</State>
      </div>
    </div>
  )
}

export function FieldSpecimen() {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const bad = touched && email.length > 0 && !/^\S+@\S+\.\S+$/.test(email)
  return (
    <div className="grid gap-6">
      <div className="max-w-[26rem]">
        <TextField
          label="Your email"
          type="email"
          value={email}
          placeholder="you@studio.com"
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          onFocus={() => setTouched(false)}
          hint="Checked when you leave the field."
          error={bad ? 'That doesn’t look like an email. Check for a missing @ or dot.' : undefined}
        />
      </div>
      <div className="grid gap-x-[var(--gutter)] gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        <TextField label="Default" placeholder="Search work" icon={<Search className="size-4" strokeWidth={1.5} aria-hidden />} />
        <TextField label="Hover" placeholder="Search work" state="hover" tabIndex={-1} />
        <TextField label="Focus" defaultValue="Check-in" state="focus" tabIndex={-1} />
        <TextField label="Disabled" placeholder="Not available" disabled />
        <TextField label="Error" defaultValue="ben@" error="Add the rest of the address, like ben@studio.com." />
        <TextField label="With a hint" placeholder="Nashville" hint="City and state is enough." />
      </div>
    </div>
  )
}

export function ToastSpecimen() {
  const [note, setNote] = useState<number | null>(null)
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
      <State name="resting">
        <Toast className="animate-none">benwoods.design@gmail.com copied</Toast>
      </State>
      <State name="live">
        <Button
          variant="outline"
          onClick={() => {
            const k = Date.now()
            setNote(k)
            setTimeout(() => setNote((n) => (n === k ? null : n)), 2600)
          }}
        >
          Show a toast
        </Button>
      </State>
      <ToastRegion>{note && <Toast key={note}>Example toast</Toast>}</ToastRegion>
    </div>
  )
}

export function DialogSpecimen() {
  const [open, setOpen] = useState<number | null>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const items = [
    { src: '/work/checkin/explore-v2.webp', alt: 'Check-in’s Explore page with a ring of crew cards.', caption: 'Check-in: Explore' },
    { src: '/work/chrometooth/site-evidence.webp', alt: 'Chrometooth’s evidence drawer beside the log it cites.', caption: 'Chrometooth: the review gate' },
  ]
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button ref={opener} variant="outline" onClick={() => setOpen(0)}>
        Open the dialog
      </Button>
      <span className="t-label text-fg-3">The photo viewer: two images, arrows between them</span>
      <Lightbox items={items} open={open} onChange={setOpen} opener={() => opener.current} />
    </div>
  )
}

export function PaletteSpecimen() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="outline" onClick={() => openPalette()}>
        Open the command palette
      </Button>
      <span className="t-label text-fg-3">
        Or press <kbd className="border border-rule px-1.5 py-0.5">⌘K</kbd> / <kbd className="border border-rule px-1.5 py-0.5">Ctrl K</kbd> anywhere
      </span>
    </div>
  )
}

export function ThemeSpecimen() {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <State name="live">
        <ThemeToggle className="border border-rule" />
      </State>
      <p className="max-w-[44ch] text-[0.875rem] text-fg-2">The moon shows in light mode and the sun in dark. Every swatch and component on this page switches with it.</p>
    </div>
  )
}

export function FrameSpecimen() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <State name="resting">
        <div className="w-full">
          <DeviceFrame size="half" src="/work/checkin/feed-dark-v2.webp" alt="" sizes="(min-width: 640px) 40vw, 90vw" />
        </div>
      </State>
      <State name="hover: lifts 4px, deeper shadow">
        <a href="/work/checkin" className="group block w-full" aria-label="Check-in case study">
          <DeviceFrame size="half" src="/work/chrometooth/site-dashboard.webp" alt="" sizes="(min-width: 640px) 40vw, 90vw" />
        </a>
      </State>
    </div>
  )
}

'use client'
// Playlist covers: square art, playlist name and month in mono, a link to Spotify, and a small play
// button that swaps the cover for Spotify's embed player. No iframe loads until someone presses play.

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Play, X } from 'lucide-react'
import type { Playlist } from '@/lib/playlists'

export function PlaylistGrid({ playlists }: { playlists: Playlist[] }) {
  const [playing, setPlaying] = useState<string | null>(null)
  // the player's own load: a label while Spotify answers, and a direct link if it hasn't after 6s
  const [ready, setReady] = useState(false)
  // like the live frames: scrolling over the player scrolls the page until you click into it
  const [inside, setInside] = useState(false)
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    if (!playing) return
    const t = window.setTimeout(() => setSlow(true), 6000)
    return () => clearTimeout(t)
  }, [playing])
  return (
    <ul className="grid grid-cols-1 gap-x-[calc(var(--gutter)*1.25)] gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
      {playlists.map((p) => {
        const on = playing === p.id
        return (
          <li key={p.id}>
            {/* while playing, the tile takes the Spotify player's standard 352px height */}
            <div onPointerLeave={() => setInside(false)} className={`relative overflow-hidden ${on ? 'h-[352px] rounded-[12px] bg-[#121212]' : 'aspect-square bg-sunken'}`}>
              {on && !ready && (
                <div className="absolute inset-0 grid place-items-center text-center">
                  {slow ? (
                    <a href={p.url} target="_blank" rel="noreferrer" className="t-label inline-flex h-11 items-center gap-1.5 text-[#f4ecdc] underline underline-offset-4">
                      Open in Spotify <span aria-hidden>↗</span>
                    </a>
                  ) : (
                    <p className="t-label text-[#b8b09f]" aria-live="polite">
                      Loading player…
                    </p>
                  )}
                </div>
              )}
              {on && ready && !inside && (
                <button type="button" aria-label={`Use the ${p.title} player`} onClick={() => setInside(true)} className="absolute inset-0 z-[5] cursor-pointer bg-transparent" />
              )}
              {on ? (
                <iframe
                  onLoad={() => setReady(true)}
                  title={`Spotify player: ${p.title}`}
                  src={`https://open.spotify.com/embed/playlist/${p.id}?utm_source=generator&theme=0`}
                  className={`absolute inset-0 h-[352px] w-full border-0 transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              ) : (
                <a href={p.url} target="_blank" rel="noreferrer" className="group block size-full" aria-label={`${p.title}, ${p.month}. Listen on Spotify (opens in a new tab)`}>
                  <Image
                    src={p.cover}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    quality={88}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </a>
              )}
              <span aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-rule ring-inset" />
              <button
                type="button"
                onClick={() => {
                  setReady(false)
                  setInside(false)
                  setSlow(false)
                  setPlaying(on ? null : p.id)
                }}
                aria-label={on ? `Close the ${p.title} player` : `Play ${p.title} here`}
                aria-pressed={on}
                className="absolute right-3 bottom-3 z-10 grid size-11 place-items-center rounded-full bg-[#0f0f0e] text-[#f4ecdc] shadow-[var(--shadow-float)] transition-transform duration-150 hover:scale-105 active:scale-95"
              >
                {on ? <X className="size-4" strokeWidth={2} aria-hidden /> : <Play className="ml-0.5 size-4 fill-current" strokeWidth={2} aria-hidden />}
              </button>
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-3">
              <p className="t-title text-[1.5rem]">{p.title}</p>
              <p className="t-label text-fg-2">{p.month}</p>
            </div>
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="hit-44 t-label mt-1 inline-flex h-9 items-center gap-1.5 text-fg-2 underline decoration-rule-strong underline-offset-4 hover:text-fg hover:decoration-fg"
            >
              Listen on Spotify <span aria-hidden>↗</span>
            </a>
            {p.match === 'tentative' && <p className="t-label mt-1 text-signal">Artwork match to confirm</p>}
          </li>
        )
      })}
    </ul>
  )
}

// Monthly playlist covers. Edit content/playlists.json to add one (newest first), add the artwork to
// assets/PLAYLIST ART, then run `node scripts/prepare-art.mjs`.
import data from '@/content/playlists.json'

export type Playlist = { title: string; month: string; id: string; url: string; cover: string; match: 'confirmed' | 'tentative' }

export const playlists: Playlist[] = (data as Omit<Playlist, 'url' | 'cover'>[]).map((p) => ({
  ...p,
  url: `https://open.spotify.com/playlist/${p.id}`,
  cover: `/work/playlist-covers/${p.title}.webp`,
}))

export const latestPlaylist = playlists[0]

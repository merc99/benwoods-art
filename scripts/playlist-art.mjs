// Reads content/playlists.json (the one place playlists are listed; newest first). Titles come from
// Spotify oEmbed; each playlist is matched by eye to its artwork in assets/PLAYLIST ART.
// july26 (5E7yuCMolw8cNWi7H4tZ3r) is left out until there's an artwork file for it.
import { readFileSync } from 'node:fs'

export const playlistArt = JSON.parse(readFileSync('content/playlists.json', 'utf8')).map((p) => ({
  ...p,
  slug: p.title,
  url: `https://open.spotify.com/playlist/${p.id}`,
}))

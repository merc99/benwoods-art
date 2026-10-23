# Fonts

- **Munro.woff2**: Munro by Ten by Twenty (Ed Merritt), the pixel face of the "ben woods" wordmark. The same file the
  Framer site served. Font Squirrel lists Munro under the SIL Open Font License 1.1, which allows web embedding and
  redistribution; the file's own name table only says "© Ten by Twenty 2007". Full ASCII.
  Source: https://www.fontsquirrel.com/fonts/munro
- **Munro.ttf**: the same font decompressed to TrueType, used only by the share-image renderer (`lib/og.tsx`),
  which can't read woff2. Same license.
- Space Grotesk, Inter and Roboto Mono load from Google Fonts through `next/font` (OFL / OFL / Apache 2.0), self-hosted
  at build time.

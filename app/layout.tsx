import type { Metadata, Viewport } from 'next'
import { Inter, Roboto_Mono, Space_Grotesk } from 'next/font/google'
import localFont from 'next/font/local'
import { ThemeProvider } from 'next-themes'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ImageFade } from '@/components/fx/ImageFade'
import { MailCopy } from '@/components/fx/MailCopy'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { getProjects } from '@/lib/work'
import { site } from '@/lib/site'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-space-grotesk', display: 'swap' })
const mono = Roboto_Mono({ subsets: ['latin'], weight: ['500'], variable: '--font-roboto-mono', display: 'swap' })
// Munro by Ten by Twenty (Font Squirrel lists it under the SIL Open Font License 1.1). See app/fonts/README.md.
const munro = localFont({ src: './fonts/Munro.woff2', variable: '--font-munro', display: 'swap', weight: '400' })

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: 'Ben Woods — Designer and builder', template: '%s — Ben Woods' },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: 'Ben Woods', url: '/', description: site.description },
  twitter: { card: 'summary_large_image', creator: '@benwoods__' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdf0d5' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0e' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // smooth in-page jumps; Next turns it off for route changes, so pages still open at the top instantly
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${grotesk.variable} ${mono.variable} ${munro.variable}`}
    >
      <body id="top">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a href="#main" className="skip-link t-label">
            Skip to content
          </a>
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <ImageFade />
          <MailCopy />
          <CommandPalette projects={getProjects().map(({ title, slug, category }) => ({ title, slug, category }))} />
        </ThemeProvider>
      </body>
    </html>
  )
}

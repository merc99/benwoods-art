import Link from 'next/link'
import { PageIntro } from '@/components/ui/PageIntro'

export const metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <PageIntro label="(404) Not found" title="Lost" lede="That page isn’t here. It may have moved when the site was rebuilt.">
      <div className="mt-10 flex flex-wrap gap-2">
        <Link href="/" className="t-label inline-flex h-11 items-center bg-fg px-5 text-bg transition-transform duration-[var(--dur-chrome)] active:scale-[0.97]">
          Go home
        </Link>
        <Link href="/work" className="t-label inline-flex h-11 items-center border border-rule-strong px-5 text-fg transition-colors hover:border-fg">
          See all work
        </Link>
      </div>
    </PageIntro>
  )
}

import { PageIntro } from '@/components/ui/PageIntro'
import { Button } from '@/components/ui/Button'

export const metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <PageIntro label="(404) Not found" title="Lost" lede="That page isn’t here. It may have moved when the site was rebuilt.">
      <div className="mt-10 flex flex-wrap gap-2">
        <Button href="/">Go home</Button>
        <Button variant="outline" href="/work">
          See all work
        </Button>
      </div>
    </PageIntro>
  )
}

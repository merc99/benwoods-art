import Image from 'next/image'
import { cn } from '@/lib/cn'
import { Bezel, bezelRadius } from './Bezel'

/** A product screenshot in the site's card frame (see Bezel). No fade: soft fades into near-black band. */
export function DeviceFrame({
  src,
  alt,
  size = 'wide',
  aspect,
  priority = false,
  sizes,
  className,
}: {
  src: string
  alt: string
  /** 'half' for two-per-row cards: smaller corners. */
  size?: 'wide' | 'half'
  /** Screen aspect. Defaults to 16:10, and 16:9 from md for wide frames. */
  aspect?: string
  priority?: boolean
  sizes: string
  className?: string
}) {
  const screen = aspect ?? (size === 'half' ? 'aspect-[16/10]' : 'aspect-[16/10] md:aspect-[16/9]')
  return (
    <Bezel size={size} className={className}>
      <div className={cn('relative overflow-hidden bg-[#0c0c0b]', screen, bezelRadius[size].inner)}>
        <Image src={src} alt={alt} fill priority={priority} quality={90} sizes={sizes} className="object-cover object-top" />
      </div>
    </Bezel>
  )
}

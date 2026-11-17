import { getImageProps, type ImageProps } from 'next/image'

type StaticImageProps = Pick<ImageProps, 'src' | 'alt' | 'width' | 'height' | 'sizes' | 'className' | 'loading' | 'fetchPriority'>

/** Optimized image markup for server content with no client image behavior. */
export default function StaticImage(props: StaticImageProps) {
  const { props: image } = getImageProps(props)
  // Next still generates the responsive sources; the browser owns lazy loading.
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...image} alt={image.alt} style={{ ...image.style, color: undefined }} />
}

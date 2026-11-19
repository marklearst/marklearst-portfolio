import { imageSize, shareImage } from '@/components/social/share-image'

export const runtime = 'nodejs'
export const size = imageSize
export const contentType = 'image/png'
export const alt = 'The design system behind Mark Learst’s portfolio, powered by Primitree'

export default function Image() {
  return shareImage({ title: 'The system behind this site.', caption: 'Trace a design decision from its base value to the component that uses it.', section: 'Primitree' })
}

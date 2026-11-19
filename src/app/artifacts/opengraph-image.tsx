import { imageSize, shareImage } from '@/components/social/share-image'

export const runtime = 'nodejs'
export const size = imageSize
export const contentType = 'image/png'
export const alt = 'Artifacts by Mark Learst'

export default function Image() {
  return shareImage({ title: 'Artifacts', caption: 'Notes from building accessibility tools, design systems, and motion.' })
}

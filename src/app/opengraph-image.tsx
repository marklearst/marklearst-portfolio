import { imageSize, shareImage } from '@/components/social/share-image'

export const runtime = 'nodejs'
export const size = imageSize
export const contentType = 'image/png'
export const alt = 'Mark Learst, Frontend Engineer. Solid lettering opens into a red typographic blueprint.'

export default function Image() {
  return shareImage({ caption: 'I build React interfaces and design systems.' })
}

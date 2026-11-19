import { imageSize, shareImage } from '@/components/social/share-image'

export const runtime = 'nodejs'
export const size = imageSize
export const contentType = 'image/png'
export const alt = 'Design engineering case studies by Mark Learst'

export default function Image() {
  return shareImage({ title: 'Case studies', caption: 'React interfaces, open source tools, and design systems.' })
}

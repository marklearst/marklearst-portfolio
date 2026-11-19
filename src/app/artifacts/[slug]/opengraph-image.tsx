import { imageSize, shareImage } from '@/components/social/share-image'
import { getArtifactBySlug } from '@/lib/content/artifacts'
import { publicationDate } from '@/lib/social-metadata'

export const runtime = 'nodejs'
export const size = imageSize
export const contentType = 'image/png'
export const alt = 'An article by Mark Learst'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const artifact = await getArtifactBySlug(slug)
  return shareImage({ title: artifact.title, caption: publicationDate.format(artifact.publishedAt), section: 'Artifact' })
}

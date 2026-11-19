import { imageSize, shareImage } from '@/components/social/share-image'
import { getCaseStudyBySlug } from '@/lib/content/case-studies'

export const runtime = 'nodejs'
export const size = imageSize
export const contentType = 'image/png'
export const alt = 'A case study by Mark Learst'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getCaseStudyBySlug(slug)
  const summary = new Intl.Segmenter('en', { granularity: 'sentence' }).segment(project.description)
  return shareImage({ title: project.title, caption: summary.containing(0)?.segment.trim() || project.role, section: 'Case study' })
}

import type { Metadata } from 'next'
import CaseStudyLayout from '@/components/case-study/CaseStudyLayout'
import { caseStudyMdxComponents } from '@/components/mdx/CaseStudyMdxComponents'
import { getCaseStudyBySlug } from '@/lib/content/case-studies'
import { extractCaseStudySections } from '@/components/case-study/case-study-sections'

export async function getCaseStudyMetadata(slug: string): Promise<Metadata> {
  const { title, description } = await getCaseStudyBySlug(slug)
  return { title: `${title} | Mark Learst`, description }
}

export default async function CaseStudyPage({ slug }: { slug: string }) {
  const { Content, links, ...frontmatter } = await getCaseStudyBySlug(slug)
  const content = Content({ components: caseStudyMdxComponents })
  const sections = extractCaseStudySections(content)

  return <CaseStudyLayout {...frontmatter} links={links} sections={sections} />
}

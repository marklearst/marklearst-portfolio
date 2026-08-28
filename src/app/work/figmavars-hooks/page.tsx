import type { Metadata } from 'next'
import CaseStudyLayout from '@/components/CaseStudyLayout'
import {
  createCaseStudyMdxComponents,
} from '@/components/mdx/CaseStudyMdxComponents'
import { extractCaseStudySections } from '@/lib/content/case-study-sections'
import { getCaseStudyBySlug } from '@/lib/content/case-studies'
import { getCategoryColor } from '@/lib/project-categories'

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getCaseStudyBySlug('figmavars-hooks')
  return { title: `${title} | Mark Learst`, description }
}

export default async function FigmaVarsHooksPage() {
  const { Content, links, ...frontmatter } =
    await getCaseStudyBySlug('figmavars-hooks')

  const accent = getCategoryColor(frontmatter.categoryColor)
  const mdxComponents = createCaseStudyMdxComponents(accent)
  const content = Content({ components: mdxComponents })
  const sections = extractCaseStudySections(content)

  return (
    <CaseStudyLayout {...frontmatter} links={links} sections={sections} />
  )
}

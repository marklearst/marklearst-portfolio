import type { Metadata } from 'next'
import CaseStudyLayout from '@/components/CaseStudyLayout'
import { createCaseStudyMdxComponents } from '@/components/mdx/CaseStudyMdxComponents'
import { getCategoryColor } from '@/lib/project-categories'
import { getCaseStudyBySlug } from '@/lib/content/case-studies'
import { extractCaseStudySections } from '@/lib/content/case-study-sections'

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getCaseStudyBySlug('variable-design-standard')
  return { title: `${title} | Mark Learst`, description }
}

export default async function VariableDesignStandardPage() {
  const { Content, links, ...frontmatter } = await getCaseStudyBySlug(
    'variable-design-standard',
  )

  const accent = getCategoryColor(frontmatter.categoryColor)
  const mdxComponents = createCaseStudyMdxComponents(accent)
  const content = Content({ components: mdxComponents })
  const sections = extractCaseStudySections(content)

  return <CaseStudyLayout {...frontmatter} links={links} sections={sections} />
}

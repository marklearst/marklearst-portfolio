import CaseStudyLayout from '@/components/CaseStudyLayout'
import {
  createCaseStudyMdxComponents,
} from '@/components/mdx/CaseStudyMdxComponents'
import { getCategoryColor } from '@/lib/project-categories'
import { getCaseStudyBySlug } from '@/lib/content/case-studies'
import { extractCaseStudySections } from '@/lib/content/case-study-sections'

export default async function VariableContractPage() {
  const { Content, links, ...frontmatter } =
    await getCaseStudyBySlug('variable-contract')

  const accent = getCategoryColor(frontmatter.categoryColor)
  const mdxComponents = createCaseStudyMdxComponents(accent)
  const content = Content({ components: mdxComponents })
  const sections = extractCaseStudySections(content)

  return (
    <CaseStudyLayout {...frontmatter} links={links} sections={sections} />
  )
}

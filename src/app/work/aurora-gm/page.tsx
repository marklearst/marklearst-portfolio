import CaseStudyLayout from '@/components/CaseStudyLayout'
import {
  createCaseStudyMdxComponents,
} from '@/components/mdx/CaseStudyMdxComponents'
import { extractCaseStudySections } from '@/lib/content/case-study-sections'
import { getCaseStudyBySlug } from '@/lib/content/case-studies'
import { getCategoryColor } from '@/lib/project-categories'

export default async function AuroraGMPage() {
  const { Content, links, ...frontmatter } =
    await getCaseStudyBySlug('aurora-gm')

  const accent = getCategoryColor(frontmatter.categoryColor)
  const mdxComponents = createCaseStudyMdxComponents(accent)
  const content = Content({ components: mdxComponents })
  const sections = extractCaseStudySections(content)

  return (
    <CaseStudyLayout {...frontmatter} links={links} sections={sections} />
  )
}

import type { Metadata } from 'next'
import AboutLayout from '@/components/about/AboutLayout'
import AboutNote from '@/components/about/AboutNote'
import ContactCard from '@/components/about/ContactCard'
import ContactLink from '@/components/about/ContactLink'
import DisclosureSummary from '@/components/ui/DisclosureSummary'
import { caseStudyMdxComponents } from '@/components/mdx/CaseStudyMdxComponents'
import AboutContent from '@/content/about.mdx'

export const metadata: Metadata = {
  title: 'About - Mark Learst',
  description:
    'Principal design engineer Mark Learst — design systems, design tokens, React and TypeScript component libraries, frontend architecture, and accessibility.',
}

// Hardcoded frontmatter - keeps MDX file clean (no YAML frontmatter = no HR rendering bug)
const aboutContent = {
  title: 'About',
  summary: 'Coder to the core, think like a designer.',
}

export default function AboutPage() {
  // About-only blocks live here rather than in the shared case-study map:
  // they exist so the MDX never hand-rolls layout that markdown would re-parse.
  const mdxComponents = {
    ...caseStudyMdxComponents,
    AboutNote,
    ContactCard,
    ContactLink,
    DisclosureSummary,
  }

  return (
    <AboutLayout
      title={aboutContent.title}
      summary={aboutContent.summary}
    >
      {AboutContent({ components: mdxComponents })}
    </AboutLayout>
  )
}

import type { Metadata } from 'next'
import AboutLayout from '@/components/AboutLayout'
import {
  createCaseStudyMdxComponents,
} from '@/components/mdx/CaseStudyMdxComponents'
import AboutContent from '@/content/about.mdx'
import { MONOKAI } from '@/lib/monokai-colors'

export const metadata: Metadata = {
  title: 'About - Mark Learst',
  description:
    'Background, skills, and current focus areas for Mark Learst, Lead IC Design Engineer.',
}

const ABOUT_ACCENT = MONOKAI.cyan

// Hardcoded frontmatter - keeps MDX file clean (no YAML frontmatter = no HR rendering bug)
const aboutContent = {
  title: 'About',
  tagline: 'Coder to the core, think like a designer.',
  summary:
    'Lead IC Design Engineer who builds accessible design systems and React component libraries that teams actually want to use. I build the glue between Figma and production—tight APIs, automated pipelines, zero drift.',
}

export default function AboutPage() {
  const mdxComponents = createCaseStudyMdxComponents(ABOUT_ACCENT)

  return (
    <AboutLayout
      title={aboutContent.title}
      summary={aboutContent.summary}
      tagline={aboutContent.tagline}
    >
      {AboutContent({ components: mdxComponents })}
    </AboutLayout>
  )
}

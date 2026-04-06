import type { Metadata } from 'next'
import path from 'node:path'
import fs from 'node:fs/promises'
import matter from 'gray-matter'
import AboutLayout from '@/components/AboutLayout'
import {
  createCaseStudyMdxComponents,
} from '@/components/mdx/CaseStudyMdxComponents'
import AboutContent from '@/content/about.mdx'
import { MONOKAI } from '@/lib/monokai-colors'

type AboutFrontmatter = {
  title: string
  summary: string
}

export const metadata: Metadata = {
  title: 'About - Mark Learst',
  description:
    'Background, skills, and current focus areas for Mark Learst, senior frontend engineer.',
}

const ABOUT_PATH = path.join(process.cwd(), 'src', 'content', 'about.mdx')
const ABOUT_ACCENT = MONOKAI.cyan

const loadAboutFrontmatter = async () => {
  const raw = await fs.readFile(ABOUT_PATH, 'utf8')
  const { data } = matter(raw)
  return data as AboutFrontmatter
}

export default async function AboutPage() {
  const { title, summary } = await loadAboutFrontmatter()
  const mdxComponents = createCaseStudyMdxComponents(ABOUT_ACCENT)

  return (
    <AboutLayout title={title} summary={summary}>
      {AboutContent({ components: mdxComponents })}
    </AboutLayout>
  )
}

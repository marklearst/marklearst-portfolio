import type { Metadata } from 'next'
import path from 'node:path'
import fs from 'node:fs/promises'
import matter from 'gray-matter'
import Footer from '@/components/Footer'
import WorkCatalog from '@/components/WorkCatalog'
import { MONOKAI } from '@/lib/monokai-colors'

export const metadata: Metadata = {
  title: 'Work - Mark Learst',
  description:
    'Full catalog of case studies, open source, and design system work by Mark Learst.',
}

type AboutFrontmatter = {
  summary: string
}

const ABOUT_PATH = path.join(process.cwd(), 'src', 'content', 'about.mdx')

const loadAboutSummary = async () => {
  const raw = await fs.readFile(ABOUT_PATH, 'utf8')
  const { data } = matter(raw)
  return (data as AboutFrontmatter).summary ?? ''
}

export default async function WorkPage() {
  const aboutSummary = await loadAboutSummary()
  return (
    <main
      className='min-h-screen pt-36 pb-32 px-6'
      style={{ backgroundColor: MONOKAI.background }}
    >
      <div className='max-w-7xl mx-auto'>
        <WorkCatalog aboutSummary={aboutSummary} />
      </div>
      <Footer />
    </main>
  )
}

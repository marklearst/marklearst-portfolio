import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import WorkCatalog from '@/components/WorkCatalog'
import { MONOKAI } from '@/lib/monokai-colors'

export const metadata: Metadata = {
  title: 'Work - Mark Learst',
  description:
    'Full catalog of case studies, open source, and design system work by Mark Learst.',
}

export default async function WorkPage() {
  return (
    <main
      className='min-h-screen pt-36'
      style={{ backgroundColor: MONOKAI.background }}
    >
      <div className='px-6 pb-24'>
        <div className='max-w-7xl mx-auto'>
          <WorkCatalog />
        </div>
      </div>
      <Footer />
    </main>
  )
}

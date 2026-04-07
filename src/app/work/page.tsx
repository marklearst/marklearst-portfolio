import type { Metadata } from 'next'
import WorkCatalog from '@/components/WorkCatalog'
import { MONOKAI } from '@/lib/monokai-colors'

export const metadata: Metadata = {
  title: 'Work - Mark Learst',
  description:
    'Full catalog of case studies, open source, and design system work by Mark Learst.',
}

export default function WorkPage() {
  return (
    <main
      className='min-h-screen pt-36 pb-32 px-6'
      style={{ backgroundColor: MONOKAI.background }}
    >
      <div className='max-w-7xl mx-auto'>
        <WorkCatalog />
      </div>
    </main>
  )
}

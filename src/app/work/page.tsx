import type { Metadata } from 'next'
import Footer from '@/components/shell/Footer'
import WorkCatalog from '@/components/work/WorkCatalog'
import styles from '@/components/work/WorkCatalog.module.css'

export const metadata: Metadata = {
  title: 'Work - Mark Learst',
  description: 'Full catalog of case studies, open source, and design system work by Mark Learst.',
}

export default function WorkPage() {
  return <main className={styles.page}><WorkCatalog /><Footer /></main>
}

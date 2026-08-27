import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import WorkCatalog from '@/components/WorkCatalog'
import styles from '@/components/WorkCatalog.module.css'

export const metadata: Metadata = {
  title: 'Work - Mark Learst',
  description: 'Full catalog of case studies, open source, and design system work by Mark Learst.',
}

export default function WorkPage() {
  return <main className={styles.page}><WorkCatalog /><Footer /></main>
}

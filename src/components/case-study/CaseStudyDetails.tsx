import DisclosureSummary from '@/components/ui/DisclosureSummary'
import type { ReactNode } from 'react'
import styles from './CaseStudyDetails.module.css'

export default function CaseStudyDetails({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className={styles.details}>
      <DisclosureSummary>{summary}</DisclosureSummary>
      <div className={styles.content}>{children}</div>
    </details>
  )
}

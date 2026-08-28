import { ChevronDownIcon } from '@/components/ui/Icon'
import type { ReactNode } from 'react'
import styles from './CaseStudyDetails.module.css'

export default function CaseStudyDetails({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className={styles.details}>
      <summary>{summary}<span aria-hidden='true'><ChevronDownIcon /></span></summary>
      <div className={styles.content}>{children}</div>
    </details>
  )
}

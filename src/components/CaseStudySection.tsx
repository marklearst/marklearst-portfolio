'use client'

import { useId, type ReactNode } from 'react'
import styles from './CaseStudyLayout.module.css'

export interface CaseStudySectionProps {
  title: string
  children: ReactNode
  layout?: 'default' | 'two-column' | 'timeline'
}

export function CaseStudySection({
  title,
  children,
  layout = 'default',
}: CaseStudySectionProps) {
  const headingId = useId()
  const isSkillsSection = title.toLowerCase() === 'skills'
  const contentClassName = isSkillsSection
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 [&_ul]:mt-3'
    : layout === 'two-column'
      ? 'grid grid-cols-1 md:grid-cols-2 gap-8 [&_ul]:mt-4'
      : layout === 'timeline'
        ? 'space-y-8 [&_ul]:mt-4'
        : 'space-y-6 [&_ul]:mt-4'

  return (
    <section className={styles.standaloneSection} aria-labelledby={headingId} data-section-title={title}>
      <h2
        id={headingId}
        className={styles.standaloneHeading}
      >
        {title}
      </h2>
      <div
        className={`${styles.standaloneContent} ${contentClassName}`}
      >
        {children}
      </div>
    </section>
  )
}

import type { ReactNode } from 'react'
import Footer from '@/components/shell/Footer'
import styles from './AboutLayout.module.css'

export default function AboutLayout({
  title,
  summary,
  tagline,
  children,
}: {
  title: string
  summary: string
  tagline?: string
  children: ReactNode
}) {
  return (
    <main id='main-content' className={styles.page}>
      <header className={`${styles.container} ${styles.hero}`}>
        {tagline && <p className={styles.tagline}>{tagline}</p>}
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.summary}>{summary}</p>
      </header>
      <div className={`${styles.container} ${styles.content}`}>{children}</div>
      <Footer />
    </main>
  )
}

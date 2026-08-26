'use client'

import styles from './TerminalTransition.module.css'

interface TerminalTransitionProps {
  isActive: boolean
  targetRoute: string
}

/** A visual route hint; Next.js handles focus and route announcements. */
export default function TerminalTransition({ isActive, targetRoute }: TerminalTransitionProps) {
  if (!isActive) return null

  return (
    <div className={styles.indicator} aria-hidden='true'>
      <span className={styles.prompt}>›</span>
      <span className={styles.label}>opening {targetRoute}</span>
    </div>
  )
}

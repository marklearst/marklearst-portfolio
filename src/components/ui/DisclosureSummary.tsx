import type { ComponentPropsWithoutRef } from 'react'
import { ChevronRightIcon } from './Icon'
import styles from './DisclosureSummary.module.css'

export default function DisclosureSummary({
  children,
  className = '',
  ...props
}: ComponentPropsWithoutRef<'summary'>) {
  return (
    <summary className={`${styles.summary} ${className}`} data-disclosure-summary {...props}>
      <span className={styles.label}>{children}</span>
      <ChevronRightIcon className={styles.caret} size={20} />
    </summary>
  )
}

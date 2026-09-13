'use client'

import type { ComponentPropsWithRef } from 'react'
import { ChevronRightIcon } from './Icon'
import styles from './DisclosureSummary.module.css'

export default function DisclosureSummary({
  children,
  className = '',
  onClick,
  onKeyDown,
  ...props
}: ComponentPropsWithRef<'summary'>) {
  return (
    <summary
      className={`${styles.summary} ${className}`}
      data-disclosure-summary
      {...props}
      onClick={event => {
        onClick?.(event)
        if (event.defaultPrevented) return
        const details = event.currentTarget.parentElement
        if (details?.tagName === 'DETAILS') {
          // Let the browser toggle immediately. Only a real pointer activation
          // opts the newly visible contents into the decorative reveal.
          details.dataset.disclosureMotion = event.detail > 0 && !details.hasAttribute('open') ? 'pointer' : 'none'
        }
      }}
      onKeyDown={event => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        const details = event.currentTarget.parentElement
        if (details?.tagName === 'DETAILS') details.dataset.disclosureMotion = 'none'
      }}
    >
      <span className={styles.label}>{children}</span>
      <ChevronRightIcon className={styles.caret} size={20} />
    </summary>
  )
}

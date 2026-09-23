'use client'

import { CircleCheckIcon, CircleXIcon } from '@/components/ui/Icon'
import { useAnalyticsOptOut } from '@/hooks/useAnalytics'
import styles from './AnalyticsOptOutToggle.module.css'

export default function AnalyticsOptOutToggle() {
  const { isOptedOut, toggleOptOut } = useAnalyticsOptOut()
  const hint = 'Anonymous, no cookies. Toggle any time.'

  return (
    <button
      type='button'
      onClick={toggleOptOut}
      aria-pressed={!isOptedOut}
      title={hint}
      data-opted-out={isOptedOut ? '' : undefined}
      className={styles.toggle}
    >
      <span className={styles.face}>
        <span className={styles.onLabel} aria-hidden={isOptedOut}>
          <CircleCheckIcon size={12} aria-hidden />
          <span>analytics on</span>
        </span>
        <span className={styles.offLabel} aria-hidden={!isOptedOut}>
          <CircleXIcon size={12} aria-hidden />
          <span>analytics off</span>
        </span>
      </span>
    </button>
  )
}

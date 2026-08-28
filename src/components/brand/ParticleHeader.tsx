'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAnalytics } from '@/hooks/useAnalytics'
import styles from './Wordmark.module.css'

export default function ParticleHeader() {
  const pathname = usePathname()
  const { trackNavigationClick, trackLogoHover } = useAnalytics()

  return (
    <Link
      href='/'
      className={styles.link}
      aria-label='Mark Learst - Home'
      onClick={() => {
        if (pathname !== '/') trackNavigationClick({ action: 'logo_click', from: pathname, to: '/' })
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') trackLogoHover({ action: 'expand' })
      }}
    >
      <span aria-hidden='true' className={styles.wordmark}>
        <span className={styles.brace}>{'{'}</span>
        <span>m</span><span className={styles.middle + ' brand-expansion'}>ark</span>
        <span>l</span><span className={styles.end + ' brand-expansion'}>earst</span>
        <span className={styles.brace}>{'}'}</span>
      </span>
    </Link>
  )
}

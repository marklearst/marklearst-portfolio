'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'
import { trackNavigationClick, trackLogoHover } from '@/lib/analytics'
import styles from './Wordmark.module.css'

export default function Wordmark() {
  const pathname = usePathname()

  return (
    <Link
      href='/'
      className={styles.link}
      aria-label='Mark Learst, home'
      onClick={() => {
        if (pathname !== '/') trackNavigationClick({ action: 'logo_click', from: pathname, to: '/' })
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') trackLogoHover({ action: 'expand' })
      }}
    >
      <span aria-hidden='true' className={styles.wordmark}>
        <span className={styles.brace}>{'{'}</span>
        <span className={styles.text}>
          <span className={styles.initials}>ml</span>
          <span className={styles.name}>
            {'marklearst'.split('').map((letter, index) => (
              <span key={index} className={styles.letter} style={{ '--letter-index': index } as CSSProperties}>
                <span className={styles.front}>{letter}</span>
                <span className={styles.back}>{letter}</span>
              </span>
            ))}
          </span>
        </span>
        <span className={styles.brace}>{'}'}</span>
      </span>
    </Link>
  )
}

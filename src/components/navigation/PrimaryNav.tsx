'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CSSProperties, ReactNode } from 'react'
import { trackNavigationClick } from '@/lib/analytics'
import styles from './PrimaryNav.module.css'

const items = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Artifacts', href: '/artifacts' },
]

interface PrimaryNavProps {
  /** Actions that share the bar with the links and sit after them, set apart by a rule. They are not navigation, so they render outside the nav landmark. */
  children?: ReactNode
}

export default function PrimaryNav({ children }: PrimaryNavProps) {
  const pathname = usePathname()
  const activeIndex = items.findIndex(({ href }) => pathname === href || pathname.startsWith(`${href}/`))

  return (
    <div className={styles.bar}>
      <nav
        className={styles.nav}
        aria-label='Primary navigation'
        data-active={activeIndex >= 0 || undefined}
        style={{ '--active-index': Math.max(0, activeIndex) } as CSSProperties}
      >
        {items.map(({ label, href }, index) => (
          <Link
            key={href}
            href={href}
            className={styles.link}
            aria-current={activeIndex === index ? 'page' : undefined}
            onClick={() => trackNavigationClick({ action: `nav_${label.toLowerCase()}`, from: pathname, to: href, location: 'header' })}
          >
            <span>{label}</span>
          </Link>
        ))}
        <span aria-hidden='true' className={styles.mask}>
          {items.map(({ label }) => <span key={label}>{label}</span>)}
        </span>
      </nav>
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  )
}

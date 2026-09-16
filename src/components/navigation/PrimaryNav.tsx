'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'
import { trackNavigationClick } from '@/lib/analytics'
import styles from './PrimaryNav.module.css'

const items = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Artifacts', href: '/artifacts' },
]

export default function PrimaryNav() {
  const pathname = usePathname()
  const activeIndex = items.findIndex(({ href }) => pathname === href || pathname.startsWith(`${href}/`))

  return (
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
    </nav>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAnalytics } from '@/hooks/useAnalytics'
import styles from './PrimaryNav.module.css'

const items = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Artifacts', href: '/artifacts' },
]

export default function PrimaryNav() {
  const pathname = usePathname()
  const { trackNavigationClick } = useAnalytics()
  const active = items.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`))?.href

  return (
    <nav className={styles.nav} aria-label='Primary navigation'>
      {items.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className={styles.link}
          aria-current={active === href ? 'page' : undefined}
          onClick={() => trackNavigationClick({ action: `nav_${label.toLowerCase()}`, from: pathname, to: href, location: 'header' })}
        >
          <span className={styles.indicator} aria-hidden='true' />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  )
}

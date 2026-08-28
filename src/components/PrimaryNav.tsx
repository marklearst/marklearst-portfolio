'use client'

import { useLayoutEffect, useRef, useState } from 'react'
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
  const navRef = useRef<HTMLElement>(null)
  const markerRef = useRef<HTMLSpanElement>(null)
  const labels = useRef<Record<string, HTMLSpanElement | null>>({})
  const [hovered, setHovered] = useState<string | null>(null)
  const active = items.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`))?.href
  const selected = hovered ?? active

  useLayoutEffect(() => {
    const nav = navRef.current
    const marker = markerRef.current
    if (!nav || !marker) return
    const update = () => {
      const label = selected ? labels.current[selected] : null
      if (!label) { marker.style.opacity = '0'; return }
      const bounds = label.getBoundingClientRect()
      marker.style.transform = `translateX(${bounds.left - nav.getBoundingClientRect().left}px) scaleX(${bounds.width})`
      marker.style.opacity = '1'
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(nav)
    return () => observer.disconnect()
  }, [selected])

  return (
    <nav ref={navRef} className={styles.nav} aria-label='Primary navigation' onPointerLeave={() => setHovered(null)}>
      <span ref={markerRef} className={styles.marker} aria-hidden='true' />
      {items.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className={styles.link}
          aria-current={active === href ? 'page' : undefined}
          onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(href) }}
          onFocus={() => setHovered(href)}
          onBlur={() => setHovered(null)}
          onClick={() => trackNavigationClick({ action: `nav_${label.toLowerCase()}`, from: pathname, to: href, location: 'header' })}
        >
          <span ref={(node) => { labels.current[href] = node }}>{label}</span>
        </Link>
      ))}
    </nav>
  )
}

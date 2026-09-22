'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { trackNavigationClick } from '@/lib/analytics'
import styles from './PrimaryNav.module.css'

const items = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Artifacts', href: '/artifacts' },
]

/** Translation spring: stiff + damped, clamped so it never overshoots. */
function springIndex(from: number, to: number, onUpdate: (value: number) => void) {
  const stiffness = 270
  const damping = 36
  let position = from
  let velocity = 0
  let frame = 0
  let previous = performance.now()

  const tick = (now: number) => {
    const dt = Math.min(0.032, (now - previous) / 1000)
    previous = now
    velocity += (-stiffness * (position - to) - damping * velocity) * dt
    position += velocity * dt

    if ((to >= from && position > to) || (to <= from && position < to)) {
      position = to
      velocity = 0
    }

    onUpdate(position)

    if (Math.abs(position - to) < 0.0008 && Math.abs(velocity) < 0.02) {
      onUpdate(to)
      return
    }

    frame = requestAnimationFrame(tick)
  }

  frame = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(frame)
}

export default function PrimaryNav() {
  const pathname = usePathname()
  const activeIndex = items.findIndex(({ href }) => pathname === href || pathname.startsWith(`${href}/`))
  const resolvedIndex = Math.max(0, activeIndex)
  const navRef = useRef<HTMLElement>(null)
  const pillIndex = useRef(resolvedIndex)
  const hadActive = useRef(activeIndex >= 0)
  const stopSpring = useRef<(() => void) | null>(null)

  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const from = pillIndex.current
    const to = resolvedIndex
    const previouslyActive = hadActive.current
    hadActive.current = activeIndex >= 0
    stopSpring.current?.()
    stopSpring.current = null

    const setPill = (value: number) => {
      pillIndex.current = value
      nav.style.setProperty('--pill-index', String(value))
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = document.documentElement.getAttribute('data-route-input') === 'pointer'
    // Spring only between real destinations — never from a home phantom Work slot.
    const shouldSpring = !reduced && pointer && from !== to && activeIndex >= 0 && previouslyActive

    if (!shouldSpring) {
      setPill(to)
      return
    }

    stopSpring.current = springIndex(from, to, setPill)
    return () => {
      stopSpring.current?.()
      stopSpring.current = null
    }
  }, [resolvedIndex, activeIndex])

  return (
    <nav
      ref={navRef}
      className={styles.nav}
      aria-label='Primary navigation'
      data-active={activeIndex >= 0 || undefined}
      style={{
        '--active-index': resolvedIndex,
        '--pill-index': pillIndex.current,
      } as CSSProperties}
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

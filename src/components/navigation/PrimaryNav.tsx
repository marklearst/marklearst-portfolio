'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react'
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
  const hoverIndex = useRef<number | null>(null)
  const stopSpring = useRef<(() => void) | null>(null)

  const setPill = (value: number) => {
    const nav = navRef.current
    if (!nav) return
    pillIndex.current = value
    nav.style.setProperty('--pill-index', String(value))
  }

  const animatePill = (to: number, soft: boolean) => {
    const from = pillIndex.current
    stopSpring.current?.()
    stopSpring.current = null

    if (from === to || !soft) {
      setPill(to)
      return
    }

    setPill(from)
    stopSpring.current = springIndex(from, to, setPill)
  }

  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return

    // Hover preview owns the pill while a link is hovered.
    if (hoverIndex.current !== null) return

    const from = pillIndex.current
    const to = resolvedIndex
    const previouslyActive = hadActive.current
    hadActive.current = activeIndex >= 0
    stopSpring.current?.()
    stopSpring.current = null

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = document.documentElement.getAttribute('data-route-input') === 'pointer'
    // Spring only between real destinations — never from a home phantom Work slot.
    const shouldSpring = !reduced && pointer && from !== to && activeIndex >= 0 && previouslyActive

    if (!shouldSpring) {
      setPill(to)
      return
    }

    setPill(from)
    stopSpring.current = springIndex(from, to, setPill)
    return () => {
      stopSpring.current?.()
      stopSpring.current = null
    }
  }, [resolvedIndex, activeIndex])

  // Hover/focus springs --pill-index. Leave returns to aria-current without a snap.
  // With no current page, leave only clears hover — do not park on a phantom Work slot.
  // Polling also picks up CSS.forcePseudoState (no mouseenter).
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const links = () => Array.from(nav.querySelectorAll<HTMLAnchorElement>(`.${styles.link}`))
    const restIndex = activeIndex >= 0 ? activeIndex : null

    const go = (index: number | null) => {
      if (hoverIndex.current === index) return
      hoverIndex.current = index
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (index === null) {
        if (restIndex !== null) animatePill(restIndex, !reduced)
        return
      }
      animatePill(index, !reduced)
    }

    const syncPreview = () => {
      const list = links()
      const hovered = list.findIndex(link => link.matches(':hover'))
      if (hovered >= 0) {
        go(hovered)
        return
      }
      const focused = list.findIndex(link => link.matches(':focus-visible'))
      go(focused >= 0 ? focused : null)
    }

    const onPointerOver = (event: PointerEvent) => {
      const link = (event.target as Element | null)?.closest?.('a')
      if (!link || !nav.contains(link)) return
      const index = links().indexOf(link as HTMLAnchorElement)
      if (index >= 0) go(index)
    }

    const onPointerLeave = () => go(null)

    const onFocusIn = (event: FocusEvent) => {
      const link = (event.target as Element | null)?.closest?.('a')
      if (!link || !nav.contains(link)) return
      const index = links().indexOf(link as HTMLAnchorElement)
      if (index >= 0) go(index)
    }

    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget as Node | null
      if (next && nav.contains(next)) return
      // Hover still owns the pill if the pointer is over a link.
      if (links().some(link => link.matches(':hover'))) return
      go(null)
    }

    nav.addEventListener('pointerover', onPointerOver)
    nav.addEventListener('pointerleave', onPointerLeave)
    nav.addEventListener('focusin', onFocusIn)
    nav.addEventListener('focusout', onFocusOut)
    const poll = window.setInterval(syncPreview, 32)

    return () => {
      nav.removeEventListener('pointerover', onPointerOver)
      nav.removeEventListener('pointerleave', onPointerLeave)
      nav.removeEventListener('focusin', onFocusIn)
      nav.removeEventListener('focusout', onFocusOut)
      window.clearInterval(poll)
    }
  }, [activeIndex, resolvedIndex])

  return (
    <nav
      ref={navRef}
      className={styles.nav}
      aria-label='Primary navigation'
      data-active={activeIndex >= 0 || undefined}
      style={{
        '--active-index': resolvedIndex,
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

'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAnalytics } from '@/hooks/useAnalytics'
import { MONOKAI } from '@/lib/monokai-colors'

const navItems = [
  { label: 'about', href: '/about', key: 'about' },
  { label: 'work', href: '/work', key: 'work' },
  { label: 'artifacts', href: '/artifacts', key: 'artifacts' },
]

export default function PrimaryNav() {
  const pathname = usePathname()
  const { trackNavigationClick } = useAnalytics()
  const navRef = useRef<HTMLElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<Record<string, HTMLSpanElement | null>>({})
  const [hoverKey, setHoverKey] = useState<string | null>(null)
  const [workInView, setWorkInView] = useState(false)

  const isActive = (key: string) => {
    if (key === 'about') return pathname === '/about'
    if (key === 'work') {
      if (pathname.startsWith('/work')) return true
      if (pathname === '/') return workInView
      return false
    }
    if (key === 'artifacts') return pathname.startsWith('/artifacts')
    return false
  }

  const activeKey = navItems.find((item) => isActive(item.key))?.key ?? null
  const indicatorKey = hoverKey ?? activeKey
  const isHovering = Boolean(hoverKey)

  const updateIndicator = (key: string | null) => {
    const navEl = navRef.current
    const labelEl = key ? labelRefs.current[key] : null
    const indicatorEl = indicatorRef.current

    if (!navEl || !indicatorEl) return

    if (!labelEl) {
      indicatorEl.style.opacity = '0'
      return
    }

    const navRect = navEl.getBoundingClientRect()
    const labelRect = labelEl.getBoundingClientRect()
    const left = labelRect.left - navRect.left
    const width = labelRect.width

    indicatorEl.style.width = `${width - 1}px`
    indicatorEl.style.transform = `translateX(${left - 1}px)`
    indicatorEl.style.opacity = '1'
  }

  useLayoutEffect(() => {
    updateIndicator(indicatorKey)
  }, [indicatorKey, pathname])

  useEffect(() => {
    if (pathname !== '/') return

    let rafId = 0

    const updateWorkActive = () => {
      const section = document.getElementById('work')
      if (!section) return
      const rect = section.getBoundingClientRect()
      const triggerPoint = window.innerHeight * 0.1
      const nextActive = rect.top <= triggerPoint && rect.bottom >= triggerPoint
      setWorkInView((prev) => (prev === nextActive ? prev : nextActive))
    }

    const handleScroll = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        updateWorkActive()
      })
    }

    updateWorkActive()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [pathname])

  useEffect(() => {
    const handleResize = () => updateIndicator(indicatorKey)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [indicatorKey])

  return (
    <nav
      ref={navRef}
      className='relative flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-3 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.35)]'
      onMouseLeave={() => setHoverKey(null)}
    >
      <div
        ref={indicatorRef}
        aria-hidden='true'
        className={`pointer-events-none absolute bottom-2.5 left-0 h-[2px] rounded-full transition-[transform,width,opacity,background] duration-300 ease-out ${
          isHovering ? 'animate-gradient-x' : ''
        }`}
        style={{
          width: 0,
          opacity: 0,
          transform: 'translateX(0)',
          backgroundImage: isHovering
            ? 'linear-gradient(90deg, #ff6188, #fb9866, #ffd866, #a9dc75, #78dce8, #ab9df2, #ff6188)'
            : 'none',
          backgroundColor: isHovering ? 'transparent' : 'rgba(255,255,255,0.4)',
          backgroundSize: '200% 100%',
        }}
      />
      {navItems.map((item) => {
        const active = isActive(item.key)

        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => {
              trackNavigationClick({
                action: `nav_${item.key}`,
                from: pathname,
                to: item.href,
                location: 'header',
              })
            }}
            className='px-2 pt-2 pb-1.5 text-xs font-mono uppercase tracking-wider transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
            aria-current={active ? 'page' : undefined}
            style={{
              color: active ? MONOKAI.foreground : `${MONOKAI.foreground}80`,
            }}
            onMouseEnter={(event) => {
              setHoverKey(item.key)
              if (!active) event.currentTarget.style.color = MONOKAI.foreground
            }}
            onMouseLeave={(event) => {
              if (!active)
                event.currentTarget.style.color = `${MONOKAI.foreground}80`
            }}
            onFocus={() => {
              if (!active) setHoverKey(item.key)
            }}
            onBlur={() => {
              if (hoverKey === item.key) setHoverKey(null)
            }}
          >
            <span
              ref={(node) => {
                labelRefs.current[item.key] = node
              }}
              className='inline-block'
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

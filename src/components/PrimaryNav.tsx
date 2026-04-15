'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAnalytics } from '@/hooks/useAnalytics'
import { MONOKAI } from '@/lib/monokai-colors'
import { useEffectsStore } from '@/stores/cursor-orbs-store'

const navItems = [
  { label: 'about', href: '/about', key: 'about' },
  { label: 'work', href: '/work', key: 'work' },
  { label: 'artifacts', href: '/artifacts', key: 'artifacts' },
]

function CodeToggleIcon({ active }: { active: boolean }) {
  const [text, setText] = useState(active ? '<On />' : '<Off />')
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const sequence =
      active ?
        ['<Off />', '<Of />', '<O />', '<On />']
      : ['<On />', '<O />', '<Of />', '<Off />']

    let currentIndex = 0

    const animate = () => {
      if (currentIndex < sequence.length) {
        setText(sequence[currentIndex])
        currentIndex++
        timeoutRef.current = setTimeout(animate, 50)
      }
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    animate()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [active])

  // Increased size for better visibility
  const size = 32
  const color = active ? MONOKAI.cyan : MONOKAI.foreground
  const bgColor = active ? `${MONOKAI.green}08` : `${MONOKAI.pink}08`

  return (
    <svg
      width={size * 2}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill='none'
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        opacity: active ? 1 : 0.3,
      }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 2}
        fill={bgColor}
        style={{ transition: 'fill 300ms' }}
      />
      <text
        x='50%'
        y='55%'
        fontSize='16'
        fontFamily='monospace'
        fontWeight='600'
        fill={color}
        textAnchor='middle'
        dominantBaseline='middle'
      >
        {text}
      </text>
    </svg>
  )
}

function OrbsIcon({ active }: { active: boolean }) {
  const colors =
    active ?
      [
        '#ffd866', // yellow
        '#a9dc75', // green
        '#78dce8', // cyan
        '#ab9df2', // purple
        '#ff6188', // pink
        '#fb9866', // orange
      ]
    : Array(6).fill('#777777') // gray when inactive

  const size = 24
  const radius = 9
  const dotSize = 2.5
  const cx = size / 2
  const cy = size / 2

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill='none'
      style={{
        animation: active ? 'spin 8s linear infinite' : 'none',
        opacity: active ? 1 : 0.8,
        transition: 'opacity 1000ms',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {colors.map((color, i) => {
        const angle = (i / colors.length) * Math.PI * 2 - Math.PI / 2
        const x = cx + Math.cos(angle) * radius
        const y = cy + Math.sin(angle) * radius
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={dotSize}
            fill={color}
            style={{ transition: 'fill 300ms' }}
          />
        )
      })}
    </svg>
  )
}

export default function PrimaryNav() {
  const pathname = usePathname()
  const { trackNavigationClick } = useAnalytics()
  const { orbsVisible, toggleOrbs, neuralTextVisible, toggleNeuralText } =
    useEffectsStore()
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
          backgroundImage:
            isHovering ?
              'linear-gradient(90deg, #ff6188, #fb9866, #ffd866, #a9dc75, #78dce8, #ab9df2, #ff6188)'
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
            className='primary-nav-link px-2 pt-2 pb-1.5 text-xs font-mono uppercase tracking-wider transition-colors duration-200'
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
      <div className='w-px h-4 bg-white/10 mx-1' aria-hidden='true' />
      <button
        type='button'
        onClick={toggleNeuralText}
        className='p-2 rounded-full transition-colors duration-200 hover:bg-white/5'
        style={{ color: MONOKAI.foreground }}
        aria-label={
          neuralTextVisible ? 'Hide code keywords' : 'Show code keywords'
        }
        title={neuralTextVisible ? 'Hide code keywords' : 'Show code keywords'}
      >
        <CodeToggleIcon active={neuralTextVisible} />
      </button>
      <button
        type='button'
        onClick={toggleOrbs}
        className='p-2 rounded-full transition-colors duration-200 hover:bg-white/5'
        style={{ color: MONOKAI.foreground }}
        aria-label={orbsVisible ? 'Hide cursor effects' : 'Show cursor effects'}
        title={orbsVisible ? 'Hide cursor effects' : 'Show cursor effects'}
      >
        <OrbsIcon active={orbsVisible} />
      </button>
    </nav>
  )
}

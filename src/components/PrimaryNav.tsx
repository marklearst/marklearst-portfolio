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

function CodeToggleIcon({
  active,
  discovering = false,
}: {
  active: boolean
  discovering?: boolean
}) {
  const [text, setText] = useState(active ? '<On/>' : '<Off/>')
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const sequence = active
      ? ['<Off/>', '<Of/>', '<O/>', '<On/>']
      : ['<On/>', '<O/>', '<Of/>', '<Off/>']

    let currentIndex = 0

    const animate = () => {
      if (currentIndex < sequence.length) {
        setText(sequence[currentIndex])
        currentIndex++
        timeoutRef.current = setTimeout(animate, 100)
      }
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    animate()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [active])

  const size = 48
  // During discovery, show the "on" color to hint at functionality
  const color = active || discovering ? MONOKAI.cyan : '#777777'

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill='none'
      style={{
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <text
        x='50%'
        y='55%'
        fontSize='14'
        fontFamily='monospace'
        fontWeight='700'
        fill={color}
        textAnchor='middle'
        dominantBaseline='middle'
        style={{
          transition: 'fill 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {text}
      </text>
    </svg>
  )
}

function OrbsIcon({
  active,
  discovering = false,
}: {
  active: boolean
  discovering?: boolean
}) {
  const monoColors = [
    MONOKAI.yellow,
    MONOKAI.green,
    MONOKAI.cyan,
    MONOKAI.purple,
    MONOKAI.pink,
    MONOKAI.orange,
  ]
  // During discovery, show the vibrant colors to hint at functionality
  const colors = active || discovering ? monoColors : Array(6).fill('#777777')

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
        opacity: active || discovering ? 1 : 0.8,
        transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)',
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
            style={{
              transition: `fill 400ms cubic-bezier(0.16, 1, 0.3, 1) ${
                i * 50
              }ms`,
            }}
          />
        )
      })}
    </svg>
  )
}

export default function PrimaryNav() {
  const pathname = usePathname()
  const { trackNavigationClick } = useAnalytics()
  const {
    orbsVisible,
    toggleOrbs,
    neuralTextVisible,
    setNeuralTextVisible,
    homeNeuralState,
    setHomeNeuralState,
  } = useEffectsStore()
  const navRef = useRef<HTMLElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<Record<string, HTMLSpanElement | null>>({})
  const codeButtonRef = useRef<HTMLButtonElement>(null)
  const orbsButtonRef = useRef<HTMLButtonElement>(null)
  const [hoverKey, setHoverKey] = useState<string | null>(null)
  const [workInView, setWorkInView] = useState(false)

  // Discovery animation state - pulses colors to hint at toggle functionality
  const [codeDiscovering, setCodeDiscovering] = useState(false)
  const [orbsDiscovering, setOrbsDiscovering] = useState(false)

  // Discovery animation: pulse colors with WAAPI for smooth compositor timing
  useEffect(() => {
    // Only run discovery if both toggles are off (default state)
    if (neuralTextVisible || orbsVisible) return
    if (typeof Element === 'undefined' || !Element.prototype.animate) return

    const pulseIterations = 2
    const pulseDuration = 1200 // ms per pulse cycle
    const codeDelay = 3000 // Start after hero animation completes
    const orbsDelay = 3500 // Stagger orbs after code toggle

    const runDiscovery = (
      element: HTMLButtonElement | null,
      delay: number,
      setDiscovering: (value: boolean) => void,
    ) => {
      if (!element) return () => {}

      const animation = element.animate(
        [{ opacity: 0.55 }, { opacity: 1 }, { opacity: 0.8 }],
        {
          duration: pulseDuration,
          iterations: pulseIterations,
          delay,
          easing: 'ease-out',
        },
      )

      const startTimeout = window.setTimeout(
        () => setDiscovering(true),
        delay,
      )
      const endTimeout = window.setTimeout(
        () => setDiscovering(false),
        delay + pulseDuration * pulseIterations,
      )

      return () => {
        animation.cancel()
        window.clearTimeout(startTimeout)
        window.clearTimeout(endTimeout)
      }
    }

    const cleanupCode = runDiscovery(
      codeButtonRef.current,
      codeDelay,
      setCodeDiscovering,
    )
    const cleanupOrbs = runDiscovery(
      orbsButtonRef.current,
      orbsDelay,
      setOrbsDiscovering,
    )

    return () => {
      cleanupCode()
      cleanupOrbs()
    }
  }, [neuralTextVisible, orbsVisible]) // Only run once on mount

  // Handle neural text state based on route
  useEffect(() => {
    if (pathname === '/') {
      // On home, restore user preference
      setNeuralTextVisible(homeNeuralState)
    } else {
      // On other pages, default to off (for reading clarity)
      setNeuralTextVisible(false)
    }
  }, [pathname, homeNeuralState, setNeuralTextVisible])

  const handleToggleNeuralText = () => {
    const nextState = !neuralTextVisible
    setNeuralTextVisible(nextState)

    // If on home page, update the preference
    if (pathname === '/') {
      setHomeNeuralState(nextState)
    }
  }

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
    const width = labelRect.width - 1

    // Use transform only (GPU-accelerated) - scaleX for width, translateX for position
    indicatorEl.style.transform = `translateX(${left - 1}px) scaleX(${width})`
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
      className='relative flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md pl-5 pr-3 shadow-[0_12px_30px_rgba(0,0,0,0.35)]'
      onMouseLeave={() => setHoverKey(null)}
    >
      <div
        ref={indicatorRef}
        aria-hidden='true'
        className={`pointer-events-none absolute bottom-3 left-0 h-[2px] rounded-full transition-[transform,opacity,background] duration-300 ease-out ${
          isHovering ? 'animate-gradient-x' : ''
        }`}
        style={{
          width: 1,
          opacity: 0,
          transform: 'translateX(0) scaleX(0)',
          transformOrigin: 'left',
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
      <div
        className='w-px h-10 mr-3 mx-1'
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(255,255,255,0.25), transparent)',
        }}
        aria-hidden='true'
      />
      <button
        ref={codeButtonRef}
        type='button'
        onClick={handleToggleNeuralText}
        onMouseEnter={() => setHoverKey(null)}
        aria-label={
          neuralTextVisible ? 'Hide code keywords' : 'Show code keywords'
        }
        title={neuralTextVisible ? 'Hide code keywords' : 'Show code keywords'}
      >
        <CodeToggleIcon
          active={neuralTextVisible}
          discovering={codeDiscovering}
        />
      </button>
      <button
        ref={orbsButtonRef}
        type='button'
        onClick={toggleOrbs}
        onMouseEnter={() => setHoverKey(null)}
        className='p-2'
        style={{ color: MONOKAI.foreground }}
        aria-label={orbsVisible ? 'Hide cursor effects' : 'Show cursor effects'}
        title={orbsVisible ? 'Hide cursor effects' : 'Show cursor effects'}
      >
        <OrbsIcon active={orbsVisible} discovering={orbsDiscovering} />
      </button>
    </nav>
  )
}

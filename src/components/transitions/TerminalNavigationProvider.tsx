'use client'

import { useCallback, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useTerminalNavigation } from '@/hooks/useTerminalNavigation'
import { useTransitionStore } from '@/store/transition-store'
import TerminalTransition from './TerminalTransition'

export default function TerminalNavigationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize navigation hook
  useTerminalNavigation()

  const pathname = usePathname()
  const previousPathRef = useRef(pathname)
  const hasInitializedRef = useRef(false)

  // Get transition state
  const {
    isTransitioning,
    phase,
    targetRoute,
    targetHref,
    triggerNavigation,
    completeTransition,
    transitionKey,
  } = useTransitionStore()

  const normalizePathname = (path: string) =>
    path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path
  const isReadyToExit = Boolean(
    isTransitioning &&
      phase === 'navigating' &&
      targetRoute &&
      normalizePathname(pathname) === normalizePathname(targetRoute),
  )

  // On mount, ensure no stuck transition state from previous session
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      // Clear any stuck transition state on fresh page load
      if (isTransitioning) {
        completeTransition()
      }
    }
  }, [isTransitioning, completeTransition])

  useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    const body = document.body

    if (isTransitioning) {
      const scrollbarWidth = window.innerWidth - root.clientWidth
      root.style.setProperty(
        '--transition-scrollbar-width',
        `${scrollbarWidth}px`,
      )
      root.setAttribute('data-transitioning', 'true')
      body.setAttribute('data-transitioning', 'true')
    } else {
      root.removeAttribute('data-transitioning')
      body.removeAttribute('data-transitioning')
      root.style.removeProperty('--transition-scrollbar-width')
    }
  }, [isTransitioning])

  // Complete transition when pathname actually changes (new page loaded)
  useEffect(() => {
    if (pathname !== previousPathRef.current) {
      previousPathRef.current = pathname
      if (!isTransitioning || phase !== 'navigating') return

      // Only complete transition after enough time for animation to finish
      // If transition is active, wait longer for terminal animation to complete
      const delay = isTransitioning ? 650 : 100
      const key = transitionKey

      setTimeout(() => {
        completeTransition(key)
      }, delay)
    }
  }, [pathname, isTransitioning, phase, transitionKey, completeTransition])

  useEffect(() => {
    if (!isTransitioning || phase !== 'navigating' || !targetRoute) return

    const currentPath = normalizePathname(pathname)
    const targetPath = normalizePathname(targetRoute)
    if (currentPath !== targetPath) return

    const key = transitionKey
    const settleTimeout = setTimeout(() => {
      const state = useTransitionStore.getState()
      if (state.isTransitioning && state.transitionKey === key) {
        state.completeTransition(key)
      }
    }, 350)

    return () => {
      clearTimeout(settleTimeout)
    }
  }, [isTransitioning, phase, targetRoute, pathname, transitionKey])

  useEffect(() => {
    if (!isTransitioning || !targetRoute) return

    const key = transitionKey
    let finalizeTimeout: ReturnType<typeof setTimeout> | null = null

    const fallbackTimeout = setTimeout(() => {
      const state = useTransitionStore.getState()
      if (!state.isTransitioning || state.transitionKey !== key) return

      const currentPath = normalizePathname(window.location.pathname)
      const targetPath = normalizePathname(state.targetRoute || '')

      if (targetPath && currentPath !== targetPath) {
        state.triggerNavigation(key)
      }

      finalizeTimeout = setTimeout(() => {
        const nextState = useTransitionStore.getState()
        if (!nextState.isTransitioning || nextState.transitionKey !== key) {
          return
        }

        const nowPath = normalizePathname(window.location.pathname)
        const nextTarget = normalizePathname(nextState.targetRoute || '')

        if (nextTarget && nowPath !== nextTarget) {
          const fallbackHref = nextState.targetHref || nextState.targetRoute
          if (fallbackHref) {
            window.location.assign(fallbackHref)
            return
          }
        }

        nextState.completeTransition(key)
      }, 1200)
    }, 4500)

    return () => {
      clearTimeout(fallbackTimeout)
      if (finalizeTimeout) {
        clearTimeout(finalizeTimeout)
      }
    }
  }, [isTransitioning, targetRoute, targetHref, transitionKey])

  const handleComplete = useCallback(
    (key: number) => {
      // Only trigger navigation, don't complete transition yet
      // Transition will complete when pathname changes (useEffect above)
      triggerNavigation(key)
    },
    [triggerNavigation],
  )

  return (
    <>
      <div
        style={{
          opacity: !isTransitioning || phase === 'navigating' ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
          visibility:
            !isTransitioning || phase === 'navigating' ? 'visible' : 'hidden',
          pointerEvents:
            !isTransitioning || phase === 'navigating' ? 'auto' : 'none',
          willChange: 'opacity',
        }}
      >
        {children}
      </div>
      <TerminalTransition
        isActive={isTransitioning}
        targetRoute={targetRoute || ''}
        transitionKey={transitionKey}
        shouldExit={isReadyToExit}
        onComplete={handleComplete}
      />
    </>
  )
}

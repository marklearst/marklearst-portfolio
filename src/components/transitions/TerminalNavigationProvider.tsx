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
    targetRoute,
    triggerNavigation,
    completeTransition,
    transitionKey,
  } = useTransitionStore()

  const normalizePathname = (path: string) =>
    path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path

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

  // Complete transition when pathname actually changes (new page loaded)
  useEffect(() => {
    if (pathname !== previousPathRef.current) {
      previousPathRef.current = pathname

      // Only complete transition after enough time for animation to finish
      // If transition is active, wait longer for terminal animation to complete
      const delay = isTransitioning ? 1200 : 100

      setTimeout(() => {
        completeTransition()
      }, delay)
    }
  }, [pathname, isTransitioning, completeTransition])

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
        state.triggerNavigation()
      }

      finalizeTimeout = setTimeout(() => {
        const nextState = useTransitionStore.getState()
        if (nextState.isTransitioning && nextState.transitionKey === key) {
          nextState.completeTransition()
        }
      }, 600)
    }, 4500)

    return () => {
      clearTimeout(fallbackTimeout)
      if (finalizeTimeout) {
        clearTimeout(finalizeTimeout)
      }
    }
  }, [isTransitioning, targetRoute, transitionKey])

  const handleComplete = useCallback(() => {
    // Only trigger navigation, don't complete transition yet
    // Transition will complete when pathname changes (useEffect above)
    triggerNavigation()
  }, [triggerNavigation])

  return (
    <>
      <div
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 0.3s ease-out',
          visibility: isTransitioning ? 'hidden' : 'visible',
        }}
      >
        {children}
      </div>
      <TerminalTransition
        isActive={isTransitioning}
        targetRoute={targetRoute || ''}
        onComplete={handleComplete}
      />
    </>
  )
}

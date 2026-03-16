'use client'

import { useEffect, useRef } from 'react'
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
  const { isTransitioning, targetRoute, triggerNavigation, completeTransition } =
    useTransitionStore()

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
      // Small delay to let new page render before revealing
      setTimeout(() => {
        completeTransition()
      }, 100)
    }
  }, [pathname, completeTransition])

  const handleComplete = () => {
    // Only trigger navigation, don't complete transition yet
    // Transition will complete when pathname changes (useEffect above)
    triggerNavigation()
  }

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

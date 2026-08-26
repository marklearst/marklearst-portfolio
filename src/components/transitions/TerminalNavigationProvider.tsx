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
  useTerminalNavigation()
  const pathname = usePathname()
  const previousPathname = useRef(pathname)
  const { isTransitioning, targetRoute, transitionKey, completeTransition } =
    useTransitionStore()

  useEffect(() => {
    const routeChanged = previousPathname.current !== pathname
    previousPathname.current = pathname
    if (!isTransitioning) return

    const normalizePath = (path: string) => path.replace(/\/$/, '') || '/'
    if (routeChanged || (targetRoute && normalizePath(pathname) === normalizePath(targetRoute))) {
      completeTransition(transitionKey)
      return
    }

    // Dismiss abandoned status only. Never retry a route or override browser history.
    const timeout = window.setTimeout(() => completeTransition(transitionKey), 8000)
    return () => window.clearTimeout(timeout)
  }, [pathname, isTransitioning, targetRoute, transitionKey, completeTransition])

  return (
    <>
      {children}
      <TerminalTransition isActive={isTransitioning} targetRoute={targetRoute || ''} />
    </>
  )
}

'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { navigationHistoryKeys } from '@/hooks/useNavigationHistory'

export default function NavigationHistoryTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const fullPath =
      window.location.pathname +
      window.location.search +
      window.location.hash

    if (fullPath.startsWith('/privacy')) return

    try {
      window.sessionStorage.setItem(
        navigationHistoryKeys.LAST_ROUTE_KEY,
        fullPath,
      )
    } catch {}

    window.dispatchEvent(new Event(navigationHistoryKeys.LAST_ROUTE_EVENT))
  }, [pathname])

  return null
}

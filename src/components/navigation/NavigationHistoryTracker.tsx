'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { navigationHistoryKeys } from '@/components/navigation/useNavigationHistory'
import { trackHashNavigation } from '@/lib/analytics'

export default function NavigationHistoryTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/') return
    const trackHash = (source: string) => {
      const hash = window.location.hash.slice(1)
      if (hash) trackHashNavigation({ hash, source })
    }
    trackHash('initial_load')
    const onHashChange = () => trackHash('hash_change')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [pathname])

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

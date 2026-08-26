'use client'

import { useEffect } from 'react'
import { useTransitionStore } from '@/store/transition-store'

/** Observe route changes without taking navigation away from the browser or Next Link. */
export function useTerminalNavigation() {
  const startTransition = useTransitionStore((state) => state.startTransition)
  const completeTransition = useTransitionStore((state) => state.completeTransition)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.detail === 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (!(event.target instanceof Element)) return

      const link = event.target.closest<HTMLAnchorElement>('a[href]')
      if (!link || link.hasAttribute('download') || link.hasAttribute('data-no-transition')) return
      if (link.target && link.target.toLowerCase() !== '_self') return
      if (link.relList.contains('external')) return

      const href = link.getAttribute('href')
      if (!href || href.startsWith('#')) return

      let destination: URL
      try {
        destination = new URL(href, window.location.href)
      } catch {
        return
      }

      if (destination.origin !== window.location.origin) return
      if (!['http:', 'https:'].includes(destination.protocol)) return
      if (destination.pathname === window.location.pathname) return

      // The event continues untouched. Next Link or the browser performs navigation.
      startTransition(
        destination.pathname,
        () => {},
        `${destination.pathname}${destination.search}${destination.hash}`,
      )
    }

    const handlePopState = () => completeTransition()

    document.addEventListener('click', handleClick, true)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [startTransition, completeTransition])

  return { startTransition, completeTransition }
}

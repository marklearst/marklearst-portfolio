'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTransitionStore } from '@/store/transition-store'

/**
 * Hook to handle terminal-based navigation
 * Intercepts link clicks and triggers terminal transition
 */
export function useTerminalNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { startTransition, completeTransition, isTransitioning } =
    useTransitionStore()
  const pathnameRef = useRef(pathname)
  const routerRef = useRef(router)
  const startTransitionRef = useRef(startTransition)
  const isTransitioningRef = useRef(isTransitioning)
  const pendingNavigationRef = useRef<{
    targetPath: string
    nextHref: string
    hash: string
  } | null>(null)

  useEffect(() => {
    pathnameRef.current = pathname
    routerRef.current = router
    startTransitionRef.current = startTransition
    isTransitioningRef.current = isTransitioning
  }, [pathname, router, startTransition, isTransitioning])

  const normalizePathname = (path: string) =>
    path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path

  const startNavigation = (
    targetPath: string,
    nextHref: string,
    hash: string,
  ) => {
    startTransitionRef.current(targetPath, () => {
      routerRef.current.push(nextHref)
      // Scroll to hash or top after navigation
      setTimeout(() => {
        if (hash) {
          const element = document.getElementById(hash)
          if (element) {
            element.scrollIntoView({ behavior: 'instant' })
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' })
        }
      }, 100)
    }, nextHref)
  }

  useEffect(() => {
    if (isTransitioning) return

    const pending = pendingNavigationRef.current
    if (!pending) return

    pendingNavigationRef.current = null
    const currentPath = normalizePathname(pathnameRef.current)
    if (pending.targetPath === currentPath) return

    startNavigation(pending.targetPath, pending.nextHref, pending.hash)
  }, [isTransitioning])

  useEffect(() => {
    // Intercept all link clicks
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (!link) return

      const href = link.getAttribute('href')

      // Only handle internal links
      if (!href || href.startsWith('http') || href.startsWith('mailto:')) {
        return
      }

      // Don't intercept hash links (anchor links on same page)
      if (href.startsWith('#')) {
        return
      }

      // Don't intercept hash links to the same page (e.g., /#work from /)
      // or cross-page hash links where we're already on that page
      const url = new URL(href, window.location.origin)
      const targetPath = normalizePathname(url.pathname)
      const hrefHash = url.hash.replace('#', '')
      const currentPath = normalizePathname(pathnameRef.current)
      const nextHref = `${url.pathname}${url.search}${url.hash}`

      if (targetPath === currentPath && hrefHash) {
        // Same page, just scroll to hash - don't transition
        return
      }

      // Don't intercept if it's the same page (no hash)
      if (targetPath === currentPath) {
        return
      }

      // Don't intercept if link has data-no-transition
      if (link.hasAttribute('data-no-transition')) {
        return
      }

      // Prevent default navigation
      e.preventDefault()

      // Start terminal transition with navigation callback
      // The TerminalTransition component will trigger navigation
      // when animation actually completes
      if (isTransitioningRef.current) {
        pendingNavigationRef.current = {
          targetPath,
          nextHref,
          hash: hrefHash,
        }
        return
      }

      startNavigation(targetPath, nextHref, hrefHash)
    }

    // Handle browser back/forward buttons
    const handlePopState = () => {
      // Get the current path after popstate
      const currentPath = normalizePathname(window.location.pathname)
      if (isTransitioningRef.current) return

      // Trigger terminal transition for back/forward navigation
      startTransitionRef.current(
        currentPath,
        () => {
        // Path already changed, just scroll to top
          window.scrollTo({ top: 0, behavior: 'instant' })
        },
        `${window.location.pathname}${window.location.search}${window.location.hash}`,
      )
    }

    document.addEventListener('click', handleClick, true)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  return {
    startTransition,
    completeTransition,
  }
}

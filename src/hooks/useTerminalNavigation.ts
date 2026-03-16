'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTransitionStore } from '@/store/transition-store'

/**
 * Hook to handle terminal-based navigation
 * Intercepts link clicks and triggers terminal transition
 */
export function useTerminalNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { startTransition, completeTransition } = useTransitionStore()

  useEffect(() => {
    // Intercept all link clicks
    const handleClick = (e: MouseEvent) => {
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
      const [hrefPath, hrefHash] = href.split('#')
      const targetPath = hrefPath || '/'

      if (targetPath === pathname && hrefHash) {
        // Same page, just scroll to hash - don't transition
        return
      }

      // Don't intercept if it's the same page (no hash)
      if (href === pathname) {
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
      startTransition(hrefPath || href, () => {
        router.push(href)
        // Scroll to hash or top after navigation
        setTimeout(() => {
          if (hrefHash) {
            const element = document.getElementById(hrefHash)
            if (element) {
              element.scrollIntoView({ behavior: 'instant' })
            }
          } else {
            window.scrollTo({ top: 0, behavior: 'instant' })
          }
        }, 100)
      })
    }

    // Handle browser back/forward buttons
    const handlePopState = () => {
      // Get the current path after popstate
      const currentPath = window.location.pathname

      // Trigger terminal transition for back/forward navigation
      startTransition(currentPath, () => {
        // Path already changed, just scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' })
      })
    }

    document.addEventListener('click', handleClick)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('click', handleClick)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [pathname, router, startTransition, completeTransition])

  return {
    startTransition,
    completeTransition,
  }
}

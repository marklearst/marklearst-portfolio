'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useRouteInput } from './useRouteInput'
import styles from './PageTransition.module.css'

/**
 * The incoming page stays live while it settles. Shared project titles own
 * their view transitions; taking a snapshot of the whole page would also
 * freeze its controls. Header and inspector stay outside both animations.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const previousPath = useRef(pathname)
  const page = useRef<HTMLDivElement>(null)
  useRouteInput(page)

  useLayoutEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    const node = page.current
    const root = document.documentElement
    if (!node || root.dataset.routeInput !== 'pointer') return

    // React captures shared titles during this commit. Give that handoff the
    // stage, keeping the new page still so its target geometry does not drift.
    // Older View Transition engines without the selector keep the still page.
    const sharedTransition = CSS.supports('selector(:active-view-transition)')
      ? root.matches(':active-view-transition')
      : 'startViewTransition' in document
    if (sharedTransition) return

    node.dataset.arriving = ''
    return () => { delete node.dataset.arriving }
  }, [pathname])

  return (
    <div id='page-content' className={styles.surface} data-route={pathname} tabIndex={-1}>
      <div
        key={pathname}
        ref={page}
        className={styles.page}
        onAnimationEnd={event => {
          if (event.target === event.currentTarget) delete event.currentTarget.dataset.arriving
        }}
      >
        {children}
      </div>
    </div>
  )
}

'use client'

import { ViewTransition } from 'react'
import { usePathname } from 'next/navigation'
import { useRouteInput } from './useRouteInput'
import styles from './PageTransition.module.css'

/**
 * Route content swaps through the View Transitions API (WHAM / Next pattern).
 * Header keeps its own view-transition-name and does not cross-fade.
 * useRouteInput tags pointer vs keyboard for route-aware motion.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  useRouteInput()
  const pathname = usePathname()

  return (
    <div id='page-content' className={styles.surface} tabIndex={-1}>
      <ViewTransition key={pathname} enter='page-enter' exit='page-exit' default='none'>
        {children}
      </ViewTransition>
    </div>
  )
}

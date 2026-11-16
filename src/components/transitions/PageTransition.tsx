'use client'

import { ViewTransition, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useRouteInput } from './useRouteInput'
import styles from './PageTransition.module.css'

/**
 * Hands one route over to the next. A navigation is a React transition, so
 * the leaving page exits and the arriving one enters as a view transition:
 * the old page fades where it stands and the new one settles in from the top.
 *
 * The motion lives in globals.css on the `page-exit` and `page-enter` classes.
 * It runs for pointer navigation only. Keyboard and history moves, and the
 * reduced motion context, swap the page at once.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  useRouteInput()

  return (
    <div id='page-content' className={styles.surface} data-route={pathname} tabIndex={-1}>
      <ViewTransition key={pathname} enter='page-enter' exit='page-exit' default='none'>
        <div>{children}</div>
      </ViewTransition>
    </div>
  )
}

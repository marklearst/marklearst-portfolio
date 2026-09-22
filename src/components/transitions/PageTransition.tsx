'use client'

import { useRouteInput } from './useRouteInput'
import styles from './PageTransition.module.css'

/**
 * Route changes do not animate the document. Motion stays on the control
 * that was pressed (nav pill, link press). useRouteInput still tags pointer
 * vs keyboard so committed indicators can spring only for pointer commits.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  useRouteInput()

  return (
    <div id='page-content' className={styles.surface} tabIndex={-1}>
      {children}
    </div>
  )
}

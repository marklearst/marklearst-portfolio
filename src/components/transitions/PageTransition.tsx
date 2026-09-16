'use client'

import { useLayoutEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useRouteInput } from './useRouteInput'
import styles from './PageTransition.module.css'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const surface = useRef<HTMLDivElement>(null)
  const previousPath = useRef(pathname)
  useRouteInput()

  useLayoutEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname

    const element = surface.current
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!element || typeof element.animate !== 'function' || preference.matches) return
    if (document.documentElement.getAttribute('data-route-input') !== 'pointer') return

    // Animate only the committed page. Keeping an outgoing document snapshot
    // breaks continuity when the two routes have different scroll positions.
    const animation = element.animate([{ opacity: 0.72 }, { opacity: 1 }], {
      duration: 180,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    })
    const stop = () => animation.cancel()
    preference.addEventListener('change', stop)
    return () => {
      stop()
      preference.removeEventListener('change', stop)
    }
  }, [pathname])

  return (
    <div ref={surface} id='page-content' className={styles.surface} data-route={pathname} tabIndex={-1}>
      {children}
    </div>
  )
}

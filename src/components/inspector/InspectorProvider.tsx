'use client'

import { createContext, use, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { InspectorController, type InspectorConfig, type InspectorState } from './inspector-controller'
import styles from './Inspector.module.css'

const InspectorContext = createContext<InspectorController | null>(null)

interface InspectorProviderProps extends InspectorConfig {
  children: ReactNode
}

/**
 * Owns the inspector for the whole site. It sits in the root layout, so
 * inspect mode and the floating dock carry across routes.
 */
export function InspectorProvider({ check, reveal, brand, themeColors, children }: InspectorProviderProps) {
  const [controller] = useState(() => new InspectorController({ check, reveal, brand, themeColors }))
  const overlay = useRef<HTMLDivElement>(null)
  const live = useRef<HTMLParagraphElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (!overlay.current || !live.current) return
    controller.attach({ overlay: overlay.current, live: live.current })
    return () => controller.destroy()
  }, [controller])

  useEffect(() => {
    controller.routeChanged(pathname)
  }, [controller, pathname])

  return (
    <InspectorContext value={controller}>
      {children}
      <div ref={overlay} className={styles.overlay} data-inspector-ui='' aria-hidden='true' />
      <p ref={live} className={styles.live} aria-live='polite' />
    </InspectorContext>
  )
}

export function useInspectorController(): InspectorController {
  const controller = use(InspectorContext)
  if (!controller) throw new Error('Inspector parts must render inside <InspectorProvider>.')
  return controller
}

/** Subscribes to one piece of inspector state. Select a value that keeps its identity while unchanged. */
export function useInspector<Selected>(select: (state: InspectorState) => Selected): Selected {
  const controller = useInspectorController()
  return useSyncExternalStore(
    controller.subscribe,
    () => select(controller.getState()),
    () => select(controller.getState()),
  )
}

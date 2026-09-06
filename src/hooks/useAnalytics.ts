/** React lifecycle and preference hooks for analytics. */

import type { RefObject } from 'react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react'
import { usePathname } from 'next/navigation'
import { trackSectionView, trackEngagementTime } from '@/lib/analytics'

const DEFAULT_ENGAGEMENT_THRESHOLDS = [10, 30, 60, 120]

type SectionTrackingData = {
  location?: string
  project?: string
}

export function useSectionViewTracking(options: {
  ref: RefObject<HTMLElement | null>
  section: string
  threshold?: number
  once?: boolean
  data?: SectionTrackingData
}) {
  const pathname = usePathname()
  const { ref, section, threshold = 0.35, once = true, data } = options
  const hasTrackedRef = useRef(false)
  const dataRef = useRef<SectionTrackingData | undefined>(data)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  useEffect(() => {
    hasTrackedRef.current = false
  }, [pathname, section])

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          if (once && hasTrackedRef.current) return

          hasTrackedRef.current = true
          trackSectionView({
            section,
            route: pathname,
            ...(dataRef.current ?? {}),
          })
        })
      },
      { threshold },
    )

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [ref, section, pathname, threshold, once])
}

export function useEngagementTracking(options?: { thresholds?: number[] }) {
  const pathname = usePathname()
  const thresholds = useMemo(
    () => options?.thresholds ?? DEFAULT_ENGAGEMENT_THRESHOLDS,
    [options?.thresholds],
  )

  useEffect(() => {
    const timeouts = thresholds.map((seconds) =>
      setTimeout(() => {
        trackEngagementTime({ route: pathname, seconds })
      }, seconds * 1000),
    )

    return () => {
      timeouts.forEach((timeoutId) => clearTimeout(timeoutId))
    }
  }, [pathname, thresholds])
}

const ANALYTICS_OPT_OUT_KEY = 'va-disable'
const ANALYTICS_OPT_OUT_EVENT = 'va-disable-change'

const getOptOutSnapshot = () => {
  if (typeof window === 'undefined') return false
  try {
    return Boolean(window.localStorage.getItem(ANALYTICS_OPT_OUT_KEY))
  } catch {
    return false
  }
}

const getOptOutServerSnapshot = () => false

const subscribeOptOut = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {}

  const handler = () => callback()
  window.addEventListener('storage', handler)
  window.addEventListener(ANALYTICS_OPT_OUT_EVENT, handler)

  return () => {
    window.removeEventListener('storage', handler)
    window.removeEventListener(ANALYTICS_OPT_OUT_EVENT, handler)
  }
}

export function useAnalyticsOptOut() {
  const isOptedOut = useSyncExternalStore(
    subscribeOptOut,
    getOptOutSnapshot,
    getOptOutServerSnapshot,
  )

  const setOptOut = useCallback((nextValue: boolean) => {
    if (typeof window === 'undefined') return
    try {
      if (nextValue) {
        window.localStorage.setItem(ANALYTICS_OPT_OUT_KEY, 'true')
      } else {
        window.localStorage.removeItem(ANALYTICS_OPT_OUT_KEY)
      }
    } catch {}

    window.dispatchEvent(new Event(ANALYTICS_OPT_OUT_EVENT))
  }, [])

  const toggleOptOut = useCallback(() => {
    setOptOut(!isOptedOut)
  }, [isOptedOut, setOptOut])

  return {
    isOptedOut,
    setOptOut,
    toggleOptOut,
  }
}

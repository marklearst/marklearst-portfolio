/**
 * React hook for analytics tracking
 * Provides all tracking functions in a React-friendly way
 * Wraps core functions from @/lib/analytics to prevent duplication
 */

import type { RefObject } from 'react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react'
import { usePathname } from 'next/navigation'
import * as Analytics from '@/lib/analytics'

export function useAnalytics() {
  const trackCaseStudyClick = useCallback(
    (data: Parameters<typeof Analytics.trackCaseStudyClick>[0]) =>
      Analytics.trackCaseStudyClick(data),
    [],
  )
  const trackExternalLinkClick = useCallback(
    (data: Parameters<typeof Analytics.trackExternalLinkClick>[0]) =>
      Analytics.trackExternalLinkClick(data),
    [],
  )
  const trackSocialLinkClick = useCallback(
    (data: Parameters<typeof Analytics.trackSocialLinkClick>[0]) =>
      Analytics.trackSocialLinkClick(data),
    [],
  )
  const trackCaseStudyLinkClick = useCallback(
    (data: Parameters<typeof Analytics.trackCaseStudyLinkClick>[0]) =>
      Analytics.trackCaseStudyLinkClick(data),
    [],
  )
  const trackTerminalTransition = useCallback(
    (data: Parameters<typeof Analytics.trackTerminalTransition>[0]) =>
      Analytics.trackTerminalTransition(data),
    [],
  )
  const trackKonamiCode = useCallback(() => Analytics.trackKonamiCode(), [])
  const trackHeroCTAClick = useCallback(
    (data: Parameters<typeof Analytics.trackHeroCTAClick>[0]) =>
      Analytics.trackHeroCTAClick(data),
    [],
  )
  const trackNavigationClick = useCallback(
    (data: Parameters<typeof Analytics.trackNavigationClick>[0]) =>
      Analytics.trackNavigationClick(data),
    [],
  )
  const trackProjectCardHover = useCallback(
    (data: Parameters<typeof Analytics.trackProjectCardHover>[0]) =>
      Analytics.trackProjectCardHover(data),
    [],
  )
  const trackProjectCardImpression = useCallback(
    (data: Parameters<typeof Analytics.trackProjectCardImpression>[0]) =>
      Analytics.trackProjectCardImpression(data),
    [],
  )
  const trackScrollMilestone = useCallback(
    (data: Parameters<typeof Analytics.trackScrollMilestone>[0]) =>
      Analytics.trackScrollMilestone(data),
    [],
  )
  const trackThemeToggle = useCallback(
    (data: Parameters<typeof Analytics.trackThemeToggle>[0]) =>
      Analytics.trackThemeToggle(data),
    [],
  )
  const trackLogoHover = useCallback(
    (data: Parameters<typeof Analytics.trackLogoHover>[0]) =>
      Analytics.trackLogoHover(data),
    [],
  )
  const trackHashNavigation = useCallback(
    (data: Parameters<typeof Analytics.trackHashNavigation>[0]) =>
      Analytics.trackHashNavigation(data),
    [],
  )
  const trackSectionView = useCallback(
    (data: Parameters<typeof Analytics.trackSectionView>[0]) =>
      Analytics.trackSectionView(data),
    [],
  )
  const trackCaseStudyView = useCallback(
    (data: Parameters<typeof Analytics.trackCaseStudyView>[0]) =>
      Analytics.trackCaseStudyView(data),
    [],
  )
  const trackCaseStudyLinkImpression = useCallback(
    (data: Parameters<typeof Analytics.trackCaseStudyLinkImpression>[0]) =>
      Analytics.trackCaseStudyLinkImpression(data),
    [],
  )
  const trackCaseStudyImpactView = useCallback(
    (data: Parameters<typeof Analytics.trackCaseStudyImpactView>[0]) =>
      Analytics.trackCaseStudyImpactView(data),
    [],
  )
  const trackCaseStudySectionDwell = useCallback(
    (data: Parameters<typeof Analytics.trackCaseStudySectionDwell>[0]) =>
      Analytics.trackCaseStudySectionDwell(data),
    [],
  )
  const trackCodeBlockView = useCallback(
    (data: Parameters<typeof Analytics.trackCodeBlockView>[0]) =>
      Analytics.trackCodeBlockView(data),
    [],
  )
  const trackCaseStudyReadCompletion = useCallback(
    (data: Parameters<typeof Analytics.trackCaseStudyReadCompletion>[0]) =>
      Analytics.trackCaseStudyReadCompletion(data),
    [],
  )
  const trackCaseStudySectionView = useCallback(
    (data: Parameters<typeof Analytics.trackCaseStudySectionView>[0]) =>
      Analytics.trackCaseStudySectionView(data),
    [],
  )
  const trackEngagementTime = useCallback(
    (data: Parameters<typeof Analytics.trackEngagementTime>[0]) =>
      Analytics.trackEngagementTime(data),
    [],
  )
  const trackThemePreference = useCallback(
    (data: Parameters<typeof Analytics.trackThemePreference>[0]) =>
      Analytics.trackThemePreference(data),
    [],
  )

  return {
    trackCaseStudyClick,
    trackExternalLinkClick,
    trackSocialLinkClick,
    trackCaseStudyLinkClick,
    trackTerminalTransition,
    trackKonamiCode,
    trackHeroCTAClick,
    trackNavigationClick,
    trackProjectCardHover,
    trackProjectCardImpression,
    trackScrollMilestone,
    trackThemeToggle,
    trackLogoHover,
    trackHashNavigation,
    trackSectionView,
    trackCaseStudyView,
    trackCaseStudyLinkImpression,
    trackCaseStudyImpactView,
    trackCaseStudySectionDwell,
    trackCaseStudySectionView,
    trackCodeBlockView,
    trackCaseStudyReadCompletion,
    trackEngagementTime,
    trackThemePreference,
    // Helper functions
    getPlatformFromUrl: Analytics.getPlatformFromUrl,
    getLinkTypeFromUrl: Analytics.getLinkTypeFromUrl,
    getDwellBucket: Analytics.getDwellBucket,
  }
}

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
          Analytics.trackSectionView({
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
        Analytics.trackEngagementTime({ route: pathname, seconds })
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

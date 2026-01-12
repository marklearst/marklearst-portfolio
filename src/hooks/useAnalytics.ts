/**
 * React hook for analytics tracking
 * Provides all tracking functions in a React-friendly way
 * Wraps core functions from @/lib/analytics to prevent duplication
 */

import { useCallback } from 'react'
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
    trackScrollMilestone,
    trackThemeToggle,
    trackLogoHover,
    trackHashNavigation,
    // Helper functions
    getPlatformFromUrl: Analytics.getPlatformFromUrl,
    getLinkTypeFromUrl: Analytics.getLinkTypeFromUrl,
  }
}

/**
 * Centralized analytics tracking utilities
 * Uses Vercel Analytics for custom event tracking
 */

import { track } from '@vercel/analytics/react'

const MAX_EVENT_VALUE_LENGTH = 255

const trimValue = (value: string) =>
  value.length > MAX_EVENT_VALUE_LENGTH
    ? value.slice(0, MAX_EVENT_VALUE_LENGTH)
    : value

/**
 * Track case study clicks from featured work section
 */
export function trackCaseStudyClick(data: {
  project: string
  category: string
  route: string
  source?: string
}) {
  track('Case Study Click', {
    project: trimValue(data.project),
    category: trimValue(data.category),
    route: trimValue(data.route),
    source: trimValue(data.source || 'featured_work'),
  })
}

/**
 * Track external link clicks
 */
export function trackExternalLinkClick(data: {
  platform: string
  href: string
  location: string
  project?: string
}) {
  track('External Link Click', {
    platform: trimValue(data.platform),
    href: trimValue(data.href),
    location: trimValue(data.location),
    ...(data.project && { project: trimValue(data.project) }),
  })
}

/**
 * Track social link clicks from footer
 */
export function trackSocialLinkClick(data: {
  platform: 'github' | 'linkedin' | 'email'
  href: string
}) {
  track('Social Link Click', {
    platform: trimValue(data.platform),
    href: trimValue(data.href),
    location: 'footer',
  })
}

/**
 * Track case study link clicks (GitHub, npm, Figma, live demos)
 */
export function trackCaseStudyLinkClick(data: {
  label: string
  href: string
  project: string
  linkType: 'github' | 'npm' | 'figma' | 'external' | 'other'
}) {
  track('Case Study Link Click', {
    label: trimValue(data.label),
    href: trimValue(data.href),
    project: trimValue(data.project),
    linkType: trimValue(data.linkType),
  })
}

/**
 * Track terminal transition events
 */
export function trackTerminalTransition(data: {
  phase: 'start' | 'complete' | 'navigate'
  route: string
  transitionKey?: number
}) {
  track('Terminal Transition', {
    phase: data.phase,
    route: trimValue(data.route),
    ...(data.transitionKey !== undefined && {
      transitionKey: data.transitionKey,
    }),
  })
}

/**
 * Track Konami code activation
 */
export function trackKonamiCode() {
  track('Konami Code Activated', {
    timestamp: Date.now(),
  })
}

/**
 * Track hero CTA clicks
 */
export function trackHeroCTAClick(data: { action: string; location: string }) {
  track('Hero CTA Click', {
    action: trimValue(data.action),
    location: trimValue(data.location),
  })
}

/**
 * Track navigation clicks (back buttons, logo, etc.)
 */
export function trackNavigationClick(data: {
  action: string
  from?: string
  to?: string
  location?: string
}) {
  track('Navigation Click', {
    action: trimValue(data.action),
    ...(data.from && { from: trimValue(data.from) }),
    ...(data.to && { to: trimValue(data.to) }),
    ...(data.location && { location: trimValue(data.location) }),
  })
}

/**
 * Track project card hover (engagement metric)
 */
export function trackProjectCardHover(data: {
  project: string
  index: number
  location?: string
}) {
  track('Project Card Hover', {
    project: trimValue(data.project),
    index: data.index,
    location: trimValue(data.location || 'featured_work'),
  })
}

/**
 * Track when a project card is seen in the viewport
 */
export function trackProjectCardImpression(data: {
  project: string
  index: number
  location?: string
}) {
  track('Project Card Impression', {
    project: trimValue(data.project),
    index: data.index,
    location: trimValue(data.location || 'featured_work'),
  })
}

/**
 * Track scroll milestones
 */
export function trackScrollMilestone(data: {
  percent: number
  route: string
}) {
  track('Scroll Milestone', {
    percent: data.percent,
    route: trimValue(data.route),
  })
}

/**
 * Track theme toggle
 */
export function trackThemeToggle(data: {
  from: 'dark' | 'light'
  to: 'dark' | 'light'
}) {
  track('Theme Toggle', {
    from: data.from,
    to: data.to,
  })
}

/**
 * Track logo hover (engagement with interactive element)
 */
export function trackLogoHover(data: { action: 'expand' | 'collapse' }) {
  track('Logo Hover', {
    action: trimValue(data.action),
  })
}

/**
 * Track hash-based navigation
 */
export function trackHashNavigation(data: { hash: string; source: string }) {
  track('Hash Navigation', {
    hash: trimValue(data.hash),
    source: trimValue(data.source),
  })
}

/**
 * Track when a section is viewed
 */
export function trackSectionView(data: {
  section: string
  route: string
  location?: string
  project?: string
}) {
  track('Section View', {
    section: trimValue(data.section),
    route: trimValue(data.route),
    ...(data.location && { location: trimValue(data.location) }),
    ...(data.project && { project: trimValue(data.project) }),
  })
}

/**
 * Track case study link impressions
 */
export function trackCaseStudyLinkImpression(data: {
  label: string
  href: string
  project: string
  linkType: 'github' | 'npm' | 'figma' | 'external' | 'other'
}) {
  track('Case Study Link Impression', {
    label: trimValue(data.label),
    href: trimValue(data.href),
    project: trimValue(data.project),
    linkType: trimValue(data.linkType),
  })
}

/**
 * Track case study impact metric views
 */
export function trackCaseStudyImpactView(data: {
  project: string
  metric: string
  index: number
}) {
  track('Case Study Impact View', {
    project: trimValue(data.project),
    metric: trimValue(data.metric),
    index: data.index,
  })
}

/**
 * Track case study section dwell time buckets
 */
export function trackCaseStudySectionDwell(data: {
  project: string
  section: string
  index: number
  dwellBucket: string
}) {
  track('Case Study Section Dwell', {
    project: trimValue(data.project),
    section: trimValue(data.section),
    index: data.index,
    dwellBucket: trimValue(data.dwellBucket),
  })
}

/**
 * Track code block impressions
 */
export function trackCodeBlockView(data: {
  route: string
  project?: string
  label?: string
  language?: string
}) {
  track('Code Block View', {
    route: trimValue(data.route),
    ...(data.project && { project: trimValue(data.project) }),
    ...(data.label && { label: trimValue(data.label) }),
    ...(data.language && { language: trimValue(data.language) }),
  })
}

/**
 * Track when a case study read is completed
 */
export function trackCaseStudyReadCompletion(data: {
  project: string
  route: string
  method?: string
}) {
  track('Case Study Read Completion', {
    project: trimValue(data.project),
    route: trimValue(data.route),
    method: trimValue(data.method || 'scroll_100'),
  })
}

/**
 * Track when a case study page is viewed
 */
export function trackCaseStudyView(data: {
  project: string
  category: string
  route: string
}) {
  track('Case Study View', {
    project: trimValue(data.project),
    category: trimValue(data.category),
    route: trimValue(data.route),
  })
}

/**
 * Track when a case study section is viewed
 */
export function trackCaseStudySectionView(data: {
  project: string
  section: string
  index: number
}) {
  track('Case Study Section View', {
    project: trimValue(data.project),
    section: trimValue(data.section),
    index: data.index,
  })
}

/**
 * Bucket section dwell time for analytics
 */
export function getDwellBucket(seconds: number) {
  if (seconds < 3) return 'lt-3s'
  if (seconds < 8) return '3-8s'
  if (seconds < 15) return '8-15s'
  if (seconds < 30) return '15-30s'
  return '30s+'
}

/**
 * Track engagement milestones
 */
export function trackEngagementTime(data: { route: string; seconds: number }) {
  track('Engagement Time', {
    route: trimValue(data.route),
    seconds: data.seconds,
  })
}

/**
 * Track theme preference (initial load)
 */
export function trackThemePreference(data: {
  theme: 'dark' | 'light'
  source: 'stored' | 'default'
}) {
  track('Theme Preference', {
    theme: data.theme,
    source: data.source,
  })
}

/**
 * Helper to extract platform from URL
 */
export function getPlatformFromUrl(url: string): string {
  if (url.includes('github.com')) return 'github'
  if (url.includes('linkedin.com')) return 'linkedin'
  if (url.includes('npmjs.com')) return 'npm'
  if (url.includes('figma.com')) return 'figma'
  if (url.startsWith('mailto:')) return 'email'
  return 'external'
}

/**
 * Helper to determine link type from URL
 */
export function getLinkTypeFromUrl(
  url: string,
): 'github' | 'npm' | 'figma' | 'external' | 'other' {
  if (url.includes('github.com')) return 'github'
  if (url.includes('npmjs.com')) return 'npm'
  if (url.includes('figma.com')) return 'figma'
  if (url.startsWith('http')) return 'external'
  return 'other'
}

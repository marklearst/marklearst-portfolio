/**
 * Centralized analytics tracking utilities
 * Uses Vercel Analytics for custom event tracking
 */

import { track } from '@vercel/analytics/react'

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
    project: data.project,
    category: data.category,
    route: data.route,
    source: data.source || 'featured_work',
  })
}

/**
 * Track external link clicks
 */
export function trackExternalLinkClick(data: {
  platform: string
  url: string
  location: string
  project?: string
}) {
  track('External Link Click', {
    platform: data.platform,
    url: data.url.length > 255 ? data.url.substring(0, 255) : data.url,
    location: data.location,
    ...(data.project && { project: data.project }),
  })
}

/**
 * Track social link clicks from footer
 */
export function trackSocialLinkClick(data: {
  platform: 'github' | 'linkedin' | 'email'
  url: string
}) {
  track('Social Link Click', {
    platform: data.platform,
    url: data.url.length > 255 ? data.url.substring(0, 255) : data.url,
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
    label: data.label,
    href: data.href.length > 255 ? data.href.substring(0, 255) : data.href,
    project: data.project,
    linkType: data.linkType,
  })
}

/**
 * Track terminal transition events
 */
export function trackTerminalTransition(data: {
  event: 'start' | 'complete' | 'navigate'
  route: string
  transitionKey?: number
}) {
  track('Terminal Transition', {
    event: data.event,
    route: data.route,
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
    timestamp: Date.now().toString(),
  })
}

/**
 * Track hero CTA clicks
 */
export function trackHeroCTAClick(data: { action: string; location: string }) {
  track('Hero CTA Click', {
    action: data.action,
    location: data.location,
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
    action: data.action,
    ...(data.from && { from: data.from }),
    ...(data.to && { to: data.to }),
    ...(data.location && { location: data.location }),
  })
}

/**
 * Track project card hover (engagement metric)
 */
export function trackProjectCardHover(data: {
  project: string
  index: number
}) {
  track('Project Card Hover', {
    project: data.project,
    index: data.index.toString(),
  })
}

/**
 * Track scroll milestones
 */
export function trackScrollMilestone(data: { percent: number; page: string }) {
  track('Scroll Milestone', {
    percent: data.percent.toString(),
    page: data.page,
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
    action: data.action,
  })
}

/**
 * Track hash-based navigation
 */
export function trackHashNavigation(data: { hash: string; source: string }) {
  track('Hash Navigation', {
    hash: data.hash,
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

'use client'

import Link from 'next/link'
import type { ComponentPropsWithRef } from 'react'
import {
  trackCaseStudyClick,
  trackCaseStudyLinkClick,
  getLinkTypeFromUrl,
  trackExternalLinkClick,
  trackHeroCTAClick,
  trackNavigationClick,
  trackSocialLinkClick,
} from '@/lib/analytics'

type LinkEvent =
  | { type: 'case-study'; data: Parameters<typeof trackCaseStudyClick>[0] }
  | { type: 'case-study-link'; data: Omit<Parameters<typeof trackCaseStudyLinkClick>[0], 'linkType'> }
  | { type: 'external'; data: Parameters<typeof trackExternalLinkClick>[0] }
  | { type: 'hero'; data: Parameters<typeof trackHeroCTAClick>[0] }
  | { type: 'navigation'; data: Parameters<typeof trackNavigationClick>[0] }
  | { type: 'social'; data: Parameters<typeof trackSocialLinkClick>[0] }

type TrackedLinkProps = ComponentPropsWithRef<typeof Link> & {
  event: LinkEvent
}

function trackLinkEvent(event: LinkEvent) {
  switch (event.type) {
    case 'case-study': trackCaseStudyClick(event.data); break
    case 'case-study-link': trackCaseStudyLinkClick({ ...event.data, linkType: getLinkTypeFromUrl(event.data.href) }); break
    case 'external': trackExternalLinkClick(event.data); break
    case 'hero': trackHeroCTAClick(event.data); break
    case 'navigation': trackNavigationClick(event.data); break
    case 'social': trackSocialLinkClick(event.data); break
  }
}

/** A small client boundary; its label and surrounding content stay server-rendered. */
export default function TrackedLink({ event, onClick, ...props }: TrackedLinkProps) {
  return <Link {...props} onClick={clickEvent => {
    onClick?.(clickEvent)
    if (!clickEvent.defaultPrevented) trackLinkEvent(event)
  }} />
}

type TrackedFragmentLinkProps = Omit<TrackedLinkProps, 'href' | 'onNavigate' | 'scroll'> & { href: `#${string}` }

/** Focus and reveal the destination while Next keeps fragment history tied to its route. */
export function TrackedFragmentLink({ href, ...props }: TrackedFragmentLinkProps) {
  return <TrackedLink {...props} href={href} scroll={false} onNavigate={() => {
    const target = document.getElementById(href.slice(1))
    target?.focus({ preventScroll: true })
    target?.scrollIntoView({ block: 'start' })
  }} />
}

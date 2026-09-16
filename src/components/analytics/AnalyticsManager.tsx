'use client'

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next'
import { useEngagementTracking } from '@/hooks/useAnalytics'

const ENGAGEMENT_THRESHOLDS = [10, 30, 60, 120]

const redactUrlParams = (rawUrl: string) => {
  try {
    const base =
      typeof window === 'undefined' ?
        'https://example.com'
      : window.location.origin
    const url = new URL(rawUrl, base)
    const sensitiveParams = [
      'token',
      'auth',
      'session',
      'secret',
      'code',
      'key',
      'email',
    ]
    sensitiveParams.forEach((param) => url.searchParams.delete(param))
    return url.toString()
  } catch {
    return rawUrl
  }
}

// Storage access throws when a browser blocks it. Treat that as not opted out
// rather than letting the throw escape the analytics callback.
function isOptedOut() {
  if (typeof window === 'undefined') return false
  try {
    return Boolean(window.localStorage.getItem('va-disable'))
  } catch {
    return false
  }
}

export default function AnalyticsManager() {
  useEngagementTracking({ thresholds: ENGAGEMENT_THRESHOLDS })
  return (
    <Analytics
      beforeSend={(event: BeforeSendEvent) => {
        if (isOptedOut()) return null

        const sanitizedUrl = redactUrlParams(event.url)
        if (sanitizedUrl !== event.url) {
          return { ...event, url: sanitizedUrl }
        }

        return event
      }}
    />
  )
}

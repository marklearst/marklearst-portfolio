'use client'

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next'
import { useEngagementTracking } from '@/hooks/useAnalytics'

const ENGAGEMENT_THRESHOLDS = [10, 30, 60, 120]

const redactUrlParams = (rawUrl: string) => {
  try {
    const base =
      typeof window === 'undefined'
        ? 'https://example.com'
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

export default function AnalyticsManager() {
  useEngagementTracking({ thresholds: ENGAGEMENT_THRESHOLDS })
  return (
    <Analytics
      beforeSend={(event: BeforeSendEvent) => {
        if (
          typeof window !== 'undefined' &&
          localStorage.getItem('va-disable')
        ) {
          return null
        }

        const sanitizedUrl = redactUrlParams(event.url)
        if (sanitizedUrl !== event.url) {
          return { ...event, url: sanitizedUrl }
        }

        return event
      }}
    />
  )
}

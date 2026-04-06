'use client'

import { useEngagementTracking } from '@/hooks/useAnalytics'

const ENGAGEMENT_THRESHOLDS = [10, 30, 60, 120]

export default function AnalyticsManager() {
  useEngagementTracking({ thresholds: ENGAGEMENT_THRESHOLDS })
  return null
}

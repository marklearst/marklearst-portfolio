'use client'

import { CircleCheckIcon, CircleXIcon } from '@/components/ui/Icon'
import { useAnalyticsOptOut } from '@/hooks/useAnalytics'

export default function AnalyticsOptOutToggle() {
  const { isOptedOut, toggleOptOut } = useAnalyticsOptOut()
  const statusLabel = isOptedOut ? 'analytics off' : 'analytics on'
  const StatusIcon = isOptedOut ? CircleXIcon : CircleCheckIcon
  const hint = 'Anonymous, no cookies. Toggle any time.'

  return (
    <button
      type='button'
      onClick={toggleOptOut}
      aria-pressed={!isOptedOut}
      title={hint}
      className='inline-flex min-h-11 touch-manipulation items-center gap-1.5 rounded-md border border-[var(--color-border-subtle)] bg-transparent px-3 py-1 font-body text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink-primary)]'
    >
      <StatusIcon
        size={12}
        className='shrink-0'
        aria-hidden
      />
      <span>{statusLabel}</span>
    </button>
  )
}

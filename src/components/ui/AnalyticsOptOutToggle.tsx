'use client'

import { MONOKAI } from '@/lib/monokai-colors'
import { useAnalyticsOptOut } from '@/hooks/useAnalytics'

export default function AnalyticsOptOutToggle() {
  const { isOptedOut, toggleOptOut } = useAnalyticsOptOut()
  const statusLabel = isOptedOut ? 'analytics off' : 'analytics on'
  const statusColor = isOptedOut ? MONOKAI.pink : MONOKAI.green
  const hint = 'Anonymous, no cookies. Toggle any time.'

  return (
    <button
      type='button'
      onClick={toggleOptOut}
      aria-pressed={!isOptedOut}
      aria-label={
        isOptedOut ? 'Enable anonymous analytics' : 'Disable analytics'
      }
      title={hint}
      className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-white/50 transition hover:border-white/30 hover:text-white/80'
    >
      <span
        className={`inline-flex h-2 w-2 rounded-full ${
          isOptedOut ? 'bg-monokai-pink' : 'bg-monokai-green'
        }`}
        style={{
          boxShadow: `0 0 10px ${statusColor}66`,
        }}
      />
      <span>{statusLabel}</span>
    </button>
  )
}

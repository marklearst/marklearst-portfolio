'use client'

import { CheckCircle, XCircle } from '@phosphor-icons/react'
import { MONOKAI } from '@/lib/monokai-colors'
import { useAnalyticsOptOut } from '@/hooks/useAnalytics'

export default function AnalyticsOptOutToggle() {
  const { isOptedOut, toggleOptOut } = useAnalyticsOptOut()
  const statusLabel = isOptedOut ? 'analytics off' : 'analytics on'
  const StatusIcon = isOptedOut ? XCircle : CheckCircle
  const statusColor = isOptedOut ? MONOKAI.terminal.error : MONOKAI.green
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
      /* before: extends the 22px row to a 46px hit area vertically only —
         growing sideways would collide with the adjacent privacy link. */
      className='relative inline-flex touch-manipulation items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/50 transition-colors before:absolute before:inset-x-0 before:-inset-y-3 hover:border-white/30 hover:text-white/80'
    >
      <StatusIcon
        size={12}
        weight='bold'
        color={statusColor}
        className='shrink-0'
        aria-hidden
      />
      <span>{statusLabel}</span>
    </button>
  )
}

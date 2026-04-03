'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { MONOKAI } from '@/lib/monokai-colors'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function ScrollProgress() {
  const { trackScrollMilestone } = useAnalytics()
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const trackedMilestones = useRef<Set<number>>(new Set())

  useEffect(() => {
    // Reset tracked milestones when page changes
    trackedMilestones.current.clear()
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(scrollPercent)

      // Track milestones (25%, 50%, 75%, 100%)
      const milestones = [25, 50, 75, 100]
      milestones.forEach((milestone) => {
        if (
          scrollPercent >= milestone &&
          !trackedMilestones.current.has(milestone)
        ) {
          trackedMilestones.current.add(milestone)
          trackScrollMilestone({
            percent: milestone,
            page: pathname,
          })
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  return (
    <div
      className='opacity-0 fixed top-0 left-0 h-[2px] z-60 transition-all duration-100'
      style={{
        width: `${progress}%`,
        height: 4,
        background: `linear-gradient(90deg, ${MONOKAI.cyan}, ${MONOKAI.purple}, ${MONOKAI.pink})`,
        boxShadow: `0 0 10px ${MONOKAI.cyan}60`,
      }}
    />
  )
}

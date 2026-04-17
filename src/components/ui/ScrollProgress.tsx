'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { MONOKAI } from '@/lib/monokai-colors'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function ScrollProgress() {
  const { trackScrollMilestone, trackCaseStudyReadCompletion } = useAnalytics()
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const trackedMilestones = useRef<Set<number>>(new Set())
  const caseStudyReadTrackedRef = useRef(false)

  useEffect(() => {
    // Reset tracked milestones when page changes
    trackedMilestones.current.clear()
    caseStudyReadTrackedRef.current = false
  }, [pathname, trackScrollMilestone])

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
            route: pathname,
          })

          if (
            milestone === 100 &&
            !caseStudyReadTrackedRef.current &&
            pathname.startsWith('/work/')
          ) {
            const project = pathname.split('/').pop() || 'unknown'
            caseStudyReadTrackedRef.current = true
            trackCaseStudyReadCompletion({
              project,
              route: pathname,
            })
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname, trackScrollMilestone, trackCaseStudyReadCompletion])

  return (
    <div
      className='fixed top-0 left-0 right-0 h-1 z-60'
      style={{
        background: `linear-gradient(90deg, ${MONOKAI.cyan}, ${MONOKAI.purple}, ${MONOKAI.pink})`,
        boxShadow: `0 0 10px ${MONOKAI.cyan}60`,
        transform: `scaleX(${progress / 100})`,
        transformOrigin: 'left',
        willChange: 'transform',
      }}
    />
  )
}

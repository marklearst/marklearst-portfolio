'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackSectionView } from '@/lib/analytics'

interface SectionViewTrackerProps {
  targetId: string
  section: string
  location: string
}

export default function SectionViewTracker({ targetId, section, location }: SectionViewTrackerProps) {
  const pathname = usePathname()

  useEffect(() => {
    const target = document.getElementById(targetId)
    if (!target || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      trackSectionView({ section, route: pathname, location })
      observer.disconnect()
    }, { threshold: 0.35 })

    observer.observe(target)
    return () => observer.disconnect()
  }, [targetId, section, location, pathname])

  return null
}

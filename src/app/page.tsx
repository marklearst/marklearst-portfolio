'use client'

import { useEffect } from 'react'
import EnhancedHero from '@/components/EnhancedHero'
import FeaturedWork from '@/components/FeaturedWork'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function Home() {
  const { trackHashNavigation } = useAnalytics()

  useEffect(() => {
    // Only handle hash-based navigation, let browser restore scroll position otherwise
    const hash = window.location.hash.slice(1)
    if (hash) {
      trackHashNavigation({
        hash,
        source: window.location.hash ? 'direct_link' : 'scroll',
      })
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'instant' })
        }
      }, 100)
    }
    // Browser will automatically restore scroll position on refresh
  }, [trackHashNavigation])

  // Smart hash clearing - remove hash when user scrolls away from target section
  useEffect(() => {
    if (typeof window === 'undefined') return

    let scrollTimeout: NodeJS.Timeout
    let hasCleared = false

    const clearHashOnScroll = () => {
      clearTimeout(scrollTimeout)

      scrollTimeout = setTimeout(() => {
        const hash = window.location.hash
        if (!hash || hasCleared) return

        const target = document.querySelector(hash)
        if (!target) return

        const rect = target.getBoundingClientRect()
        const distance = Math.abs(rect.top)

        // User scrolled 150px+ away from target section
        if (distance > 150) {
          hasCleared = true
          window.history.replaceState(null, '', window.location.pathname)
        }
      }, 100)
    }

    // Activate after initial scroll-to-hash completes (800ms grace period)
    const activationTimer = setTimeout(() => {
      window.addEventListener('scroll', clearHashOnScroll, { passive: true })
    }, 800)

    return () => {
      clearTimeout(activationTimer)
      clearTimeout(scrollTimeout)
      window.removeEventListener('scroll', clearHashOnScroll)
    }
  }, [])

  return (
    <main className='relative'>
      <EnhancedHero />
      <FeaturedWork />
      <Testimonials />
      <Footer />
    </main>
  )
}

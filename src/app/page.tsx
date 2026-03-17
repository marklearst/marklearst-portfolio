'use client'

import { useEffect } from 'react'
import EnhancedHero from '@/components/EnhancedHero'
import FeaturedWork from '@/components/FeaturedWork'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'

export default function Home() {
  useEffect(() => {
    // Prevent scroll restoration jump on refresh
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // If there's a hash in the URL, scroll to it; otherwise scroll to top
    const hash = window.location.hash.slice(1)
    if (hash) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'instant' })
        }
      }, 100)
    } else {
      window.scrollTo(0, 0)
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

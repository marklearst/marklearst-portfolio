'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Save scroll position before page unload
    const saveScrollPosition = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString())
    }

    // Initialize Lenis with premium smooth scroll settings
    const lenis = new Lenis({
      lerp: 0.08, // Lower = smoother, more inertia
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      autoResize: true,
    })

    lenisRef.current = lenis

    // Restore scroll position after Lenis initializes
    const savedPosition = sessionStorage.getItem('scrollPosition')
    if (savedPosition && !window.location.hash) {
      // Small delay to ensure Lenis is ready
      requestAnimationFrame(() => {
        lenis.scrollTo(parseInt(savedPosition, 10), { immediate: true })
        sessionStorage.removeItem('scrollPosition')
      })
    }

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // Add Lenis to GSAP's ticker
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    // Disable GSAP's default lag smoothing
    gsap.ticker.lagSmoothing(0)

    // Save scroll position before page unload
    window.addEventListener('beforeunload', saveScrollPosition)

    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition)
      lenis.destroy()
      gsap.ticker.remove(lenis.raf)
    }
  }, [])

  return <>{children}</>
}

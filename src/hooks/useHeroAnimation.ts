'use client'

import { useEffect, type RefObject } from 'react'
import { gsap } from 'gsap'

export function useHeroAnimation(
  heroRef: RefObject<HTMLElement | null>,
  nameBoxRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fast overlapping sequence - no slow junior animations
      const tl = gsap.timeline({ delay: 0.3 })

      // Name box entrance - starts immediately with timeline
      tl.fromTo(
        nameBoxRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
      )

      // Content reveals with tight overlap
      tl.fromTo(
        '.hero-description',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3', // Overlap by 0.3s
      )

      tl.fromTo(
        '.hero-bio',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3',
      )

      tl.fromTo(
        '.hero-ctas',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3',
      )

      // Badges with stagger - smooth, elegant fade in
      tl.fromTo(
        '.hero-badge',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
        },
        '-=0.2',
      )

      // No cursor repel - just let keywords float peacefully
    }, heroRef)

    return () => ctx.revert()
  }, [heroRef, nameBoxRef])
}

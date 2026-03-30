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

      // Neural background fades in with 1s extra delay (runs independently)
      gsap.to('.neural-bg', {
        opacity: 1,
        duration: 2,
        delay: 1.5, // 0.3s timeline delay + 1s extra
        ease: 'power3.out',
      })

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

      // Background keywords - FLOATING IN NEURAL SPACE (slower for smooth line following)
      const keywordElements = gsap.utils.toArray<HTMLElement>('.bg-keyword')

      keywordElements.forEach((el) => {
        // Gentle floating motion - slower so lines can follow smoothly
        const driftX = gsap.utils.random(15, 30)
        const driftY = gsap.utils.random(10, 25)
        const durationX = gsap.utils.random(12, 18) // Slower for smooth line movement
        const durationY = gsap.utils.random(14, 20)

        // Horizontal drift
        gsap.to(el, {
          x: `+=${driftX}`,
          duration: durationX,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: Math.random() * 3,
        })

        // Vertical drift
        gsap.to(el, {
          y: `+=${driftY}`,
          duration: durationY,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: Math.random() * 3,
        })

        // Very subtle rotation
        gsap.to(el, {
          rotation: gsap.utils.random(-3, 3),
          duration: gsap.utils.random(16, 24),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })

      // No cursor repel - just let keywords float peacefully
    }, heroRef)

    return () => ctx.revert()
  }, [heroRef, nameBoxRef])
}

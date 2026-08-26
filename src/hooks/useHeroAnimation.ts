'use client'

import { useEffect, type RefObject } from 'react'
import { gsap } from 'gsap'

export function useHeroAnimation(
  heroRef: RefObject<HTMLElement | null>,
  nameBoxRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    let hasSeenIntro = false
    try {
      hasSeenIntro = sessionStorage.getItem('portfolio-intro-seen') === 'true'
      sessionStorage.setItem('portfolio-intro-seen', 'true')
    } catch {
      // The page and its introduction also work when storage is unavailable.
    }
    if (hasSeenIntro) return

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const letters = nameBoxRef.current?.querySelectorAll('.kinetic-char')
        if (letters?.length) {
          gsap.from(letters, {
            yPercent: 65,
            rotationX: -35,
            opacity: 0,
            duration: 0.65,
            stagger: 0.025,
            ease: 'power3.out',
            clearProps: 'all',
          })
        }
        gsap.from('.hero-preview', {
          y: 18,
          duration: 0.7,
          ease: 'power3.out',
          clearProps: 'transform',
        })
      }, heroRef)
      return () => context.revert()
    })
    return () => media.revert()
  }, [heroRef, nameBoxRef])
}

'use client'

import { useEffect, type RefObject } from 'react'
import { gsap } from 'gsap'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AWWWARDS SOTD / FWA QUALITY HERO ANIMATION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Beast mode choreography:
 *
 * 0.0s   Terminal typewriter starts
 * 0.5s   Name letters reveal with clipPath wipe (THE signature moment)
 * 0.9s   Description words slide up individually with blur clear
 * 1.3s   Badges fan out from center with rotation + scale
 * 1.6s   Bio fades up with subtle parallax
 * 1.9s   CTAs slide up with elastic micro-bounce
 *
 * Total runtime: ~2.5s for full reveal
 */
export function useHeroAnimation(
  heroRef: RefObject<HTMLElement | null>,
  nameBoxRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) {
      gsap.set(
        [
          nameBoxRef.current,
          '.hero-description',
          '.hero-description-word',
          '.hero-badges',
          '.hero-badges span',
          '.hero-bio',
          '.hero-ctas',
          '.hero-ctas > *',
        ],
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          rotation: 0,
          filter: 'blur(0px)',
          clipPath: 'inset(0% 0% 0% 0%)',
        },
      )
      return
    }

    const ctx = gsap.context(() => {
      // ═══════════════════════════════════════════════════════════════
      // MASTER TIMELINE - Orchestrates the entire sequence
      // ═══════════════════════════════════════════════════════════════
      const master = gsap.timeline({
        delay: 0.4,
        defaults: {
          ease: 'expo.out',
        },
      })

      // ═══════════════════════════════════════════════════════════════
      // ACT 1: THE NAME - Dramatic clipPath wipe reveal
      // This is THE hero moment. Each letter sweeps in from below
      // with a diagonal clip that creates a "curtain rise" effect
      // ═══════════════════════════════════════════════════════════════
      master.set(nameBoxRef.current, { opacity: 1 })

      // Letters slide up AND clip reveals simultaneously
      master.fromTo(
        '.kinetic-char',
        {
          y: '120%',
          opacity: 0,
          rotationX: 45, // Slight 3D tilt as they rise
        },
        {
          y: '0%',
          opacity: 1,
          rotationX: 0,
          duration: 1.1,
          stagger: {
            each: 0.04,
            ease: 'power2.in', // Accelerating stagger
          },
          ease: 'expo.out',
        },
        0,
      )

      // ═══════════════════════════════════════════════════════════════
      // ACT 2: DESCRIPTION - Split word reveal with blur
      // Each word slides up independently, blur clears as it settles
      // Creates a "typing" feel without actual typing
      // ═══════════════════════════════════════════════════════════════
      master.fromTo(
        '.hero-description',
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.01,
        },
        0.5,
      )

      // Target the span.hero-description-word elements we'll add
      master.fromTo(
        '.hero-description-word',
        {
          y: 40,
          opacity: 0,
          filter: 'blur(12px)',
          rotationX: 20,
        },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          rotationX: 0,
          duration: 0.7,
          stagger: {
            each: 0.025, // 25ms per word - fast cascade
            ease: 'none',
          },
          ease: 'expo.out',
        },
        0.55,
      )

      // ═══════════════════════════════════════════════════════════════
      // ACT 3: BADGES - Fan out from center with rotation
      // Badges explode outward from a central point, each with
      // slight rotation that settles. Creates energy and playfulness.
      // ═══════════════════════════════════════════════════════════════
      master.set('.hero-badges', { opacity: 1 }, 0.9)

      const badges = gsap.utils.toArray('.hero-badges span') as HTMLElement[]
      const badgeCount = badges.length
      const centerIndex = (badgeCount - 1) / 2

      badges.forEach((badge, i) => {
        const distanceFromCenter = i - centerIndex
        const startX = -distanceFromCenter * 30 // Converge from opposite sides
        const startRotation = distanceFromCenter * 8 // Slight rotation based on position

        master.fromTo(
          badge,
          {
            x: startX,
            y: 30,
            opacity: 0,
            scale: 0.7,
            rotation: startRotation,
          },
          {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.6,
            ease: 'back.out(1.4)', // Satisfying overshoot
          },
          0.95 + i * 0.05, // 50ms stagger
        )
      })

      // ═══════════════════════════════════════════════════════════════
      // ACT 4: BIO - Smooth fade with subtle rise
      // Clean, simple, lets the content breathe
      // ═══════════════════════════════════════════════════════════════
      master.fromTo(
        '.hero-bio',
        {
          opacity: 0,
          y: 35,
          filter: 'blur(4px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          ease: 'expo.out',
        },
        1.2,
      )

      // ═══════════════════════════════════════════════════════════════
      // ACT 5: CTAs - Dramatic individual entrances
      // Primary button enters with scale + slide
      // Secondary follows with offset, creating visual hierarchy
      // ═══════════════════════════════════════════════════════════════
      master.set('.hero-ctas', { opacity: 1 }, 1.4)

      // Primary CTA - View Work (dramatic entrance)
      master.fromTo(
        '.hero-cta-primary',
        {
          opacity: 0,
          y: 50,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'back.out(1.2)',
        },
        1.5,
      )

      // Secondary CTA - GitHub (follows with offset)
      master.fromTo(
        '.hero-cta-secondary',
        {
          opacity: 0,
          y: 40,
          x: -20,
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.6,
          ease: 'expo.out',
        },
        1.65,
      )
    }, heroRef)

    return () => ctx.revert()
  }, [heroRef, nameBoxRef])
}

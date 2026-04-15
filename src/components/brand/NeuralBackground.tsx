'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import { gsap } from 'gsap'
import { HERO_KEYWORDS } from '@/data/hero-keywords'
import { MONOKAI } from '@/lib/monokai-colors'
import NeuralNetwork from '@/components/ui/NeuralNetwork'
import { useEffectsStore } from '@/stores/cursor-orbs-store'

// Hydration-safe client detection
const subscribeNoop = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export default function NeuralBackground() {
  const neuralTextVisible = useEffectsStore((state) => state.neuralTextVisible)
  const containerRef = useRef<HTMLDivElement>(null)

  const isClient = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  )

  useEffect(() => {
    if (!isClient) return

    const ctx = gsap.context(() => {
      // Background keywords - FLOATING IN NEURAL SPACE
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
    }, containerRef)

    return () => ctx.revert()
  }, [isClient])

  return (
    <div
      ref={containerRef}
      className='fixed inset-0 z-0 overflow-hidden pointer-events-none'
      style={{ backgroundColor: '#ffffff10' }}
    >
      {/* Neural background wrapper - fades in */}
      <div className='neural-bg absolute inset-0' style={{ opacity: 1 }}>
        {/* Dynamic neural network - lines connect to text centers and follow movement */}
        {isClient && <NeuralNetwork />}

        {/* Background code keywords - DENSE with Monokai colors */}
        <div
          className='absolute inset-0 overflow-hidden transition-opacity duration-500'
          style={{ opacity: neuralTextVisible ? 1 : 0 }}
        >
          {HERO_KEYWORDS.map((kw, i) => (
            <div
              key={i}
              className={`bg-keyword absolute font-mono ${kw.size}`}
              style={{
                left: kw.x,
                top: kw.y,
                color: kw.color,
                opacity: kw.opacity,
              }}
            >
              {kw.text}
            </div>
          ))}
        </div>
      </div>

      {/* Subtle gradient mesh - NOT dominant */}
      <div className='absolute inset-0 opacity-10'>
        <div
          className='absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px]'
          style={{ backgroundColor: MONOKAI.cyan }}
        />
        <div
          className='absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]'
          style={{ backgroundColor: MONOKAI.purple }}
        />
      </div>
    </div>
  )
}

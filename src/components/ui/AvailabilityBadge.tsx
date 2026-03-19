'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MONOKAI } from '@/lib/monokai-colors'

gsap.registerPlugin(ScrollTrigger)

const STATUS_TEXT = 'Need a design engineer? All ears.'
const CTA_TEXT = "Let's talk"
const MAILTO =
  'mailto:jobs@marklearst.com?subject=Role%20inquiry&body=Hi%20Mark%2C%0D%0A%0D%0AI%20am%20reaching%20out%20about%20a%20role%20on%20our%20team.'

type Stage = 'dot' | 'pill' | 'expanded'

export default function AvailabilityBadge() {
  const [stage, setStage] = useState<Stage>('dot')
  const containerRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const hoverTlRef = useRef<gsap.core.Tween | null>(null)
  const hasExpandedRef = useRef(false)

  // Stage 1 -> 2: Dot morphs into pill when footer scrolls into view
  useEffect(() => {
    if (!containerRef.current) return

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        if (hasExpandedRef.current) return
        hasExpandedRef.current = true

        const tl = gsap.timeline()

        tl.to(
          dotRef.current,
          {
            scale: 1,
            duration: 0.15,
            ease: 'power2.in',
          },
          0,
        )

        tl.to(
          containerRef.current,
          {
            width: 'auto',
            paddingLeft: 14,
            paddingRight: 14,
            paddingTop: 8,
            paddingBottom: 8,
            borderColor: 'rgba(255,255,255,0.06)',
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderRadius: 12,
            duration: 0.5,
            ease: 'power3.out',
            onStart: () => setStage('pill'),
          },
          0.1,
        )

        tl.fromTo(
          textRef.current,
          { opacity: 0, x: -6 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            ease: 'power2.out',
          },
          0.35,
        )
      },
    })

    return () => trigger.kill()
  }, [])

  // Stage 2 -> 3: Hover expands pill to show CTA
  const handleMouseEnter = useCallback(() => {
    if (stage !== 'pill' && stage !== 'expanded') return
    setStage('expanded')

    hoverTlRef.current?.kill()

    gsap.to(containerRef.current, {
      boxShadow: `0 0 0 2px ${MONOKAI.background}, 0 0 0 5px ${MONOKAI.green}`,
      scale: 1.02,
      duration: 0.4,
      ease: 'expo.out',
    })

    gsap.to(ctaRef.current, {
      opacity: 1,
      x: 0,
      width: 'auto',
      marginLeft: 8,
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [stage])

  const handleMouseLeave = useCallback(() => {
    if (stage !== 'expanded') return
    setStage('pill')

    gsap.to(containerRef.current, {
      boxShadow: `0 0 0 0px ${MONOKAI.background}, 0 0 0 0px ${MONOKAI.green}`,
      scale: 1,
      duration: 0.3,
      ease: 'expo.out',
    })

    hoverTlRef.current = gsap.to(ctaRef.current, {
      opacity: 0,
      x: -4,
      width: 0,
      marginLeft: 0,
      duration: 0.25,
      ease: 'power2.in',
    })
  }, [stage])

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className='inline-flex items-center cursor-pointer overflow-hidden border border-transparent'
      style={{
        width: stage === 'dot' ? 10 : undefined,
        height: stage === 'dot' ? 10 : undefined,
        padding: stage === 'dot' ? 0 : undefined,
        borderRadius: stage === 'dot' ? 9999 : 12,
        boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
        backdropFilter: stage !== 'dot' ? 'blur(8px)' : undefined,
      }}
      role='status'
      aria-label='Availability — open to remote roles'
    >
      {/* The dot — always present, anchors the morph */}
      <div className='relative flex size-2.5 shrink-0 items-center justify-center'>
        <div
          ref={dotRef}
          className='size-2 rounded-full bg-monokai-green'
          style={{
            boxShadow: `0 0 12px ${MONOKAI.green}50, 0 0 4px ${MONOKAI.green}30`,
            animation: 'avail-pulse 2.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Status text — fades in after morph */}
      <span
        ref={textRef}
        className='font-mono text-xs text-white/70 whitespace-nowrap ml-2'
        style={{ opacity: stage === 'dot' ? 0 : undefined }}
      >
        {STATUS_TEXT}
      </span>

      {/* CTA — revealed on hover */}
      <a
        ref={ctaRef}
        href={MAILTO}
        onClick={(e) => e.stopPropagation()}
        className='inline-flex items-center gap-1 whitespace-nowrap font-mono text-xs font-medium rounded-md px-2 py-0.5 transition-colors'
        style={{
          opacity: 0,
          width: 0,
          marginLeft: 0,
          overflow: 'hidden',
          color: MONOKAI.green,
          backgroundColor: `${MONOKAI.green}12`,
          border: `1px solid ${MONOKAI.green}25`,
        }}
        aria-label='Send role inquiry email'
      >
        {CTA_TEXT}
        <svg
          width='12'
          height='12'
          viewBox='0 0 12 12'
          fill='none'
          className='shrink-0'
          aria-hidden
        >
          <path
            d='M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </a>

      <style jsx>{`
        @keyframes avail-pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.85);
          }
        }
      `}</style>
    </div>
  )
}

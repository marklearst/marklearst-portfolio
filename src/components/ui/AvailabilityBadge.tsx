'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ArrowRight, CaretRight } from '@phosphor-icons/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MONOKAI } from '@/lib/monokai-colors'

gsap.registerPlugin(ScrollTrigger)

const STATUS_TEXT = 'Need a design engineer? All ears.'
const CTA_TEXT = "Let's talk"
const MAILTO =
  'mailto:jobs@marklearst.com?subject=Role%20inquiry&body=Hi%20Mark%2C%0D%0A%0D%0AI%20am%20reaching%20out%20about%20a%20role%20on%20our%20team.'

type Stage = 'dot' | 'pill' | 'expanded'

// Collapses every tween to zero for reduced-motion users — same end state, no travel.
const dur = (seconds: number) =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 0
    : seconds

export default function AvailabilityBadge() {
  const [stage, setStage] = useState<Stage>('dot')
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)
  const hoverTlRef = useRef<gsap.core.Tween | null>(null)
  const hasExpandedRef = useRef(false)

  // Stage 1 -> 2: Prompt morphs into pill when footer scrolls into view
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
            duration: dur(0.5),
            ease: 'power3.out',
            onStart: () => setStage('pill'),
          },
          0,
        )

        tl.fromTo(
          textRef.current,
          { opacity: 0, x: -6 },
          {
            opacity: 1,
            x: 0,
            duration: dur(0.4),
            ease: 'power2.out',
          },
          dur(0.25),
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
      duration: dur(0.4),
      ease: 'expo.out',
    })

    gsap.to(ctaRef.current, {
      opacity: 1,
      x: 0,
      width: 'auto',
      marginLeft: 8,
      duration: dur(0.3),
      ease: 'power2.out',
    })
  }, [stage])

  const handleMouseLeave = useCallback(() => {
    if (stage !== 'expanded') return
    setStage('pill')

    gsap.to(containerRef.current, {
      boxShadow: `0 0 0 0px ${MONOKAI.background}, 0 0 0 0px ${MONOKAI.green}`,
      scale: 1,
      duration: dur(0.3),
      ease: 'expo.out',
    })

    hoverTlRef.current = gsap.to(ctaRef.current, {
      opacity: 0,
      x: -4,
      width: 0,
      marginLeft: 0,
      duration: dur(0.25),
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
        width: stage === 'dot' ? 12 : undefined,
        height: stage === 'dot' ? 14 : undefined,
        padding: stage === 'dot' ? 0 : undefined,
        borderRadius: stage === 'dot' ? 4 : 12,
        boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
        backdropFilter: stage !== 'dot' ? 'blur(8px)' : undefined,
      }}
      role='status'
      aria-label='Availability — open to remote roles'
    >
      {/* Shell prompt — always present, anchors the morph */}
      <span
        className='flex h-3 w-2.5 shrink-0 items-center justify-center'
        style={{ color: MONOKAI.terminal.prompt }}
        aria-hidden
      >
        <CaretRight size={11} weight='bold' />
      </span>

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
        <ArrowRight size={12} weight='bold' className='shrink-0' aria-hidden />
      </a>
    </div>
  )
}

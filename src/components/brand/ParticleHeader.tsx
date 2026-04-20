'use client'

import { useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function ParticleHeader() {
  const { trackNavigationClick, trackLogoHover } = useAnalytics()
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const mRef = useRef<HTMLSpanElement>(null)
  const middleRef = useRef<HTMLSpanElement>(null)
  const lRef = useRef<HTMLSpanElement>(null)
  const endRef = useRef<HTMLSpanElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const isExpandedRef = useRef(false)

  // Entrance animation - confident scale up
  useEffect(() => {
    if (!containerRef.current) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) {
      gsap.set(containerRef.current, { opacity: 1, scale: 1, y: 0 })
      return
    }

    gsap.fromTo(
      containerRef.current,
      {
        opacity: 0,
        scale: 0.8,
        y: -10,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        delay: 0.3,
        ease: 'back.out(1.4)',
      },
    )
  }, [])

  // {m  l} -> {m arkl earst}
  // So we type 'ark' between m and l, then 'earst' after l

  const typeOut = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    isExpandedRef.current = true
    trackLogoHover({ action: 'expand' })

    const middleText = 'ark'
    const endText = 'earst'
    let middleIndex = 0
    let endIndex = 0

    const tl = gsap.timeline()
    timelineRef.current = tl

    // Type middle part (ark) between m and l
    const typeMiddle = () => {
      if (middleIndex < middleText.length && isExpandedRef.current) {
        middleIndex++
        if (middleRef.current) {
          middleRef.current.textContent = middleText.slice(0, middleIndex)
        }
        if (middleIndex < middleText.length) {
          tl.to({}, { duration: 0.07, onComplete: typeMiddle })
        } else {
          // Start typing end part
          tl.to({}, { duration: 0.07, onComplete: typeEnd })
        }
      }
    }

    // Type end part (earst) after l
    const typeEnd = () => {
      if (endIndex < endText.length && isExpandedRef.current) {
        endIndex++
        if (endRef.current) {
          endRef.current.textContent = endText.slice(0, endIndex)
        }
        if (endIndex < endText.length) {
          tl.to({}, { duration: 0.07, onComplete: typeEnd })
        }
      }
    }

    typeMiddle()
  }, [trackLogoHover])

  const typeBack = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    isExpandedRef.current = false
    trackLogoHover({ action: 'collapse' })

    let endLength = endRef.current?.textContent?.length || 0
    let middleLength = middleRef.current?.textContent?.length || 0

    const tl = gsap.timeline()
    timelineRef.current = tl

    // Delete end part first (earst)
    const deleteEnd = () => {
      if (endLength > 0 && !isExpandedRef.current) {
        endLength--
        if (endRef.current) {
          endRef.current.textContent = 'earst'.slice(0, endLength)
        }
        if (endLength > 0) {
          tl.to({}, { duration: 0.04, onComplete: deleteEnd })
        } else {
          // Then delete middle part
          tl.to({}, { duration: 0.04, onComplete: deleteMiddle })
        }
      } else if (endLength === 0) {
        deleteMiddle()
      }
    }

    // Delete middle part (ark)
    const deleteMiddle = () => {
      if (middleLength > 0 && !isExpandedRef.current) {
        middleLength--
        if (middleRef.current) {
          middleRef.current.textContent = 'ark'.slice(0, middleLength)
        }
        if (middleLength > 0) {
          tl.to({}, { duration: 0.04, onComplete: deleteMiddle })
        }
      }
    }

    deleteEnd()
  }, [trackLogoHover])

  return (
    <Link
      href='/'
      onClick={() => {
        if (pathname !== '/') {
          trackNavigationClick({
            action: 'logo_click',
            from: pathname,
            to: '/',
          })
        }
      }}
      className='block'
      onMouseEnter={typeOut}
      onMouseLeave={typeBack}
      aria-label='Mark Learst - Home'
    >
      <div
        ref={containerRef}
        className='flex items-center font-mono font-medium text-lg sm:text-2xl opacity-0'
        style={{
          color: 'rgb(252, 252, 250)',
        }}
      >
        <span className='opacity-50 mr-[2px]'>{`{`}</span>
        <span ref={mRef}>m</span>
        <span ref={middleRef}></span>
        <span ref={lRef}>l</span>
        <span ref={endRef}></span>
        <span className='opacity-50'>{`}`}</span>
      </div>
    </Link>
  )
}

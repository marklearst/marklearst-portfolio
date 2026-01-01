'use client'

import { useRef, useCallback } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'

export default function ParticleHeader() {
  const mRef = useRef<HTMLSpanElement>(null)
  const middleRef = useRef<HTMLSpanElement>(null)
  const lRef = useRef<HTMLSpanElement>(null)
  const endRef = useRef<HTMLSpanElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const isExpandedRef = useRef(false)

  // {m  l} -> {m arkl earst}
  // So we type 'ark' between m and l, then 'earst' after l

  const typeOut = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    isExpandedRef.current = true

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
  }, [])

  const typeBack = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    isExpandedRef.current = false

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
  }, [])

  return (
    <Link
      href='/'
      className='block'
      onMouseEnter={typeOut}
      onMouseLeave={typeBack}
      aria-label='Mark Learst - Home'
    >
      <div
        className='flex items-center font-mono font-medium'
        style={{
          color: 'rgb(252, 252, 250)',
          fontSize: '1.5rem',
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

'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface PageTransitionProps {
  onComplete?: () => void
}

export default function PageTransition({ onComplete }: PageTransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete()
      },
    })

    // Sophisticated page transition sequence
    tl.to(overlayRef.current, {
      scaleY: 1,
      duration: 0.8,
      ease: 'expo.inOut',
      transformOrigin: 'top',
    })
      .to(progressRef.current, {
        width: '100%',
        duration: 0.6,
        ease: 'power2.out',
      })
      .to(
        overlayRef.current,
        {
          scaleY: 0,
          duration: 0.8,
          ease: 'expo.inOut',
          transformOrigin: 'bottom',
        },
        '+=0.2',
      )

    return () => {
      tl.kill()
    }
  }, [onComplete])

  return (
    <div className='fixed inset-0 pointer-events-none z-[9999]'>
      {/* Main overlay */}
      <div
        ref={overlayRef}
        className='absolute inset-0 bg-black origin-top scale-y-0'
      >
        {/* Gradient mesh */}
        <div className='absolute inset-0 opacity-20'>
          <div className='absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px]' />
          <div className='absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]' />
        </div>

        {/* Content */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='text-center'>
            {/* Loading indicator */}
            <div className='mb-6'>
              <div className='w-16 h-16 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto' />
            </div>

            {/* Loading text */}
            <div className='font-mono text-sm text-white/40 mb-4'>
              Loading case study
            </div>

            {/* Progress bar */}
            <div className='w-64 h-0.5 bg-white/10 rounded-full overflow-hidden mx-auto'>
              <div
                ref={progressRef}
                className='h-full bg-white/60 w-0 rounded-full'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
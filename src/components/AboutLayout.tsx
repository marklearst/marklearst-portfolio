'use client'

import { ReactNode, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import Footer from '@/components/Footer'
import { MONOKAI } from '@/lib/monokai-colors'

export default function AboutLayout({
  title,
  summary,
  tagline,
  children,
}: {
  title: string
  summary: string
  tagline?: string
  children: ReactNode
}) {
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const summaryRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const taglineEl = taglineRef.current
    const titleEl = titleRef.current
    const summaryEl = summaryRef.current

    // Set initial states with will-change for GPU acceleration
    if (taglineEl) {
      gsap.set(taglineEl, { opacity: 0, y: 18, willChange: 'transform, opacity' })
    }
    gsap.set(titleEl, { opacity: 0, y: 30, willChange: 'transform, opacity' })
    gsap.set(summaryEl, { opacity: 0, y: 22, willChange: 'transform, opacity' })

    // Create entrance timeline
    const tl = gsap.timeline({ delay: 0.15 })

    if (taglineEl) {
      tl.to(taglineEl, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'expo.out',
        clearProps: 'willChange',
      })
    }

    tl.to(
      titleEl,
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'expo.out',
        clearProps: 'willChange',
      },
      taglineEl ? '-=0.4' : 0,
    ).to(
      summaryEl,
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'expo.out',
        clearProps: 'willChange',
      },
      '-=0.45',
    )

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <main className='min-h-screen relative overflow-hidden'>
      {/* Background gradient orbs */}
      <div className='absolute inset-0 pointer-events-none'>
        <div
          className='absolute top-1/4 left-1/6 w-[600px] h-[600px] rounded-full blur-[160px] opacity-12'
          style={{ backgroundColor: MONOKAI.cyan }}
        />
        <div
          className='absolute top-1/2 right-1/6 w-[500px] h-[500px] rounded-full blur-[140px] opacity-10'
          style={{ backgroundColor: MONOKAI.purple }}
        />
        <div
          className='absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px] opacity-8'
          style={{ backgroundColor: MONOKAI.pink }}
        />
      </div>

      {/* Hero Section */}
      <section className='relative z-10 px-6 md:px-12 pt-36 pb-20'>
        <div className='max-w-6xl mx-auto'>
          {/* Tagline above title */}
          {tagline && (
            <p
              ref={taglineRef}
              className='font-mono text-sm mb-4 tracking-wide'
              style={{ color: MONOKAI.cyan }}
            >
              {tagline}
            </p>
          )}

          {/* Title */}
          <h1
            ref={titleRef}
            className='text-[clamp(52px,9vw,108px)] font-mono font-bold! lowercase leading-[0.9] mb-8'
            style={{ color: MONOKAI.foreground }}
          >
            {title}
          </h1>

          {/* Summary */}
          <p
            ref={summaryRef}
            className='text-[clamp(17px,2.2vw,24px)] leading-relaxed max-w-5xl'
            style={{ color: `${MONOKAI.foreground}b3` }}
          >
            {summary}
          </p>
        </div>
      </section>

      {/* Content Sections - rendered from MDX */}
      <section className='relative z-10 px-6 md:px-12 pb-32'>
        <div className='max-w-6xl mx-auto space-y-20'>{children}</div>
      </section>

      <Footer />
    </main>
  )
}

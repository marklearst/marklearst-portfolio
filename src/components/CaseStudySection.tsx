'use client'

import type { ReactNode } from 'react'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MONOKAI } from '@/lib/monokai-colors'

gsap.registerPlugin(ScrollTrigger)

export interface CaseStudySectionProps {
  title: string
  children: ReactNode
  /** Layout variant: 'default' | 'two-column' | 'timeline' */
  layout?: 'default' | 'two-column' | 'timeline'
}

export function CaseStudySection({
  title,
  children,
  layout = 'default',
}: CaseStudySectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Auto-detect Skills section for grid layout
  const isSkillsSection = title.toLowerCase() === 'skills'

  useEffect(() => {
    const section = sectionRef.current
    const titleEl = titleRef.current
    const contentEl = contentRef.current

    if (!section || !titleEl || !contentEl) return

    // Set initial states with will-change for smooth GPU rendering
    gsap.set(titleEl, { opacity: 0, y: 24, willChange: 'transform, opacity' })

    // For skills grid, animate each item individually
    if (isSkillsSection) {
      const items = contentEl.querySelectorAll(':scope > div')
      gsap.set(items, { opacity: 0, y: 30, willChange: 'transform, opacity' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      })

      tl.to(titleEl, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'expo.out',
        clearProps: 'willChange',
      }).to(
        items,
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'expo.out',
          stagger: 0.07,
          clearProps: 'willChange',
        },
        '-=0.4',
      )

      return () => {
        tl.kill()
        ScrollTrigger.getAll().forEach((st) => {
          if (st.vars.trigger === section) st.kill()
        })
      }
    }

    // For timeline layout - clean, elegant fade-in
    if (layout === 'timeline') {
      const entries = contentEl.querySelectorAll('.timeline-entry')
      const subsections = contentEl.querySelectorAll('.timeline-subsection')

      // Set initial states
      gsap.set(subsections, { opacity: 0, y: 16, willChange: 'transform, opacity' })
      gsap.set(entries, { opacity: 0, y: 12, willChange: 'transform, opacity' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      })

      // Title
      tl.to(titleEl, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'expo.out',
        clearProps: 'willChange',
      })

      // Subsections fade in
      tl.to(
        subsections,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'expo.out',
          stagger: 0.15,
          clearProps: 'willChange',
        },
        '-=0.35',
      )

      // Timeline entries stagger in elegantly
      tl.to(
        entries,
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'expo.out',
          stagger: 0.08,
          clearProps: 'willChange',
        },
        '-=0.3',
      )

      return () => {
        tl.kill()
        ScrollTrigger.getAll().forEach((st) => {
          if (st.vars.trigger === section) st.kill()
        })
      }
    }

    // Default animation
    gsap.set(contentEl, { opacity: 0, y: 28, willChange: 'transform, opacity' })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
    })

    tl.to(titleEl, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'expo.out',
      clearProps: 'willChange',
    }).to(
      contentEl,
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'expo.out',
        clearProps: 'willChange',
      },
      '-=0.4',
    )

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === section) st.kill()
      })
    }
  }, [isSkillsSection, layout])

  // Determine content class based on layout
  const getContentClassName = () => {
    if (isSkillsSection) {
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 [&_ul]:mt-3'
    }
    if (layout === 'two-column') {
      return 'grid grid-cols-1 md:grid-cols-2 gap-12 [&_ul]:mt-4'
    }
    if (layout === 'timeline') {
      return 'space-y-10 [&_ul]:mt-4'
    }
    return 'space-y-6 [&_ul]:mt-4'
  }

  return (
    <div ref={sectionRef} className='mb-16'>
      <h2
        ref={titleRef}
        className='text-[clamp(28px,4vw,42px)] font-mono lowercase mb-8'
        style={{ color: MONOKAI.foreground }}
      >
        {title}
      </h2>
      <div
        ref={contentRef}
        className={getContentClassName()}
        style={{ color: `${MONOKAI.foreground}cc` }}
      >
        {children}
      </div>
    </div>
  )
}

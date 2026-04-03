'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROJECTS } from '@/data/projects'
import ProjectCard from '@/components/FeaturedWorkCard'
import { MONOKAI } from '@/lib/monokai-colors'
import { useSectionViewTracking } from '@/hooks/useAnalytics'

gsap.registerPlugin(ScrollTrigger)

export default function FeaturedWork() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const [activeCard, setActiveCard] = useState<number | null>(null)

  useSectionViewTracking({
    ref: sectionRef as React.RefObject<HTMLElement>,
    section: 'featured_work',
    data: { location: 'home' },
  })

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title reveal with split animation
      gsap.from('.section-title', {
        scrollTrigger: {
          trigger: '.section-title',
          start: 'top 75%',
        },
        opacity: 0,
        y: 60,
        duration: 1.4,
        ease: 'expo.out',
      })

      // Subtitle reveal
      gsap.from('.section-subtitle', {
        scrollTrigger: {
          trigger: '.section-subtitle',
          start: 'top 75%',
        },
        opacity: 0,
        x: -20,
        duration: 1,
        delay: 0.3,
        ease: 'expo.out',
      })

      // Cards orchestration
      cardsRef.current.forEach((card, index) => {
        if (card) {
          // Initial reveal
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
            },
            opacity: 0,
            y: 100,
            rotateX: -15,
            duration: 1.2,
            delay: index * 0.2,
            ease: 'expo.out',
          })
        }
      })
    }, sectionRef as React.RefObject<HTMLElement>)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id='work'
      ref={sectionRef}
      className='pt-32 pb-32 px-6 relative overflow-hidden'
      style={{ backgroundColor: MONOKAI.background }}
    >
      {/* Atmospheric gradients */}
      <div className='absolute inset-0'>
        <div className='absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px]' />
        <div className='absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]' />
      </div>

      <div className='max-w-7xl mx-auto relative z-10'>
        {/* Section Header */}
        <div className='mb-20'>
          <div className='flex items-baseline gap-4 mb-4'>
            <h2 className='section-title text-[clamp(48px,8vw,84px)] font-mono lowercase leading-none'>
              featured work
            </h2>
          </div>
          <div className='section-subtitle flex items-center gap-3 font-mono text-sm text-white/30'>
            <span>{'//  '}</span>
            <span>Latest projects & case studies</span>
          </div>
        </div>

        {/* Cards Grid - Consistent spacing with equal height rows */}
        <div className='grid lg:grid-cols-3 gap-6 auto-rows-fr'>
          {PROJECTS.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={index}
              isActive={activeCard === index}
              onHover={() => setActiveCard(index)}
              onLeave={() => setActiveCard(null)}
              ref={(el) => {
                cardsRef.current[index] = el
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'
import { PROJECTS, type ProjectMeta } from '@/data/projects'
import { getCategoryColor, getCategoryIcon } from '@/lib/project-categories'
import { MONOKAI } from '@/lib/monokai-colors'

gsap.registerPlugin(ScrollTrigger)

export default function FeaturedWork() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const [activeCard, setActiveCard] = useState<number | null>(null)

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
    }, sectionRef)

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

interface ProjectCardProps {
  project: ProjectMeta
  index: number
  isActive: boolean
  onHover: () => void
  onLeave: () => void
}

const ProjectCard = React.forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ project, isActive, onHover, onLeave }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null)
    const glowRef = useRef<HTMLDivElement>(null)

    // Combine refs
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(cardRef.current)
      } else if (ref) {
        ref.current = cardRef.current
      }
    }, [ref])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return

      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Update glow position
      if (glowRef.current) {
        glowRef.current.style.background = `
          radial-gradient(
            800px circle at ${x}px ${y}px,
            rgba(255,255,255,0.08),
            transparent 50%
          )
        `
      }
    }

    const categoryColor = getCategoryColor(project.categoryColor)

    return (
      <div
        ref={cardRef}
        className='group relative h-full'
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onMouseMove={handleMouseMove}
      >
        {/* Card container with sophisticated backdrop */}
        <div
          className={`
            relative h-full p-8 rounded-2xl
            bg-white/2 backdrop-blur-xl
            border border-white/10
            hover:border-white/20
            transition-all duration-700 ease-out
            overflow-hidden
            ${isActive ? 'scale-[1.02] shadow-2xl' : ''}
          `}
        >
          {/* Gradient overlay */}
          <div
            className={`
              absolute inset-0 opacity-0 group-hover:opacity-100
              transition-opacity duration-700
              bg-linear-to-br ${project.cardGradient}
            `}
          />

          {/* Mouse tracking glow */}
          <div
            ref={glowRef}
            className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'
          />

          {/* Content */}
          <div className='relative z-10 h-full flex flex-col'>
            {/* Header */}
            <div className='flex items-start justify-between mb-6'>
              <div className='flex items-center gap-2'>
                {/* Category icon */}
                <div style={{ color: categoryColor }}>
                  {getCategoryIcon(project.category)}
                </div>
                {/* Category badge */}
                <div
                  className='text-xs font-mono uppercase tracking-wider px-2 py-1 rounded'
                  style={{
                    color: categoryColor,
                    backgroundColor: `${categoryColor}15`,
                    border: `1px solid ${categoryColor}30`,
                  }}
                >
                  {project.category}
                </div>
              </div>
              <div
                className='font-mono text-[9px] tracking-wider px-2 py-1 rounded'
                style={{
                  color: `${MONOKAI.foreground}40`,
                  border: `1px solid ${MONOKAI.foreground}10`,
                }}
              >
                #{project.commitHash}
              </div>
            </div>

            {/* Title */}
            <h3 className='text-3xl mb-5 font-mono font-medium group-hover:text-white transition-colors duration-500 leading-tight'>
              {project.cardTitle}
            </h3>

            {/* Description - grows to fill space */}
            <p className='text-white/60 leading-relaxed text-sm flex-1'>
              {project.summary}
            </p>

            {/* Tags + CTA pinned to bottom */}
            <div className='mt-auto pt-8'>
              {/* Tags */}
              <div className='flex flex-wrap gap-2 mb-6'>
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className='px-3 py-1.5 text-[11px] font-mono rounded-md border transition-all duration-300'
                    style={{
                      backgroundColor: `${categoryColor}08`,
                      color: `${MONOKAI.foreground}60`,
                      borderColor: `${categoryColor}20`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA Link */}
              <a
                href={project.route}
                className='inline-flex items-center gap-2.5 text-white/80 hover:text-white font-medium transition-all duration-300 group/link'
              >
                <span className='font-mono text-sm'>Read case study</span>
                <svg
                  className='w-4 h-4 transform group-hover/link:translate-x-1.5 transition-transform duration-300'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M13 7l5 5m0 0l-5 5m5-5H6'
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Animated accent line */}
          <div
            className='absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-700'
            style={{
              background: `linear-gradient(90deg, transparent, ${categoryColor}, transparent)`,
            }}
          />

          {/* Corner accent */}
          <div
            className={`
              absolute top-0 right-0 w-20 h-20
              bg-linear-to-br ${project.cardGradient}
              opacity-0 group-hover:opacity-100
              blur-2xl
              transition-opacity duration-700
            `}
          />
        </div>

        {/* Hover state shadow */}
        <div
          className={`
            absolute inset-0 -z-10 rounded-2xl opacity-0 group-hover:opacity-100
            blur-xl transition-opacity duration-700
            bg-linear-to-br ${project.cardGradient}
          `}
        />
      </div>
    )
  },
)

ProjectCard.displayName = 'ProjectCard'

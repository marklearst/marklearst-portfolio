'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'
import { MONOKAI } from '@/lib/monokai-colors'

gsap.registerPlugin(ScrollTrigger)

interface Project {
  category: string
  categoryColor: string
  title: string
  description: string
  href: string
  tags: string[]
  commitHash: string
  gradient: string
}

const projects: Project[] = [
  {
    category: 'DESIGN SYSTEMS',
    categoryColor: 'purple', // Monokai Pro purple #ab9df2
    title: 'Aurora Design System',
    description:
      "Built GM's first cross-brand React design system achieving 60% component reuse across 4 brands (Chevy, Buick, GMC, Cadillac) with WCAG 2.1 AA compliance.",
    href: '/work/aurora-gm',
    tags: ['React', 'Design Tokens', 'Storybook'],
    commitHash: 'a3f9c2d',
    gradient: 'from-purple-500/10 via-pink-500/5 to-transparent',
  },
  {
    category: 'DEVELOPER TOOLS',
    categoryColor: 'cyan', // Monokai Pro cyan #78dce8
    title: 'FigmaVars Hooks',
    description:
      'React 19 hooks library and CLI for Figma Variables REST API. Type-safe synchronization between Figma and React apps with 100% test coverage.',
    href: '/work/figmavars-hooks',
    tags: ['React 19', 'TypeScript', 'Figma API'],
    commitHash: 'b7e4f1a',
    gradient: 'from-teal-500/10 via-cyan-500/5 to-transparent',
  },
  {
    category: 'ACCESSIBILITY',
    categoryColor: 'green', // Monokai Pro green #a9dc75
    title: 'a11y Companion',
    description:
      'Figma widget bringing A11Y Project Checklist into design workflows. 200+ active users with WCAG 2.2 tooltips, progress tracking, and bulk actions.',
    href: '/work/a11y-companion',
    tags: ['Figma Widget', 'WCAG 2.2', 'Accessibility'],
    commitHash: 'c9d2e8b',
    gradient: 'from-green-500/10 via-emerald-500/5 to-transparent',
  },
  {
    category: 'HEALTH TECH',
    categoryColor: 'pink', // Monokai Pro pink #ff6188
    title: 'Diabetic Utils',
    description:
      'TypeScript library for glucose, A1C, and TIR calculations. Featured in Google AI Overview with 100% test coverage and adopted by health tech teams.',
    href: '/work/diabetic-utils',
    tags: ['TypeScript', 'npm', 'Health Tech'],
    commitHash: 'e4a7b3f',
    gradient: 'from-pink-500/10 via-red-500/5 to-transparent',
  },
  {
    category: 'STANDARDS',
    categoryColor: 'orange', // Monokai Pro orange #fb9866
    title: 'Variables Contract',
    description:
      'Open specification for design variable governance and cross-tool synchronization. DTCG 2025.10 compliant, solving tool lock-in and version control gaps.',
    href: '/work/variable-contract',
    tags: ['Specification', 'Design Tokens', 'W3C'],
    commitHash: 'f9c231d',
    gradient: 'from-orange-500/10 via-yellow-500/5 to-transparent',
  },
  {
    category: 'CONSULTING',
    categoryColor: 'yellow', // Monokai Pro yellow #ffd866
    title: 'Skydio Component Library',
    description:
      'Built React/Storybook component library and onboarded product and engineering teams on adoption patterns for autonomous drone platform.',
    href: '/work/skydio',
    tags: ['React', 'Storybook', 'Consulting'],
    commitHash: 'd8e5c7b',
    gradient: 'from-teal-500/10 via-blue-500/5 to-transparent',
  },
]

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
          {projects.map((project, index) => (
            <ProjectCard
              key={project.title}
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

// Category icon helper - defined outside component to avoid re-creation
const getCategoryIcon = (category: string) => {
  const iconStyle = { width: '14px', height: '14px' }

  switch (category) {
    case 'DESIGN SYSTEMS':
      return (
        <svg
          style={iconStyle}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z'
          />
        </svg>
      )
    case 'DEVELOPER TOOLS':
      return (
        <svg
          style={iconStyle}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
          />
        </svg>
      )
    case 'ACCESSIBILITY':
      return (
        <svg
          style={iconStyle}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
          />
        </svg>
      )
    case 'HEALTH TECH':
      return (
        <svg
          style={iconStyle}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
          />
        </svg>
      )
    case 'STANDARDS':
      return (
        <svg
          style={iconStyle}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
          />
        </svg>
      )
    case 'CONSULTING':
      return (
        <svg
          style={iconStyle}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
          />
        </svg>
      )
    default:
      return null
  }
}

interface ProjectCardProps {
  project: Project
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

    // Map to actual Monokai Pro colors
    const getCategoryColor = (color: string) => {
      const colorMap: { [key: string]: string } = {
        cyan: MONOKAI.cyan,
        purple: MONOKAI.purple,
        green: MONOKAI.green,
        orange: MONOKAI.orange,
        pink: MONOKAI.pink,
        yellow: MONOKAI.yellow,
      }
      return colorMap[color] || MONOKAI.cyan
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
              bg-linear-to-br ${project.gradient}
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
              {project.title}
            </h3>

            {/* Description - grows to fill space */}
            <p className='text-white/60 leading-relaxed text-sm flex-1'>
              {project.description}
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
                href={project.href}
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
              bg-linear-to-br ${project.gradient}
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
            bg-linear-to-br ${project.gradient}
          `}
        />
      </div>
    )
  },
)

ProjectCard.displayName = 'ProjectCard'

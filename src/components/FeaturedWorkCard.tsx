'use client'

import React, { useEffect, useRef } from 'react'
import type { ProjectMeta } from '@/data/projects'
import { getCategoryColor, getCategoryIcon } from '@/lib/project-categories'
import { MONOKAI } from '@/lib/monokai-colors'
import { useAnalytics } from '@/hooks/useAnalytics'

interface ProjectCardProps {
  project: ProjectMeta
  index: number
  isActive: boolean
  onHover: () => void
  onLeave: () => void
}

const ProjectCard = React.forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ project, index, isActive, onHover, onLeave }, ref) => {
    const { trackCaseStudyClick, trackProjectCardHover } = useAnalytics()
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
        onMouseEnter={() => {
          onHover()
          trackProjectCardHover({ project: project.slug, index: index })
        }}
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
                onClick={() => {
                  trackCaseStudyClick({
                    project: project.slug,
                    category: project.category,
                    route: project.route,
                    source: 'featured_work',
                  })
                }}
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

export default ProjectCard

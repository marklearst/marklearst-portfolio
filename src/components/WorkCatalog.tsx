'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { ProjectMeta } from '@/data/projects'
import { PROJECTS } from '@/data/projects'
import ProjectCard from '@/components/FeaturedWorkCard'
import { MONOKAI } from '@/lib/monokai-colors'

gsap.registerPlugin(ScrollTrigger)

type WorkFilter = {
  id: string
  label: string
  color: string
  matches: (project: ProjectMeta) => boolean
}

const OPEN_SOURCE_SLUGS = new Set([
  'figmavars-hooks',
  'a11y-companion',
  'diabetic-utils',
  'variable-contract',
])

const WORK_FILTERS: WorkFilter[] = [
  {
    id: 'design-systems',
    label: 'Design Systems',
    color: MONOKAI.purple,
    matches: (project) => project.category === 'DESIGN SYSTEMS',
  },
  {
    id: 'react',
    label: 'React',
    color: MONOKAI.cyan,
    matches: (project) =>
      project.technologies.some((tech) =>
        tech.toLowerCase().includes('react'),
      ) || project.tags.some((tag) => tag.toLowerCase().includes('react')),
  },
  {
    id: 'wcag',
    label: 'WCAG',
    color: MONOKAI.green,
    matches: (project) =>
      project.category === 'ACCESSIBILITY' ||
      project.technologies.some((tech) => tech.toLowerCase().includes('wcag')),
  },
  {
    id: 'open-source',
    label: 'Open Source',
    color: MONOKAI.orange,
    matches: (project) => OPEN_SOURCE_SLUGS.has(project.slug),
  },
  {
    id: 'developer-tools',
    label: 'Developer Tools',
    color: MONOKAI.yellow,
    matches: (project) => project.category === 'DEVELOPER TOOLS',
  },
  {
    id: 'health-tech',
    label: 'Health Tech',
    color: MONOKAI.pink,
    matches: (project) => project.category === 'HEALTH TECH',
  },
]

const ENABLE_FILTERS = true

const getTimestamp = (value?: string) => (value ? new Date(value).getTime() : 0)

const sortProjects = (projects: ProjectMeta[]) =>
  [...projects].sort((a, b) => {
    const dateA = getTimestamp(a.publishedAt)
    const dateB = getTimestamp(b.publishedAt)
    if (dateA !== dateB) return dateB - dateA
    return a.title.localeCompare(b.title)
  })

export default function WorkCatalog() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [activeCatalogCard, setActiveCatalogCard] = useState<number | null>(
    null,
  )

  const sortedProjects = useMemo(() => sortProjects(PROJECTS), [])

  const filteredProjects = useMemo(() => {
    if (!activeFilters.length) return sortedProjects
    const activeSet = new Set(activeFilters)
    const active = WORK_FILTERS.filter((filter) => activeSet.has(filter.id))

    return sortedProjects.filter((project) =>
      active.some((filter) => filter.matches(project)),
    )
  }, [activeFilters, sortedProjects])

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.work-kicker', {
        scrollTrigger: {
          trigger: '.work-kicker',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 34,
        duration: 1.3,
        ease: 'expo.out',
      })

      gsap.from('.work-title', {
        scrollTrigger: {
          trigger: '.work-title',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 64,
        duration: 1.5,
        delay: 0.08,
        ease: 'expo.out',
      })

      gsap.from('.work-summary', {
        scrollTrigger: {
          trigger: '.work-summary',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 54,
        duration: 1.5,
        delay: 0.14,
        ease: 'expo.out',
      })

      gsap.from('.work-filters', {
        scrollTrigger: {
          trigger: '.work-filters',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 44,
        duration: 1.3,
        delay: 0.2,
        ease: 'expo.out',
      })

      gsap.utils.toArray<HTMLElement>('.work-card').forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 99%',
            toggleActions: 'play none none none',
          },
          opacity: 0,
          y: 140,
          rotateX: -10,
          duration: 1.4,
          delay: index * 0.08,
          ease: 'expo.out',
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef}>
      <div className='mb-8'>
        <div className='work-kicker flex items-center gap-3 pb-5 font-mono text-xs uppercase tracking-wider text-white/40'>
          <span>{'//  '}</span>
          <span>full catalog</span>
        </div>
        <h2 className='work-title text-[clamp(48px,7vw,96px)] font-mono font-bold! lowercase leading-[0.9] mb-6'>
          All work
        </h2>
        <p className='work-summary mt-4 max-w-none font-mono text-[clamp(16px,2vw,22px)] leading-relaxed text-white/70'>
          Everything I ship lives here, design systems, React UI architecture,
          tokens, Storybook docs, accessibility work, motion experiments, and
          the tooling that makes teams faster. Some projects are shipped in
          production, some are open source, some are R&D that turned into
          patterns I reuse. Filter by focus area to scan fast, then open any
          card for the decisions, the tradeoffs, and the code.
        </p>
      </div>

      {ENABLE_FILTERS ? (
        <div className='work-filters flex flex-wrap items-center gap-2 mb-8'>
          <button
            type='button'
            onClick={() => setActiveFilters([])}
            className='work-filter-pill px-3 py-1.5 rounded-full border text-xs font-mono uppercase tracking-wider transition-all duration-200 inline-flex items-center gap-2'
            style={
              {
                borderColor: `${MONOKAI.foreground}40`,
                color: MONOKAI.foreground,
                backgroundColor:
                  activeFilters.length === 0
                    ? `${MONOKAI.foreground}20`
                    : `${MONOKAI.foreground}10`,
                '--filter-ring-color': `${MONOKAI.foreground}80`,
              } as CSSProperties
            }
            aria-pressed={activeFilters.length === 0}
          >
            <span
              aria-hidden='true'
              className='h-2.5 w-2.5 rounded-full border transition-all duration-300'
              style={{
                borderColor: `${MONOKAI.foreground}70`,
                backgroundColor: MONOKAI.foreground,
                opacity: activeFilters.length === 0 ? 1 : 0.25,
                transform:
                  activeFilters.length === 0 ? 'scale(1)' : 'scale(0.85)',
              }}
            />
            <span>All</span>
          </button>
          {WORK_FILTERS.map((filter) => {
            const isActive = activeFilters.includes(filter.id)
            return (
              <button
                key={filter.id}
                type='button'
                onClick={() => toggleFilter(filter.id)}
                className='work-filter-pill px-3 py-1.5 rounded-full border text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer inline-flex items-center gap-2'
                style={
                  {
                    borderColor: `${filter.color}${isActive ? '60' : '40'}`,
                    color: filter.color,
                    backgroundColor: `${filter.color}${isActive ? '30' : '20'}`,
                    '--filter-ring-color': `${filter.color}80`,
                  } as CSSProperties
                }
                aria-pressed={isActive}
              >
                <span
                  aria-hidden='true'
                  className='h-2.5 w-2.5 rounded-full border transition-all duration-300'
                  style={{
                    borderColor: `${filter.color}80`,
                    backgroundColor: filter.color,
                    opacity: isActive ? 1 : 0.25,
                    transform: isActive ? 'scale(1)' : 'scale(0.85)',
                  }}
                />
                <span>{filter.label}</span>
              </button>
            )
          })}
          <span className='ml-1 text-[11px] font-mono uppercase tracking-wider text-white/40'>
            {filteredProjects.length} of {sortedProjects.length}
          </span>
        </div>
      ) : null}

      {/* {aboutSummary ? (
        <div
          className='work-about mb-12 w-full rounded-2xl border px-6 py-5 font-mono'
          style={{
            borderColor: `${MONOKAI.cyan}35`,
            backgroundColor: `${MONOKAI.cyan}10`,
            color: MONOKAI.cyan,
          }}
        >
          <div className='text-xs uppercase tracking-wider mb-2'>About</div>
          <p className='text-[clamp(16px,2vw,22px)] leading-relaxed max-w-none'>
            {aboutSummary}
          </p>
        </div>
      ) : null} */}

      {filteredProjects.length ? (
        <div className='grid gap-6 lg:grid-cols-3 auto-rows-fr'>
          {filteredProjects.map((project, index) => (
            <div key={project.slug} className='work-card h-full'>
              <ProjectCard
                project={project}
                index={index}
                isActive={activeCatalogCard === index}
                onHover={() => setActiveCatalogCard(index)}
                onLeave={() => setActiveCatalogCard(null)}
                location='work_catalog'
              />
            </div>
          ))}
        </div>
      ) : (
        <div className='rounded-2xl border border-white/10 bg-white/5 p-8 text-center font-mono text-sm text-white/60'>
          No projects match those filters.
        </div>
      )}
    </section>
  )
}

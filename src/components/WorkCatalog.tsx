'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
      ) ||
      project.tags.some((tag) => tag.toLowerCase().includes('react')),
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

const getTimestamp = (value?: string) =>
  value ? new Date(value).getTime() : 0

const sortProjects = (projects: ProjectMeta[]) =>
  [...projects].sort((a, b) => {
    const dateA = getTimestamp(a.publishedAt)
    const dateB = getTimestamp(b.publishedAt)
    if (dateA !== dateB) return dateB - dateA
    return a.title.localeCompare(b.title)
  })

export default function WorkCatalog({ aboutSummary }: { aboutSummary: string }) {
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
          start: 'top 80%',
        },
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'expo.out',
      })

      gsap.from('.work-title', {
        scrollTrigger: {
          trigger: '.work-title',
          start: 'top 80%',
        },
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'expo.out',
      })

      gsap.from('.work-summary', {
        scrollTrigger: {
          trigger: '.work-summary',
          start: 'top 80%',
        },
        opacity: 0,
        y: 20,
        duration: 0.9,
        delay: 0.1,
        ease: 'expo.out',
      })

      gsap.from('.work-filters', {
        scrollTrigger: {
          trigger: '.work-filters',
          start: 'top 85%',
        },
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.1,
        ease: 'expo.out',
      })

      if (aboutSummary) {
        gsap.from('.work-about', {
          scrollTrigger: {
            trigger: '.work-about',
            start: 'top 85%',
          },
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'expo.out',
        })
      }

      gsap.utils.toArray<HTMLElement>('.work-card').forEach((card) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
          },
          opacity: 0,
          y: 80,
          rotateX: -10,
          duration: 1,
          ease: 'expo.out',
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [aboutSummary, filteredProjects.length])

  return (
    <section ref={sectionRef}>
      <div className='mb-8'>
        <div className='work-kicker flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-white/40'>
          <span>{'//  '}</span>
          <span>full catalog</span>
        </div>
        <h2 className='work-title mt-4 text-[clamp(32px,4vw,48px)] font-mono lowercase text-white !font-bold'>
          All work
        </h2>
        <p className='work-summary mt-4 max-w-none font-mono text-[clamp(16px,2vw,22px)] leading-relaxed text-white/70'>
          Everything I ship lives here, design systems, React UI architecture,
          tokens, Storybook docs, accessibility work, motion experiments, and
          the tooling that makes teams faster. Some projects are shipped in
          production, some are open source, some are R and D that turned into
          patterns I reuse. Filter by focus area to scan fast, then open any
          card for the decisions, the tradeoffs, and the code.
        </p>
      </div>

      {ENABLE_FILTERS ? (
        <div className='work-filters flex flex-wrap items-center gap-2 mb-8'>
          <button
            type='button'
            onClick={() => setActiveFilters([])}
            className='px-3 py-1.5 rounded-full border text-xs font-mono uppercase tracking-wider transition-all duration-200'
            style={{
              borderColor: `${MONOKAI.foreground}40`,
              color: MONOKAI.foreground,
              backgroundColor:
                activeFilters.length === 0
                  ? `${MONOKAI.foreground}15`
                  : 'transparent',
            }}
            aria-pressed={activeFilters.length === 0}
          >
            All
          </button>
          {WORK_FILTERS.map((filter) => {
            const isActive = activeFilters.includes(filter.id)
            const backgroundStrength = isActive ? '25' : '12'
            const borderStrength = isActive ? '70' : '45'
            return (
              <button
                key={filter.id}
                type='button'
                onClick={() => toggleFilter(filter.id)}
                className='px-3 py-1.5 rounded-full border text-xs font-mono uppercase tracking-wider transition-all duration-200'
                style={{
                  borderColor: `${filter.color}${borderStrength}`,
                  color: filter.color,
                  backgroundColor: `${filter.color}${backgroundStrength}`,
                }}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            )
          })}
          <span className='ml-1 text-[11px] font-mono uppercase tracking-wider text-white/40'>
            {filteredProjects.length} of {sortedProjects.length}
          </span>
        </div>
      ) : null}

      {aboutSummary ? (
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
      ) : null}

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

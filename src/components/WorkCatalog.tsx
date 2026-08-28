'use client'

import { ArrowRightIcon } from '@/components/ui/Icon'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PROJECTS, type ProjectMeta } from '@/data/projects'
import { useAnalytics } from '@/hooks/useAnalytics'
import styles from './WorkCatalog.module.css'

const FILTERS = [
  { id: 'all', label: 'All work', matches: () => true },
  { id: 'design-systems', label: 'Design systems', matches: (project: ProjectMeta) => project.category === 'DESIGN SYSTEMS' },
  { id: 'react', label: 'React', matches: (project: ProjectMeta) => project.technologies.some((tech) => tech.toLowerCase().includes('react')) || project.tags.some((tag) => tag.toLowerCase().includes('react')) },
  { id: 'developer-tools', label: 'Developer tools', matches: (project: ProjectMeta) => project.category === 'DEVELOPER TOOLS' || project.category === 'STANDARDS' },
  { id: 'accessibility', label: 'Accessibility', matches: (project: ProjectMeta) => project.category === 'ACCESSIBILITY' || project.technologies.some((tech) => tech.toLowerCase().includes('wcag')) },
  { id: 'open-source', label: 'Open source', matches: (project: ProjectMeta) => project.openSource === true },
  { id: 'health-tech', label: 'Health tech', matches: (project: ProjectMeta) => project.category === 'HEALTH TECH' },
]

const PREVIEWS: Record<string, { src: string; alt: string; caption: string }> = {
  primitree: { src: '/images/primitree-playground-tokens.jpg', alt: 'Primitree Playground showing token collections and configuration.', caption: 'Token configuration in Primitree Playground' },
  'a11y-companion': { src: '/images/a11y-audit-browser-demo.jpg', alt: 'a11y Companion browser demonstration with token audit results and Canvas Record.', caption: 'Token audit and Canvas Record · browser demo' },
  skydio: { src: '/images/skydio-orbit-story.jpg', alt: 'Skydio Autonomy Widget Orbit Mode in Storybook.', caption: 'Orbit Mode · Storybook' },
}

const sortedProjects = [...PROJECTS].sort((a, b) => {
  const priority = Number(Boolean(b.featured)) - Number(Boolean(a.featured))
  return priority || (new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime())
})

function ProjectRow({ project, index }: { project: ProjectMeta; index: number }) {
  const rowRef = useRef<HTMLElement>(null)
  const trackedHover = useRef(false)
  const { trackCaseStudyClick, trackProjectCardHover, trackProjectCardImpression } = useAnalytics()
  const preview = PREVIEWS[project.slug]

  useEffect(() => {
    const element = rowRef.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      trackProjectCardImpression({ project: project.slug, index, location: 'work_catalog' })
      observer.disconnect()
    }, { threshold: 0.4 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [index, project.slug, trackProjectCardImpression])

  return (
    <article ref={rowRef} className={`${styles.project} ${preview ? styles.withPreview : ''}`} onMouseEnter={() => {
      if (trackedHover.current) return
      trackedHover.current = true
      trackProjectCardHover({ project: project.slug, index, location: 'work_catalog' })
    }}>
      <div className={styles.projectMeta}>
        <span>{project.timeline}</span>
        <span>{project.openSource ? 'Open source' : project.category.toLowerCase()}</span>
      </div>
      <div className={styles.projectBody}>
        <h2><Link href={project.route} onClick={() => trackCaseStudyClick({ project: project.slug, category: project.category, route: project.route, source: 'work_catalog' })}>{project.cardTitle}<span aria-hidden='true'><ArrowRightIcon size={20} /></span></Link></h2>
        <p className={styles.summary}>{project.summary}</p>
        <p className={styles.role}>{project.role}</p>
        <ul className={styles.technologies} aria-label={`${project.cardTitle} technologies`}>
          {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
      </div>
      {preview && <figure className={styles.preview}>
        <Image src={preview.src} alt={preview.alt} width={1280} height={720} sizes='(max-width: 740px) calc(100vw - 48px), 320px' />
        <figcaption>{preview.caption}</figcaption>
      </figure>}
    </article>
  )
}

export default function WorkCatalog() {
  const [activeFilter, setActiveFilter] = useState('all')
  const filteredProjects = useMemo(() => sortedProjects.filter((project) => FILTERS.find((filter) => filter.id === activeFilter)!.matches(project)), [activeFilter])

  return (
    <section className={styles.catalog} aria-labelledby='work-title'>
      <header className={styles.header}>
        <h1 id='work-title'>work</h1>
        <p>Design systems and developer tools. The constraints, the implementation, and what I learned building them.</p>
      </header>
      <div className={styles.filters} role='group' aria-label='Filter work by focus'>
        {FILTERS.map((filter) => <button key={filter.id} type='button' aria-pressed={activeFilter === filter.id} onClick={() => setActiveFilter(filter.id)}>{filter.label}</button>)}
      </div>
      <p className={styles.resultCount} role='status'>{filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}{activeFilter !== 'all' && ` · ${FILTERS.find((filter) => filter.id === activeFilter)?.label}`}</p>
      <div className={styles.projects}>
        {filteredProjects.map((project, index) => <ProjectRow key={project.slug} project={project} index={index} />)}
      </div>
    </section>
  )
}

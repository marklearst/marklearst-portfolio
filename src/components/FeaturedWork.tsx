'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PROJECTS } from '@/data/projects'
import { useAnalytics, useSectionViewTracking } from '@/hooks/useAnalytics'
import styles from './Showcase.module.css'

const SHOWCASES = [
  {
    slug: 'primitree',
    label: 'Design token architecture',
    title: 'primitree',
    summary: 'Token architecture rules, Figma-export diffs that preserve identity, and DTCG, CSS, Tailwind, and TypeScript output from one pipeline.',
    note: 'Creator & maintainer · TypeScript / CLI',
    image: '/images/primitree-playground-tokens.jpg',
    alt: 'Primitree Playground displaying token collections and configuration.',
    caption: 'Primitree Playground · token configuration',
    linkLabel: 'See how the rules become a build',
  },
  {
    slug: 'a11y-companion',
    label: 'Accessibility in the design file',
    title: 'a11y companion',
    summary: 'Canvas-native accessibility review for Figma and FigJam. Checklist progress, contrast evidence, and audit findings stay with the file in a refreshable Canvas Record.',
    note: 'Creator & maintainer · 400+ users on Figma Community',
    image: '/images/a11y-audit-browser-demo.jpg',
    alt: 'a11y Companion browser demonstration showing token contrast audit results alongside the Canvas Record.',
    caption: 'Product-site browser demo · token audit and Canvas Record',
    linkLabel: 'See what makes a review go stale',
  },
]

export default function FeaturedWork() {
  const sectionRef = useRef<HTMLElement>(null)
  const { trackCaseStudyClick } = useAnalytics()
  useSectionViewTracking({ ref: sectionRef, section: 'featured_work', data: { location: 'home' } })
  const trackProject = (slug: string) => {
    const project = PROJECTS.find((item) => item.slug === slug)
    if (!project) return
    trackCaseStudyClick({ project: slug, category: project.category, route: project.route, source: 'featured_work' })
  }

  return (
    <section id='work' ref={sectionRef} className={styles.work} aria-labelledby='selected-work-heading'>
      <div className={styles.container}>
        <div className={styles.sectionHeading}>
          <h2 id='selected-work-heading'>selected work</h2>
          <Link href='/work'>All projects <span aria-hidden='true'>↗</span></Link>
        </div>
        {SHOWCASES.map((project, index) => (
          <article key={project.slug} className={`${styles.project} ${index % 2 ? styles.projectReversed : ''}`}>
            <div className={styles.projectContent}>
              <p className={styles.projectIndex}><span>0{index + 1}</span><span>{project.label}</span></p>
              <h3>{project.title}</h3>
              <p className={styles.projectSummary}>{project.summary}</p>
              <p className={styles.projectNote}>{project.note}</p>
              <Link className={styles.caseLink} href={`/work/${project.slug}`} onClick={() => trackProject(project.slug)}>{project.linkLabel} <span aria-hidden='true'>↗</span></Link>
            </div>
            <figure className={styles.figure}>
              <Link className={styles.imageLink} href={`/work/${project.slug}`} aria-label={`Explore ${project.title}`} onClick={() => trackProject(project.slug)}>
                <Image src={project.image} alt={project.alt} width={1280} height={720} sizes='(max-width: 760px) calc(100vw - 48px), (max-width: 1360px) 55vw, 740px' />
              </Link>
              <figcaption className={styles.caption}>{project.caption}<span aria-hidden='true'>↗</span></figcaption>
            </figure>
          </article>
        ))}
        <article className={styles.enterprise}>
          <div className={styles.projectContent}>
            <p className={styles.projectIndex}><span>03</span><span>Design systems at General Motors</span></p>
            <h3>one system.<br />four brands.</h3>
            <p className={styles.projectSummary}>At GM, I architected Aurora for Chevrolet, Buick, GMC, and Cadillac, with 60% component reuse and a WCAG 2.1 AA accessibility target.</p>
            <Link href='/work/aurora-gm' className={styles.caseLink} onClick={() => trackProject('aurora-gm')}>Inside Aurora <span aria-hidden='true'>↗</span></Link>
          </div>
          <figure className={styles.figure}>
            <div className={styles.systemDiagram} role='img' aria-label='Conceptual Aurora architecture: Chevrolet, Buick, GMC, and Cadillac use brand-specific token themes above a shared React component layer.'>
              <div className={styles.diagramLabel}>Aurora / system structure</div>
              <div className={styles.brands}><span>Chevrolet</span><span>Buick</span><span>GMC</span><span>Cadillac</span></div>
              <div className={styles.branches} />
              <div className={styles.sharedLayer}>Brand-specific token themes</div>
              <div className={styles.sharedLayer}>Shared React components</div>
            </div>
            <figcaption className={styles.diagramCaption}>Conceptual architecture diagram. The original internal interface is not shown.</figcaption>
          </figure>
        </article>
        <div className={styles.practice}>
          <div>
            <h3>the workflow behind the work</h3>
            <p>When work repeats, I turn it into an agent workflow with tests and human review before anything ships.</p>
            <Link href='/artifacts/agentic-workflows' className={styles.caseLink}>Read the workflow <span aria-hidden='true'>↗</span></Link>
          </div>
          <ol className={styles.workflow} aria-label='Agent workflow stages'><li>Scope the task</li><li>Build & inspect</li><li>Run the checks</li><li>Human review</li></ol>
        </div>
        <div className={styles.moreWork}>
          <span>More to explore</span>
          <Link href='/work/figmavars-hooks'>FigmaVars Hooks <span aria-hidden='true'>↗</span></Link>
          <Link href='/work/skydio'>Skydio <span aria-hidden='true'>↗</span></Link>
          <Link href='/work/variable-design-standard'>Variable Design Standard <span aria-hidden='true'>↗</span></Link>
          <Link href='/work/diabetic-utils'>Diabetic Utils <span aria-hidden='true'>↗</span></Link>
        </div>
      </div>
    </section>
  )
}

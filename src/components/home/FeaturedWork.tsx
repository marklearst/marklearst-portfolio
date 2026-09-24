import { ArrowRightIcon, ArrowUpRightIcon } from '@/components/ui/Icon'

import Link from 'next/link'
import GlucoseDemo from '@/components/glucose/GlucoseDemo'
import { PROJECTS } from '@/data/projects'
import TrackedLink from '@/components/analytics/TrackedLink'
import SectionViewTracker from '@/components/analytics/SectionViewTracker'
import AuroraArchitecture from '@/components/evidence/AuroraArchitecture'
import WorkFigure from '@/components/work/WorkFigure'
import styles from '@/components/home/FeaturedWork.module.css'

const SHOWCASES = [
  {
    slug: 'primitree',
    title: 'Primitree',
    summary: 'Token architecture rules, Figma-export diffs that preserve identity, and DTCG, CSS, Tailwind, and TypeScript output from one pipeline.',
    note: 'Creator & maintainer · TypeScript / CLI',
    image: '/images/primitree-playground-tokens.jpg',
    alt: 'Primitree Playground displaying token collections and configuration.',
    caption: 'Primitree Playground · token configuration',
    linkLabel: 'View case study',
  },
  {
    slug: 'skydio',
    title: 'Skydio',
    summary: "Built a React mission-control widget implementing Skydio's Rivit design language, with configurable actions, shared state, and Storybook documentation.",
    note: 'Frontend consultant · Component architecture & Storybook',
    image: '/images/skydio-orbit-story.jpg',
    alt: 'Skydio Autonomy Widget Orbit Mode in Storybook.',
    caption: 'Orbit Mode · Storybook',
    linkLabel: 'View case study',
  },
  {
    slug: 'a11y-companion',
    title: 'a11y Companion',
    summary: 'Canvas-native accessibility review for Figma and FigJam. Checklist progress, contrast evidence, and audit findings stay with the file in a refreshable Canvas Record.',
    note: 'Creator & maintainer · 400+ users on Figma Community',
    image: '/images/a11y-audit-browser-demo.jpg',
    alt: 'a11y Companion browser demonstration showing token contrast audit results alongside the Canvas Record.',
    caption: 'Product-site browser demo · token audit and Canvas Record',
    linkLabel: 'View case study',
  },
]

function projectClickEvent(slug: string) {
  const project = PROJECTS.find(item => item.slug === slug)!
  return { type: 'case-study' as const, data: { project: slug, category: project.category, route: project.route, source: 'featured_work' } }
}

export default function FeaturedWork() {
  return (
    <section id='work' className={styles.work} aria-labelledby='selected-work-heading'>
      <SectionViewTracker targetId='work' section='featured_work' location='home' />
      <div className={styles.container}>
        <div className={styles.sectionHeading}>
          <h2 id='selected-work-heading'>Selected work</h2>
          <Link href='/work'>All projects <span aria-hidden='true'><ArrowRightIcon /></span></Link>
        </div>
        <div className={styles.projectGrid}>
        {SHOWCASES.map((project, index) => (
          <article key={project.slug} className={`${styles.project} ${index === 0 ? styles.projectFeatured : ''}`}>
            <h3 className={styles.projectTitle}>{project.title}</h3>
            <WorkFigure
              className={styles.figure}
              href={`/work/${project.slug}`}
              ariaLabel={`Explore ${project.title}`}
              image={{
                src: project.image,
                alt: project.alt,
                width: 1280,
                height: 720,
                sizes: index === 0 ? '(max-width: 800px) calc(100vw - 48px), (max-width: 1360px) 60vw, 770px' : '(max-width: 800px) calc(100vw - 48px), (max-width: 1360px) 45vw, 600px',
              }}
              caption={project.caption}
              trackEvent={projectClickEvent(project.slug)}
            />
            <div className={styles.projectContent}>
              <p className={styles.projectSummary}>{project.summary}</p>
              <p className={styles.projectNote}>{project.note}</p>
              <TrackedLink className={styles.caseLink} href={`/work/${project.slug}`} event={projectClickEvent(project.slug)}>{project.linkLabel} <span aria-hidden='true'><ArrowRightIcon /></span></TrackedLink>
            </div>
          </article>
        ))}
        </div>
        <article className={styles.enterprise}>
          <div className={styles.projectContent}>
            <h3>Aurora at GM</h3>
            <p className={styles.projectSummary}>At GM, I architected Aurora for Chevrolet, Buick, GMC, and Cadillac, with 60% component reuse and a WCAG 2.1 AA accessibility target.</p>
            <TrackedLink href='/work/aurora-gm' className={styles.caseLink} event={projectClickEvent('aurora-gm')}>Inside Aurora <span aria-hidden='true'><ArrowRightIcon /></span></TrackedLink>
          </div>
          <AuroraArchitecture />
        </article>
        <article className={styles.librarySample} aria-labelledby='glucose-sample-heading'>
          <div className={styles.projectContent}>
            <p className={styles.eyebrow}>My library, running here</p>
            <h3 id='glucose-sample-heading'>GlucoseIQ</h3>
            <p className={styles.projectSummary}>Headless TypeScript library for CGM and glucose data. 17 clinical metrics, device connectors, FHIR interop, and SVG rendering over a zero-dependency core.</p>
            <TrackedLink href='/work/glucoseiq' className={styles.caseLink} event={projectClickEvent('glucoseiq')}>GlucoseIQ case study <span aria-hidden='true'><ArrowRightIcon /></span></TrackedLink>
          </div>
          <div className={styles.livePreview}>
            <GlucoseDemo compact />
            <a href='https://github.com/marklearst/marklearst-portfolio/blob/99ed8e2ec1b5c8f1665d893410a39efaee391778/src/lib/glucose-demo.ts' target='_blank' rel='noopener noreferrer' className={styles.previewLink}>View sample source <ArrowUpRightIcon /></a>
          </div>
        </article>
        <div className={styles.moreWork}>
          <span>More to explore</span>
          <Link href='/work/figmavars-hooks'>FigmaVars Hooks <span aria-hidden='true'><ArrowRightIcon /></span></Link>
          <Link href='/work/hailstorm'>Hailstorm <span aria-hidden='true'><ArrowRightIcon /></span></Link>
          <Link href='/work/variable-design-standard'>Variable Design Standard <span aria-hidden='true'><ArrowRightIcon /></span></Link>
          <Link href='/work/diabetic-utils'>Diabetic Utils <span aria-hidden='true'><ArrowRightIcon /></span></Link>
          <Link href='/artifacts/agentic-workflows'>How I use agents <span aria-hidden='true'><ArrowRightIcon /></span></Link>
        </div>
      </div>
    </section>
  )
}

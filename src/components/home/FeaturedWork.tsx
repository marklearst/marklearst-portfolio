import { ArrowRightIcon } from '@/components/ui/Icon'

import ProjectPlate from '@/components/transitions/ProjectPlate'
import { PROJECT_PREVIEWS } from '@/data/project-previews'
import Link from 'next/link'
import { getProjectBySlug, type ProjectMeta } from '@/data/projects'
import TrackedLink from '@/components/analytics/TrackedLink'
import SectionViewTracker from '@/components/analytics/SectionViewTracker'
import ProjectTitle from '@/components/transitions/ProjectTitle'
import WorkBrowser from './WorkBrowser'
import styles from '@/components/home/FeaturedWork.module.css'

// Project identity comes from PROJECTS. Each homepage story leads with a
// specific engineering decision, then links to its evidence in the case study.
const SHOWCASES = [
  {
    project: getProjectBySlug('primitree'),
    discipline: 'Design tokens and developer tooling',
    summary: 'I built Primitree to check which layers own values and which must reference them. It governs this site, from the accent you can change to the motion you can reduce.',
    note: 'Creator and maintainer · TypeScript and design tokens',
  },
  {
    project: getProjectBySlug('skydio'),
    discipline: 'React component architecture',
    summary: 'I built the component architecture for Skydio’s Autonomy Widget. Typed configuration decides the controls; a provider lets the widget or its host own state. The widget shipped in a Skydio software release.',
    note: 'Frontend consultant · Component architecture & Storybook',
  },
  {
    project: getProjectBySlug('a11y-companion'),
    discipline: 'Accessibility in Figma and FigJam',
    summary: 'I built a11y Companion to keep accessibility evidence in Figma and FigJam. Each approval records the checklist state, so changed evidence asks for another review.',
    note: 'Creator and maintainer · Figma and FigJam',
  },
]

function projectClickEvent(project: ProjectMeta) {
  return { type: 'case-study' as const, data: { project: project.slug, category: project.category, route: project.route, source: 'featured_work' } }
}

export default function FeaturedWork() {
  return (
    <section id='work' tabIndex={-1} className={styles.work} aria-labelledby='selected-work-heading'>
      <SectionViewTracker targetId='work' section='featured_work' location='home' />
      <div className={styles.container}>
        <div className={styles.sectionHeading}>
          <h2 id='selected-work-heading'>Selected work</h2>
          <Link href='/work'>All projects <span aria-hidden='true'><ArrowRightIcon /></span></Link>
        </div>
        <WorkBrowser items={SHOWCASES.map(({ project, discipline, summary, note }) => ({
          id: project.slug,
          label: project.cardTitle,
          discipline,
          title: <ProjectTitle slug={project.slug}>{project.cardTitle}</ProjectTitle>,
          panel: (
            <>
              <figure className={styles.figure}>
                <TrackedLink data-work-preview className={styles.imageLink} href={project.route} aria-label={`View case study: ${project.cardTitle}`} event={projectClickEvent(project)}>
                  <ProjectPlate slug={project.slug} className={styles.imageViewport} sizes='(max-width: 800px) calc(100vw - 48px), (max-width: 1360px) 64vw, 816px' />
                  <span className={styles.imageAction} aria-hidden='true'><ArrowRightIcon size={20} /></span>
                </TrackedLink>
                <figcaption className={styles.caption}>{PROJECT_PREVIEWS[project.slug]?.caption}</figcaption>
              </figure>
              <div className={styles.projectContent}>
                <p className={styles.projectSummary}>{summary}</p>
                <div className={styles.projectFoot}>
                  <p className={styles.projectNote}>{note}</p>
                  <TrackedLink className={styles.caseLink} href={project.route} aria-label={`Read the case study: ${project.cardTitle}`} event={projectClickEvent(project)}>Read the case study <span aria-hidden='true'><ArrowRightIcon /></span></TrackedLink>
                </div>
              </div>
            </>
          ),
        }))} />
      </div>
    </section>
  )
}

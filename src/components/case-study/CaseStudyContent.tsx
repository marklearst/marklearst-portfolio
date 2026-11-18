import ChapterNav from '@/components/navigation/ChapterNav'
import ProjectPlate from '@/components/transitions/ProjectPlate'
import { PROJECT_PREVIEWS } from '@/data/project-previews'
import type { ReactNode } from 'react'
import { ArrowLeftIcon, ArrowUpIcon, ArrowUpRightIcon } from '@/components/ui/Icon'
import DisclosureSummary from '@/components/ui/DisclosureSummary'
import CaseStudyAnalytics from '@/components/analytics/CaseStudyAnalytics'
import TrackedLink from '@/components/analytics/TrackedLink'
import ProjectTitle from '@/components/transitions/ProjectTitle'
import type { ProjectCategory } from '@/data/projects'
import { extractCaseStudySections, type CaseStudySectionData } from '@/components/case-study/case-study-sections'
import Footer from '../shell/Footer'
import type { CaseStudyLinkInput } from '@/lib/content/case-studies'
import { caseStudyLinkIcons } from './CaseStudyLinkIcons'
import styles from './CaseStudyLayout.module.css'
import prose from '@/components/content/Prose.module.css'

export interface CaseStudyContentProps {
  slug: string
  title: string
  category: ProjectCategory
  description: string
  role: string
  timeline: string
  technologies: string[]
  links?: readonly CaseStudyLinkInput[]
  sections?: CaseStudySectionData[]
  impact?: { metric: string; description: string }[]
  children?: ReactNode
  relatedNavigation: ReactNode
}

export default function CaseStudyContent({
  slug,
  title,
  category,
  description,
  role,
  timeline,
  technologies,
  links = [],
  sections,
  impact,
  children,
  relatedNavigation,
}: CaseStudyContentProps) {
  const preview = PROJECT_PREVIEWS[slug]
  const pathname = `/work/${slug}`
  const resolvedSections = sections?.length ? sections : extractCaseStudySections(children)

  const sectionId = (index: number) => `case-study-section-${index + 1}`
  const renderSection = (section: CaseStudySectionData, index: number) => (
    <section
      key={sectionId(index)}
      id={sectionId(index)}
      aria-labelledby={`${sectionId(index)}-heading`}
      data-case-study-section={section.title}
      className={styles.section}
    >
      <div className={styles.sectionHeading}>
        <h2 id={`${sectionId(index)}-heading`}>{section.title}</h2>
      </div>
      <div className={prose.content}>
        {section.content}
      </div>
    </section>
  )

  return (
    <div id={`case-study-${slug}`} className={styles.page}>
      <CaseStudyAnalytics slug={slug} category={category} />
      <main id='main-content'>
        <section data-case-study-hero className={styles.hero} aria-labelledby='case-study-title'>
          <div className={preview ? styles.spread : styles.container}>
            <TrackedLink
              href='/work'
              className={styles.backLink}
              event={{ type: 'navigation', data: {
                action: 'back_to_work',
                from: pathname,
                to: '/work',
                location: 'top',
              } }}
            >
              <ArrowLeftIcon /> Back to work
            </TrackedLink>

            <div className={preview ? styles.opening : undefined}>
              <div>
                <h1 id='case-study-title' className={styles.title}><ProjectTitle slug={slug}>{title}</ProjectTitle></h1>
                <div className={styles.heroGrid}>
                  <div>
                    <p className={styles.description}>{description}</p>

                    {links.length > 0 && (
                      <div className={styles.links}>
                        {links.map((link) => {
                          const LinkIcon = link.icon ? caseStudyLinkIcons[link.icon] : null
                          if (!link.href) {
                            return (
                              <span key={link.label} className={styles.disabledLink}>
                                {LinkIcon && <LinkIcon />}{link.label}
                              </span>
                            )
                          }
                          return (
                            <TrackedLink
                              key={link.label}
                              data-case-study-link={link.label}
                              href={link.href}
                              target='_blank'
                              rel='noopener noreferrer'
                              className={styles.projectLink}
                              event={{ type: 'case-study-link', data: {
                                label: link.label,
                                href: link.href,
                                project: slug,
                              } }}
                            >
                              {LinkIcon && <LinkIcon />}
                              {link.label}
                              <ArrowUpRightIcon className={styles.externalArrow} />
                            </TrackedLink>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <div className={styles.context}>
                    <dl className={styles.meta}>
                      <div>
                        <dt>My role</dt>
                        <dd>{role}</dd>
                      </div>
                      <div>
                        <dt>Timeline</dt>
                        <dd>{timeline}</dd>
                      </div>
                    </dl>
                    {technologies.length > 0 && (
                      <details className={styles.technologyDetails}>
                        <DisclosureSummary>Built with</DisclosureSummary>
                        <ul role='list' className={styles.technologies}>
                          {technologies.map((tech) => <li key={tech}>{tech}</li>)}
                        </ul>
                      </details>
                    )}
                  </div>
                </div>
              </div>
              {preview && (
                <figure className={styles.plate}>
                  <ProjectPlate slug={slug} className={styles.plateImage} sizes='(min-width: 900px) 50vw, 90vw' eager />
                  <figcaption>{preview.caption}</figcaption>
                </figure>
              )}
            </div>
          </div>
        </section>

        <div className={styles.body}>
          <div className={styles.container}>
            {resolvedSections.length > 2 && (
              <ChapterNav label='In this case study' chapters={resolvedSections.map((section, index) => ({ id: sectionId(index), label: section.title }))} />
            )}

            {resolvedSections.map(renderSection)}

            {impact && impact.length > 0 && (
              <section
                data-case-study-impact
                className={styles.impact}
                aria-labelledby='case-study-facts'
              >
                <h2 id='case-study-facts' className={styles.factsTitle}>Project notes</h2>
                <div className={styles.impactGrid}>
                  {impact.map((item, index) => (
                    <div
                      key={`${item.metric}-${index}`}
                      data-case-study-metric={item.metric}
                    >
                      <p className={styles.metric}>{item.metric}</p>
                      <p className={styles.metricDescription}>{item.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div data-reading-end>{relatedNavigation}</div>

            <nav className={styles.endNavigation} aria-label='Case study controls'>
              <TrackedLink
                href='/work'
                className={styles.backLink}
                event={{ type: 'navigation', data: {
                  action: 'back_to_work',
                  from: pathname,
                  to: '/work',
                  location: 'bottom',
                } }}
              >
                <ArrowLeftIcon /> Back to work
              </TrackedLink>
              <a href='#case-study-title' className={styles.backLink}>Back to top <ArrowUpIcon /></a>
            </nav>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

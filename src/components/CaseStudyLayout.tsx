'use client'

import { ArrowLeftIcon, ArrowUpIcon, ArrowUpRightIcon } from '@/components/ui/Icon'
import DisclosureSummary from '@/components/ui/DisclosureSummary'

import {
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import type { ProjectCategory, ProjectCategoryColor } from '@/data/projects'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Footer from './Footer'
import { useAnalytics, useSectionViewTracking } from '@/hooks/useAnalytics'
import { CaseStudySection as CaseStudySectionMarker } from '@/components/CaseStudySection'
import styles from './CaseStudyLayout.module.css'

interface CaseStudySectionData {
  title: string
  content: ReactNode
}

interface CaseStudyLayoutProps {
  title: string
  category: ProjectCategory
  categoryColor: ProjectCategoryColor
  description: string
  role: string
  timeline: string
  technologies: string[]
  links?: { label: string; href: string; icon?: ReactNode }[]
  sections?: CaseStudySectionData[]
  impact?: { metric: string; description: string }[]
  gradient: string
  children?: ReactNode
}

export default function CaseStudyLayout({
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
}: CaseStudyLayoutProps) {
  const {
    trackNavigationClick,
    trackCaseStudyLinkClick,
    getLinkTypeFromUrl,
    trackCaseStudyView,
    trackCaseStudySectionView,
    trackCaseStudyLinkImpression,
    trackCaseStudyImpactView,
    trackCaseStudySectionDwell,
    getDwellBucket,
  } = useAnalytics()
  const pathname = usePathname()
  const projectSlug = pathname.split('/').pop() || 'unknown'
  const heroRef = useRef<HTMLElement | null>(null)
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const impactRefs = useRef<Array<HTMLDivElement | null>>([])
  const sectionRefs = useRef<Array<HTMLElement | null>>([])
  const impactSectionRef = useRef<HTMLElement | null>(null)
  const trackedLinkImpressionsRef = useRef<Set<number>>(new Set())
  const trackedImpactViewsRef = useRef<Set<number>>(new Set())
  const sectionDwellStartRef = useRef<Map<number, number>>(new Map())
  const trackedSectionDwellRef = useRef<Set<number>>(new Set())
  const resolvedSections = useMemo(() => {
    if (sections && sections.length > 0) {
      return sections
    }

    const extracted: CaseStudySectionData[] = []
    const collectSections = (node: ReactNode) => {
      if (Array.isArray(node)) {
        node.forEach(collectSections)
        return
      }
      if (!isValidElement(node)) return
      const element = node as React.ReactElement<{
        title?: string
        children?: ReactNode
      }>

      if (element.type === CaseStudySectionMarker) {
        const { title: sectionTitle, children: sectionContent } = element.props

        if (sectionTitle) {
          extracted.push({
            title: sectionTitle,
            content: sectionContent ?? null,
          })
        }
        return
      }

      if (element.props.children !== undefined) {
        collectSections(element.props.children)
      }
    }

    collectSections(children)

    return extracted
  }, [children, sections])

  useEffect(() => {
    trackCaseStudyView({
      project: projectSlug,
      category,
      route: pathname,
    })
  }, [trackCaseStudyView, projectSlug, category, pathname])

  useSectionViewTracking({
    ref: heroRef,
    section: 'case_study_hero',
    data: { project: projectSlug },
  })

  useSectionViewTracking({
    ref: impactSectionRef,
    section: 'case_study_impact',
    data: { project: projectSlug },
  })

  useEffect(() => {
    trackedLinkImpressionsRef.current.clear()
    trackedImpactViewsRef.current.clear()
    trackedSectionDwellRef.current.clear()
    sectionDwellStartRef.current.clear()
  }, [projectSlug])

  useEffect(() => {
    if (links.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const index = linkRefs.current.findIndex(
            (link) => link === entry.target,
          )
          if (index === -1) return
          if (trackedLinkImpressionsRef.current.has(index)) return

          const link = links[index]
          if (!link || !link.href) return

          trackedLinkImpressionsRef.current.add(index)
          trackCaseStudyLinkImpression({
            label: link.label,
            href: link.href,
            project: projectSlug,
            linkType: getLinkTypeFromUrl(link.href),
          })
        })
      },
      { threshold: 0.6 },
    )

    linkRefs.current.forEach((link) => {
      if (link) observer.observe(link)
    })

    return () => {
      observer.disconnect()
    }
  }, [links, projectSlug, trackCaseStudyLinkImpression, getLinkTypeFromUrl])

  useEffect(() => {
    if (!impact || impact.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const index = impactRefs.current.findIndex(
            (node) => node === entry.target,
          )
          if (index === -1) return
          if (trackedImpactViewsRef.current.has(index)) return

          const metric = impact[index]?.metric
          if (!metric) return

          trackedImpactViewsRef.current.add(index)
          trackCaseStudyImpactView({
            project: projectSlug,
            metric,
            index,
          })
        })
      },
      { threshold: 0.6 },
    )

    impactRefs.current.forEach((node) => {
      if (node) observer.observe(node)
    })

    return () => {
      observer.disconnect()
    }
  }, [impact, projectSlug, trackCaseStudyImpactView])

  useEffect(() => {
    if (sectionRefs.current.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = sectionRefs.current.findIndex(
            (node) => node === entry.target,
          )
          if (index === -1) return

          if (entry.isIntersecting) {
            sectionDwellStartRef.current.set(index, performance.now())
            return
          }

          const start = sectionDwellStartRef.current.get(index)
          if (!start) return
          if (trackedSectionDwellRef.current.has(index)) return

          const seconds = (performance.now() - start) / 1000
          if (seconds < 3) return

          const sectionTitle =
            resolvedSections[index]?.title ?? `section_${index + 1}`
          trackedSectionDwellRef.current.add(index)
          trackCaseStudySectionDwell({
            project: projectSlug,
            section: sectionTitle,
            index,
            dwellBucket: getDwellBucket(seconds),
          })
        })
      },
      { threshold: 0, rootMargin: '-15% 0px -35% 0px' },
    )

    sectionRefs.current.forEach((node) => {
      if (node) observer.observe(node)
    })

    return () => {
      observer.disconnect()
    }
  }, [
    resolvedSections,
    projectSlug,
    trackCaseStudySectionDwell,
    getDwellBucket,
  ])

  useEffect(() => {
    const seen = new Set<number>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const index = sectionRefs.current.findIndex(
            (node) => node === entry.target,
          )
          if (index === -1 || seen.has(index)) return
          seen.add(index)
          trackCaseStudySectionView({
            project: projectSlug,
            section: resolvedSections[index]?.title ?? `section_${index + 1}`,
            index,
          })
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section)
    })
    return () => observer.disconnect()
  }, [projectSlug, resolvedSections, trackCaseStudySectionView])

  const sectionId = (index: number) => `case-study-section-${index + 1}`
  const renderSection = (section: CaseStudySectionData, index: number) => (
    <section
      key={sectionId(index)}
      id={sectionId(index)}
      aria-labelledby={`${sectionId(index)}-heading`}
      ref={(node) => {
        sectionRefs.current[index] = node
      }}
      className={styles.section}
    >
      <div className={styles.sectionHeading}>
        <h2 id={`${sectionId(index)}-heading`}>{section.title}</h2>
      </div>
      <div className={styles.content}>
        {section.content}
      </div>
    </section>
  )

  return (
    <div className={styles.page}>
      <main id='main-content'>
        <section ref={heroRef} className={styles.hero} aria-labelledby='case-study-title'>
          <div className={`${styles.container} relative`}>
            <Link
              href='/work'
              className={styles.backLink}
              aria-label='Back to work'
              onClick={() => {
                trackNavigationClick({
                  action: 'back_to_work',
                  from: pathname,
                  to: '/work',
                  location: 'top',
                })
              }}
            >
              <ArrowLeftIcon /> ../work
            </Link>

            <h1 id='case-study-title' className={styles.title}>{title}</h1>
            <p className={styles.description}>{description}</p>

            {links.length > 0 && (
              <div className={styles.links}>
                {links.map((link, index) => {
                  if (!link.href) {
                    return (
                      <span key={link.label} className={styles.disabledLink}>
                        {link.icon}{link.label}
                      </span>
                    )
                  }
                  return (
                    <a
                      key={link.label}
                      ref={(node) => {
                        linkRefs.current[index] = node
                      }}
                      href={link.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className={styles.projectLink}
                      onClick={() => {
                        trackCaseStudyLinkClick({
                          label: link.label,
                          href: link.href,
                          project: projectSlug,
                          linkType: getLinkTypeFromUrl(link.href),
                        })
                      }}
                    >
                      {link.icon}
                      {link.label}
                      <ArrowUpRightIcon className={styles.externalArrow} />
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <div className={styles.body}>
          <div className={styles.container}>
            {resolvedSections[0] && renderSection(resolvedSections[0], 0)}

            <dl className={styles.meta}>
              <div>
                <dt>My role</dt>
                <dd>{role}</dd>
              </div>
              <div>
                <dt>Timeline</dt>
                <dd>{timeline}</dd>
              </div>
              <div>
                <dt>Built with</dt>
                <dd className={styles.technologies}>
                  {technologies.map((tech) => <span key={tech}>{tech}</span>)}
                </dd>
              </div>
            </dl>

            {resolvedSections.length > 2 && (
              <details className={styles.contents}>
                <DisclosureSummary>In this case study</DisclosureSummary>
                <nav aria-label={`${title} case study contents`}>
                  <ol>
                    {resolvedSections.map((section, index) => (
                      <li key={sectionId(index)}>
                        <a href={`#${sectionId(index)}`}>{section.title}</a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </details>
            )}

            {resolvedSections.slice(1).map((section, index) => renderSection(section, index + 1))}

            {impact && impact.length > 0 && (
              <section
                ref={impactSectionRef}
                className={styles.impact}
                aria-labelledby='case-study-facts'
              >
                <h2 id='case-study-facts' className={styles.factsTitle}>Project notes</h2>
                <div className={styles.impactGrid}>
                  {impact.map((item, index) => (
                    <div
                      key={`${item.metric}-${index}`}
                      ref={(node) => {
                        impactRefs.current[index] = node
                      }}
                    >
                      <p className={styles.metric}>{item.metric}</p>
                      <p className={styles.metricDescription}>{item.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <nav className={styles.endNavigation} aria-label='More projects'>
              <Link
                href='/work'
                className={styles.backLink}
                aria-label='Back to work'
                onClick={() => {
                  trackNavigationClick({
                    action: 'back_to_work',
                    from: pathname,
                    to: '/work',
                    location: 'bottom',
                  })
                }}
              >
                <ArrowLeftIcon /> ../work
              </Link>
              <a href='#case-study-title' className={styles.backLink}>Back to top <ArrowUpIcon /></a>
            </nav>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

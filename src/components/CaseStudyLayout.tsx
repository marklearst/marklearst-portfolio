'use client'

import { isValidElement, useEffect, useMemo, useRef, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { ProjectCategory, ProjectCategoryColor } from '@/data/projects'
import { getCategoryColor, getCategoryIcon } from '@/lib/project-categories'
import { MONOKAI } from '@/lib/monokai-colors'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Footer from './Footer'
import { useAnalytics, useSectionViewTracking } from '@/hooks/useAnalytics'
import { CaseStudySection as CaseStudySectionMarker } from '@/components/CaseStudySection'

gsap.registerPlugin(ScrollTrigger)

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
  categoryColor,
  description,
  role,
  timeline,
  technologies,
  links = [],
  sections,
  impact,
  gradient,
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
  const pageRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const categoryTone = getCategoryColor(categoryColor)
  const categoryRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const metaRefs = useRef<Array<HTMLDivElement | null>>([])
  const linksRef = useRef<HTMLDivElement>(null)
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const impactRefs = useRef<Array<HTMLDivElement | null>>([])
  const sectionRefs = useRef<Array<HTMLDivElement | null>>([])
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
      { threshold: 0.55 },
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
    const ctx = gsap.context(() => {
      // Hero animations
      const tl = gsap.timeline({ delay: 0.2 })
      const categoryEl = categoryRef.current
      const titleEl = titleRef.current
      const descriptionEl = descriptionRef.current
      const metaEls = [...metaRefs.current, linksRef.current].filter(
        (item): item is HTMLDivElement => Boolean(item),
      )
      const contentSections = [
        impactSectionRef.current,
        ...sectionRefs.current,
      ].filter((item): item is HTMLElement => Boolean(item))

      if (!categoryEl || !titleEl || !descriptionEl) {
        return
      }

      tl.fromTo(
        categoryEl,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      )

      tl.fromTo(
        titleEl,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.4',
      )

      tl.fromTo(
        descriptionEl,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.4',
      )

      if (metaEls.length > 0) {
        tl.fromTo(
          metaEls,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
          },
          '-=0.3',
        )
      }

      // Section reveals
      contentSections.forEach((section) => {
        gsap.set(section, { y: 100 })
        gsap.to(section, {
          scrollTrigger: {
            trigger: section,
            start: 'top 90%',
            once: true,
          },
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
        })
      })

      sectionRefs.current.forEach((section, index) => {
        if (!section) return
        const sectionTitle =
          resolvedSections[index]?.title ?? `section_${index + 1}`
        ScrollTrigger.create({
          trigger: section,
          start: 'top 92%',
          once: true,
          onEnter: () => {
            trackCaseStudySectionView({
              project: projectSlug,
              section: sectionTitle,
              index,
            })
          },
        })
      })
    }, pageRef)

    return () => ctx.revert()
  }, [projectSlug, resolvedSections, trackCaseStudySectionView])

  return (
    <div
      ref={pageRef}
      className='min-h-screen'
      style={{ backgroundColor: MONOKAI.background }}
    >
      {/* Hero Section */}
      <section
        ref={heroRef}
        className='relative pt-40 pb-20 px-6 overflow-hidden'
      >
        {/* Background gradient */}
        <div className='absolute inset-0 opacity-20'>
          <div
            className={`absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] bg-linear-to-br ${gradient}`}
          />
        </div>

        <div className='max-w-5xl mx-auto relative z-10'>
          {/* Back button */}
          <Link
            href='/work'
            onClick={() => {
              trackNavigationClick({
                action: 'back_to_work',
                from: pathname,
                to: '/work',
                location: 'top',
              })
            }}
            className='inline-flex items-center gap-2 mb-12 font-mono text-sm transition-colors duration-300 group'
            style={{ color: `${MONOKAI.foreground}80` }}
          >
            <svg
              className='w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
            Back to work
          </Link>

          {/* Category */}
          <div
            ref={categoryRef}
            className='flex items-center gap-3 mb-6 opacity-0'
          >
            <div style={{ color: categoryTone }}>
              {getCategoryIcon(category)}
            </div>
            <span
              className='text-xs font-mono uppercase tracking-wider'
              style={{ color: categoryTone }}
            >
              {category}
            </span>
          </div>

          {/* Title */}
          <h1
            ref={titleRef}
            className='text-[clamp(48px,8vw,96px)] font-mono font-bold! lowercase leading-[0.9] mb-8 opacity-0'
            style={{ color: MONOKAI.foreground }}
          >
            {title}
          </h1>

          {/* Description */}
          <p
            ref={descriptionRef}
            className='text-[clamp(20px,2.5vw,28px)] leading-relaxed mb-16 max-w-3xl opacity-0'
            style={{ color: `${MONOKAI.foreground}cc` }}
          >
            {description}
          </p>

          {/* Meta Grid */}
          <div className='grid md:grid-cols-3 gap-8 mb-12'>
            <div
              ref={(node) => {
                metaRefs.current[0] = node
              }}
              className='opacity-0'
            >
              <div
                className='text-xs font-mono uppercase tracking-wider mb-2'
                style={{ color: `${MONOKAI.foreground}50` }}
              >
                Role
              </div>
              <div
                className='text-base font-mono'
                style={{ color: `${MONOKAI.foreground}cc` }}
              >
                {role}
              </div>
            </div>

            <div
              ref={(node) => {
                metaRefs.current[1] = node
              }}
              className='opacity-0'
            >
              <div
                className='text-xs font-mono uppercase tracking-wider mb-2'
                style={{ color: `${MONOKAI.foreground}50` }}
              >
                Timeline
              </div>
              <div
                className='text-base font-mono'
                style={{ color: `${MONOKAI.foreground}cc` }}
              >
                {timeline}
              </div>
            </div>

            <div
              ref={(node) => {
                metaRefs.current[2] = node
              }}
              className='opacity-0'
            >
              <div
                className='text-xs font-mono uppercase tracking-wider mb-2'
                style={{ color: `${MONOKAI.foreground}50` }}
              >
                Technologies
              </div>
              <div className='flex flex-wrap gap-2'>
                {technologies.map((tech) => (
                  <span
                    key={tech}
                    className='px-2 py-1 text-xs font-mono rounded'
                    style={{
                      backgroundColor: `${categoryTone}20`,
                      color: categoryTone,
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Links */}
          {links.length > 0 && (
            <div ref={linksRef} className='flex flex-wrap gap-4 opacity-0'>
              {links.map((link, index) => {
                const isDisabled = !link.href || link.href === ''

                return (
                  <a
                    key={link.label}
                    ref={(node) => {
                      linkRefs.current[index] = node
                    }}
                    href={isDisabled ? undefined : link.href}
                    target={isDisabled ? undefined : '_blank'}
                    rel={isDisabled ? undefined : 'noopener noreferrer'}
                    className='inline-flex items-center gap-2 px-4 py-2 font-mono text-sm rounded-lg transition-all duration-300'
                    style={{
                      backgroundColor: `${categoryTone}20`,
                      color: categoryTone,
                      border: `1px solid ${categoryTone}40`,
                      opacity: isDisabled ? 0.5 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      transform: isDisabled ? 'none' : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (!isDisabled) {
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isDisabled) {
                        e.currentTarget.style.transform = 'scale(1)'
                      }
                    }}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault()
                      } else {
                        trackCaseStudyLinkClick({
                          label: link.label,
                          href: link.href,
                          project: projectSlug,
                          linkType: getLinkTypeFromUrl(link.href),
                        })
                      }
                    }}
                  >
                    {link.icon}
                    {link.label}
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Impact Section */}
      {impact && impact.length > 0 && (
        <section ref={impactSectionRef} className='py-6 px-6 opacity-0'>
          {/* Subtle divider line matching content width */}
          <div className='max-w-5xl mx-auto mb-6'>
            <div
              className='h-px w-full'
              style={{ backgroundColor: `${MONOKAI.foreground}15` }}
            />
          </div>
          <div className='max-w-5xl mx-auto'>
            <h2
              className='text-sm font-mono uppercase tracking-wider mb-4'
              style={{ color: `${MONOKAI.foreground}50` }}
            >
              Impact
            </h2>
            <div className='grid md:grid-cols-3 gap-6'>
              {impact.map((item, index) => (
                <div
                  key={index}
                  ref={(node) => {
                    impactRefs.current[index] = node
                  }}
                >
                  {/* was text-[clamp(32px,5vw,48px)] */}
                  <div
                    className='text-[clamp(28px,4vw,42px)] font-mono font-bold mb-3'
                    style={{ color: categoryTone }}
                  >
                    {item.metric}
                  </div>
                  <p
                    className='text-sm leading-relaxed'
                    style={{ color: `${MONOKAI.foreground}80` }}
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {/* Bottom divider line matching content width */}
          <div className='max-w-5xl mx-auto mt-6'>
            <div
              className='h-px w-full'
              style={{ backgroundColor: `${MONOKAI.foreground}15` }}
            />
          </div>
        </section>
      )}

      {/* Content Sections */}
      <section className='py-8 px-6'>
        <div className='max-w-5xl mx-auto space-y-10'>
          {resolvedSections.map((section, index) => (
            <div
              key={index}
              ref={(node) => {
                sectionRefs.current[index] = node
              }}
              className='opacity-0'
            >
              <h2
                className='text-[clamp(28px,4vw,42px)] font-mono lowercase mb-8'
                style={{ color: MONOKAI.foreground }}
              >
                {section.title}
              </h2>
              <div
                className='prose prose-invert max-w-none'
                style={{ color: `${MONOKAI.foreground}cc` }}
              >
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation Footer */}
      <section className='py-16 px-6'>
        {/* Subtle divider line matching content width */}
        <div className='max-w-5xl mx-auto mb-16'>
          <div
            className='h-px w-full'
            style={{ backgroundColor: `${MONOKAI.foreground}10` }}
          />
        </div>
        <div className='max-w-5xl mx-auto flex justify-center'>
          <Link
            href='/work'
            onClick={() => {
              trackNavigationClick({
                action: 'back_to_work',
                from: pathname,
                to: '/work',
                location: 'bottom',
              })
            }}
            className='inline-flex items-center gap-2 px-6 py-3 font-mono text-sm rounded-lg transition-all duration-300 hover:scale-105'
            style={{
              backgroundColor: `${MONOKAI.foreground}10`,
              color: MONOKAI.foreground,
            }}
          >
            <svg
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
            View all work
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

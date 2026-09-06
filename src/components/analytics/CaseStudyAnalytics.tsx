'use client'

import { useEffect } from 'react'
import {
  getDwellBucket,
  getLinkTypeFromUrl,
  trackCaseStudyImpactView,
  trackCaseStudyLinkImpression,
  trackCaseStudySectionDwell,
  trackCaseStudySectionView,
  trackCaseStudyView,
  trackSectionView,
} from '@/lib/analytics'

interface CaseStudyAnalyticsProps {
  slug: string
  category: string
}

/** Observes server-rendered content without serializing its React tree into this island. */
export default function CaseStudyAnalytics({ slug, category }: CaseStudyAnalyticsProps) {
  useEffect(() => {
    const route = `/work/${slug}`
    trackCaseStudyView({ project: slug, category, route })

    const root = document.getElementById(`case-study-${slug}`)
    if (!root || typeof IntersectionObserver === 'undefined') return

    const sectionMetadata = new Map(
      Array.from(root.querySelectorAll<HTMLElement>('[data-case-study-section]'), (node, index) => [
        node,
        { index, title: node.dataset.caseStudySection || `section_${index + 1}` },
      ] as const),
    )
    const metricMetadata = new Map(
      Array.from(root.querySelectorAll<HTMLElement>('[data-case-study-metric]'), (node, index) => [
        node,
        { index, metric: node.dataset.caseStudyMetric || '' },
      ] as const),
    )

    const trackedRegions = new Set<Element>()
    const regionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || trackedRegions.has(entry.target)) return
        trackedRegions.add(entry.target)
        trackSectionView({
          section: entry.target.hasAttribute('data-case-study-hero') ? 'case_study_hero' : 'case_study_impact',
          route,
          project: slug,
        })
        regionObserver.unobserve(entry.target)
      })
    }, { threshold: 0.35 })
    root.querySelectorAll('[data-case-study-hero], [data-case-study-impact]').forEach(node => regionObserver.observe(node))

    const trackedImpressions = new Set<Element>()
    const impressionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || trackedImpressions.has(entry.target)) return
        trackedImpressions.add(entry.target)

        if (entry.target.hasAttribute('data-case-study-link')) {
          const href = entry.target.getAttribute('href') || ''
          if (href) trackCaseStudyLinkImpression({
            project: slug,
            label: entry.target.getAttribute('data-case-study-link') || '',
            href,
            linkType: getLinkTypeFromUrl(href),
          })
        } else {
          const item = metricMetadata.get(entry.target as HTMLElement)
          if (item?.metric) trackCaseStudyImpactView({ project: slug, ...item })
        }
        impressionObserver.unobserve(entry.target)
      })
    }, { threshold: 0.6 })
    root.querySelectorAll('[data-case-study-link], [data-case-study-metric]').forEach(node => impressionObserver.observe(node))

    const trackedSections = new Set<Element>()
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const section = sectionMetadata.get(entry.target as HTMLElement)
        if (!section || !entry.isIntersecting || trackedSections.has(entry.target)) return
        trackedSections.add(entry.target)
        trackCaseStudySectionView({ project: slug, section: section.title, index: section.index })
        sectionObserver.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -8% 0px' })

    const dwellStarts = new Map<Element, number>()
    const trackedDwell = new Set<Element>()
    const dwellObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const section = sectionMetadata.get(entry.target as HTMLElement)
        if (!section || trackedDwell.has(entry.target)) return
        if (entry.isIntersecting) {
          if (!dwellStarts.has(entry.target)) dwellStarts.set(entry.target, performance.now())
          return
        }

        const start = dwellStarts.get(entry.target)
        dwellStarts.delete(entry.target)
        if (start === undefined) return
        const seconds = (performance.now() - start) / 1000
        if (seconds < 3) return

        trackedDwell.add(entry.target)
        trackCaseStudySectionDwell({
          project: slug,
          section: section.title,
          index: section.index,
          dwellBucket: getDwellBucket(seconds),
        })
        dwellObserver.unobserve(entry.target)
      })
    }, { threshold: 0, rootMargin: '-15% 0px -35% 0px' })

    sectionMetadata.forEach((_, node) => {
      sectionObserver.observe(node)
      dwellObserver.observe(node)
    })

    return () => {
      regionObserver.disconnect()
      impressionObserver.disconnect()
      sectionObserver.disconnect()
      dwellObserver.disconnect()
      dwellStarts.clear()
    }
  }, [slug, category])

  return null
}

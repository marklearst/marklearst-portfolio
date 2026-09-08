import CaseStudyContent, { type CaseStudyContentProps } from './CaseStudyContent'
import RelatedNavigation from '../navigation/RelatedNavigation'
import { PROJECTS_IN_DISPLAY_ORDER } from '@/data/projects'
import { getAdjacentContent } from '@/lib/content/adjacent-content'

type CaseStudyLayoutProps = Omit<CaseStudyContentProps, 'relatedNavigation'>

export default function CaseStudyLayout({ slug, ...props }: CaseStudyLayoutProps) {
  const { previous, next } = getAdjacentContent(PROJECTS_IN_DISPLAY_ORDER, slug)

  return (
    <CaseStudyContent
      {...props}
      slug={slug}
      relatedNavigation={
        <RelatedNavigation
          itemType='case study'
          previous={previous ? { href: previous.route, title: previous.title } : null}
          next={next ? { href: next.route, title: next.title } : null}
        />
      }
    />
  )
}

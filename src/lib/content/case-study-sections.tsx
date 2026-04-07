import { isValidElement, type ReactNode } from 'react'
import { CaseStudySection as CaseStudySectionMarker } from '@/components/CaseStudySection'

export type CaseStudySectionData = {
  title: string
  content: ReactNode
}

export const extractCaseStudySections = (
  node: ReactNode,
): CaseStudySectionData[] => {
  const sections: CaseStudySectionData[] = []

  const collectSections = (child: ReactNode) => {
    if (Array.isArray(child)) {
      child.forEach(collectSections)
      return
    }
    if (!isValidElement(child)) return
    const element = child as React.ReactElement<{
      title?: string
      children?: ReactNode
    }>

    if (element.type === CaseStudySectionMarker) {
      const { title, children } = element.props

      if (title) {
        sections.push({ title, content: children ?? null })
      }
      return
    }

    if (element.props.children !== undefined) {
      collectSections(element.props.children)
    }
  }

  collectSections(node)

  return sections
}

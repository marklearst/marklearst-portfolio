import CaseStudyPage, { getCaseStudyMetadata } from '@/components/case-study/CaseStudyPage'

export function generateMetadata() {
  return getCaseStudyMetadata('a11y-companion')
}

export default function A11yCompanionPage() {
  return <CaseStudyPage slug='a11y-companion' />
}

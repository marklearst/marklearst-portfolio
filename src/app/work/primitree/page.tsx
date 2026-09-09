import CaseStudyPage, { getCaseStudyMetadata } from '@/components/case-study/CaseStudyPage'

export function generateMetadata() {
  return getCaseStudyMetadata('primitree')
}

export default function PrimitreePage() {
  return <CaseStudyPage slug='primitree' />
}

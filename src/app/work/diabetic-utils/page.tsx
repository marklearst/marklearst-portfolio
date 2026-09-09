import CaseStudyPage, { getCaseStudyMetadata } from '@/components/case-study/CaseStudyPage'

export function generateMetadata() {
  return getCaseStudyMetadata('diabetic-utils')
}

export default function DiabeticUtilsPage() {
  return <CaseStudyPage slug='diabetic-utils' />
}

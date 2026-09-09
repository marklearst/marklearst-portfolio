import CaseStudyPage, { getCaseStudyMetadata } from '@/components/case-study/CaseStudyPage'

export function generateMetadata() {
  return getCaseStudyMetadata('hailstorm')
}

export default function HailstormPage() {
  return <CaseStudyPage slug='hailstorm' />
}

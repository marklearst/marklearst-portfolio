import CaseStudyPage, { getCaseStudyMetadata } from '@/components/case-study/CaseStudyPage'

export function generateMetadata() {
  return getCaseStudyMetadata('aurora-gm')
}

export default function AuroraGMPage() {
  return <CaseStudyPage slug='aurora-gm' />
}

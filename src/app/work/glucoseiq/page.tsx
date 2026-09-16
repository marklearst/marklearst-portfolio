import CaseStudyPage, { getCaseStudyMetadata } from '@/components/case-study/CaseStudyPage'

export function generateMetadata() {
  return getCaseStudyMetadata('glucoseiq')
}

export default function GlucoseIQPage() {
  return <CaseStudyPage slug='glucoseiq' />
}

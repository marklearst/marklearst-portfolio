import CaseStudyPage, { getCaseStudyMetadata } from '@/components/case-study/CaseStudyPage'

export function generateMetadata() {
  return getCaseStudyMetadata('skydio')
}

export default function SkydioPage() {
  return <CaseStudyPage slug='skydio' />
}

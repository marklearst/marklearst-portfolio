import CaseStudyPage, { getCaseStudyMetadata } from '@/components/case-study/CaseStudyPage'

export function generateMetadata() {
  return getCaseStudyMetadata('figmavars-hooks')
}

export default function FigmaVarsHooksPage() {
  return <CaseStudyPage slug='figmavars-hooks' />
}

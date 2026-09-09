import CaseStudyPage, { getCaseStudyMetadata } from '@/components/case-study/CaseStudyPage'

export function generateMetadata() {
  return getCaseStudyMetadata('variable-design-standard')
}

export default function VariableDesignStandardPage() {
  return <CaseStudyPage slug='variable-design-standard' />
}

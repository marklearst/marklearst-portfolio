import CaseStudyPage, { getCaseStudyMetadata } from '@/components/case-study/CaseStudyPage'
import SiteTokenGraph from '@/components/tokens/SiteTokenGraph'

export function generateMetadata() {
  return getCaseStudyMetadata('primitree')
}

export default function PrimitreePage() {
  return <CaseStudyPage slug='primitree' components={{ SiteTokenGraph }} />
}

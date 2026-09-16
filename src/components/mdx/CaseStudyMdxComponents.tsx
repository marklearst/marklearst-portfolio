import type { ComponentPropsWithoutRef } from 'react'
import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import CodeBlock from '@/components/content/CodeBlock'
import GlucoseDemo from '@/components/glucose/GlucoseDemo'
import EvidenceGallery from '@/components/evidence/EvidenceGallery'
import { A11yScenarioDemo } from '@/components/evidence/A11yScenarioDemo'
import { PrimitreeGuardrailDemo } from '@/components/evidence/PrimitreeGuardrailDemo'
import AuroraArchitecture from '@/components/evidence/AuroraArchitecture'
import CaseStudyDetails from '@/components/case-study/CaseStudyDetails'
import { CaseStudySection } from '@/components/case-study/CaseStudySection'
import {
  ProseList as CaseStudyMutedList,
  ProseText as CaseStudyMutedText,
  ProseBlock as CaseStudyParagraph,
  ProseSubheading as CaseStudySubheading,
} from '@/components/content/Prose'
import { proseMdxComponents } from './ProseMdxComponents'

export const caseStudyMdxComponents = {
  ...proseMdxComponents,
  CaseStudySection,
  CaseStudyDetails,
  CaseStudySubheading,
  CaseStudyMutedText,
  CaseStudyParagraph,
  CaseStudyMutedList,
  CodeBlock,
  GlucoseDemo,
  EvidenceGallery,
  A11yScenarioDemo,
  PrimitreeGuardrailDemo,
  AuroraArchitecture,
  Image,
  h3: CaseStudySubheading,
  ul: (props: ComponentPropsWithoutRef<'ul'>) => (
    <CaseStudyMutedList className='space-y-2' {...props} />
  ),
} satisfies MDXComponents

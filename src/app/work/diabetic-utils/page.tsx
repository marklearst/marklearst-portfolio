'use client'

import CaseStudyLayout from '@/components/CaseStudyLayout'
import { GitHubIcon, NpmIcon } from '@/components/CaseStudyLinkIcons'
import {
  CaseStudyMutedList,
  CaseStudyMutedText,
  CaseStudySubheading,
} from '@/components/CaseStudyTypography'
import { getProjectBySlug } from '@/data/projects'
import { getCategoryColor } from '@/lib/project-categories'
import { MONOKAI } from '@/lib/monokai-colors'

export default function DiabeticUtilsPage() {
  const project = getProjectBySlug('diabetic-utils')
  const accent = getCategoryColor(project.categoryColor)

  return (
    <CaseStudyLayout
      title={project.title}
      category={project.category}
      categoryColor={project.categoryColor}
      description={project.description}
      role={project.role}
      timeline={project.timeline}
      technologies={project.technologies}
      links={[
        {
          label: 'GitHub',
          href: 'https://github.com/marklearst/diabetic-utils',
          icon: <GitHubIcon />,
        },
        {
          label: 'npm Package',
          href: 'https://www.npmjs.com/package/diabetic-utils',
          icon: <NpmIcon />,
        },
      ]}
      impact={[
        {
          metric: '100%',
          description:
            'Test coverage with Vitest ensuring clinical calculation accuracy',
        },
        {
          metric: 'Google AI',
          description:
            'Featured in Google AI Overview for diabetes developer tools',
        },
        {
          metric: 'Production',
          description:
            'Adopted by health tech teams for glucose monitoring apps',
        },
      ]}
      gradient={project.caseStudyGradient}
      sections={[
        {
          title: 'The Problem',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                Developers building diabetes management apps face a critical
                challenge: there's no standardized, tested library for glucose
                calculations. This creates:
              </p>
              <CaseStudyMutedList className='space-y-3'>
                <li>
                  Teams reinventing the same glucose conversion algorithms
                  (mg/dL ↔ mmol/L)
                </li>
                <li>
                  A1C calculation formulas copy-pasted from medical papers
                  without validation
                </li>
                <li>
                  Time in Range (TIR) metrics implemented inconsistently across
                  apps
                </li>
                <li>No type-safe APIs for glucose data structures</li>
                <li>
                  Clinical calculation errors that could impact patient care
                </li>
              </CaseStudyMutedList>
              <p className='text-lg leading-relaxed'>
                I built GlucoseIQ (Apple Watch app) and kept rewriting the same
                utility functions. I realized the diabetes developer community
                needed a single, tested, TypeScript library for these
                calculations.
              </p>
            </div>
          ),
        },
        {
          title: 'The Solution',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                <strong>Diabetic Utils</strong> is a TypeScript library
                providing clinical-grade calculations for glucose monitoring,
                A1C estimation, and Time in Range metrics.
              </p>

              <CaseStudySubheading color={accent}>
                Glucose Conversions
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Type-safe functions for converting between mg/dL and mmol/L:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>
                  <code
                    className='text-sm px-2 py-1 rounded'
                    style={{
                      backgroundColor: `${MONOKAI.pink}20`,
                      color: MONOKAI.pink,
                    }}
                  >
                    mgDlToMmolL()
                  </code>{' '}
                  - Convert mg/dL to mmol/L with proper rounding
                </li>
                <li>
                  <code
                    className='text-sm px-2 py-1 rounded'
                    style={{
                      backgroundColor: `${MONOKAI.pink}20`,
                      color: MONOKAI.pink,
                    }}
                  >
                    mmolLToMgDl()
                  </code>{' '}
                  - Convert mmol/L to mg/dL
                </li>
                <li>Handles edge cases and validates input ranges</li>
                <li>
                  Uses standard conversion factor (18.0182) from clinical
                  guidelines
                </li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                A1C Calculations
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Estimated A1C (eA1C) calculation from average glucose using the
                ADAG formula:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>
                  <code
                    className='text-sm px-2 py-1 rounded'
                    style={{
                      backgroundColor: `${MONOKAI.pink}20`,
                      color: MONOKAI.pink,
                    }}
                  >
                    calculateA1C()
                  </code>{' '}
                  - Convert average glucose to estimated A1C percentage
                </li>
                <li>
                  Based on ADAG Study formula: A1C = (avg_glucose + 46.7) / 28.7
                </li>
                <li>Supports both mg/dL and mmol/L input</li>
                <li>Returns A1C as percentage (e.g., 7.2%)</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Time in Range (TIR)
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Calculate TIR metrics following ADA/ATTD consensus guidelines:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>
                  <code
                    className='text-sm px-2 py-1 rounded'
                    style={{
                      backgroundColor: `${MONOKAI.pink}20`,
                      color: MONOKAI.pink,
                    }}
                  >
                    calculateTIR()
                  </code>{' '}
                  - Percentage of readings in target range (70-180 mg/dL)
                </li>
                <li>
                  <code
                    className='text-sm px-2 py-1 rounded'
                    style={{
                      backgroundColor: `${MONOKAI.pink}20`,
                      color: MONOKAI.pink,
                    }}
                  >
                    calculateTBR()
                  </code>{' '}
                  - Time below range (hypoglycemia detection)
                </li>
                <li>
                  <code
                    className='text-sm px-2 py-1 rounded'
                    style={{
                      backgroundColor: `${MONOKAI.pink}20`,
                      color: MONOKAI.pink,
                    }}
                  >
                    calculateTAR()
                  </code>{' '}
                  - Time above range (hyperglycemia detection)
                </li>
                <li>
                  Configurable target ranges for personalized therapy goals
                </li>
                <li>Handles missing data and validates reading counts</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                100% Test Coverage
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Comprehensive test suite with Vitest covering:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>All calculation formulas against known medical values</li>
                <li>
                  Edge cases: boundary values, negative numbers, zero handling
                </li>
                <li>Input validation and error handling</li>
                <li>Precision and rounding behavior</li>
              </CaseStudyMutedList>
            </div>
          ),
        },
        {
          title: 'Technical Implementation',
          content: (
            <div className='space-y-6'>
              <CaseStudySubheading color={accent} className='mt-0'>
                TypeScript-First Design
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Built with TypeScript for type safety:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Strongly typed glucose reading objects</li>
                <li>Enum types for units (mg/dL, mmol/L)</li>
                <li>Generic functions supporting both unit systems</li>
                <li>Full IntelliSense support in IDEs</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Clinical Accuracy
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Formulas validated against clinical sources:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>A1C calculation uses ADAG Study consensus formula</li>
                <li>TIR ranges follow ADA/ATTD 2019 guidelines</li>
                <li>Conversion factors match international standards</li>
                <li>Test cases derived from published medical examples</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Developer Experience
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Designed for ease of use:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Zero dependencies - pure TypeScript implementation</li>
                <li>Tree-shakeable exports for minimal bundle size</li>
                <li>Comprehensive JSDoc documentation</li>
                <li>Published on npm with semantic versioning</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Use Cases
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Powers glucose monitoring features in:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>CGM (Continuous Glucose Monitor) companion apps</li>
                <li>Diabetes management dashboards</li>
                <li>Apple Watch and wearable health apps (like GlucoseIQ)</li>
                <li>HealthKit integration layers</li>
                <li>Clinical research data processing</li>
              </CaseStudyMutedList>
            </div>
          ),
        },
        {
          title: 'Impact & Recognition',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                Diabetic Utils fills a critical gap in the health tech developer
                ecosystem:
              </p>
              <CaseStudyMutedList className='space-y-4'>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Featured in Google AI Overview
                  </strong>{' '}
                  for diabetes developer tools—recognized as a go-to resource
                  for glucose calculations
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Adopted by health tech teams
                  </strong>{' '}
                  building production CGM apps and diabetes management platforms
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    100% test coverage
                  </strong>{' '}
                  ensures clinical calculation accuracy, critical for
                  patient-facing applications
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Type-safe API
                  </strong>{' '}
                  prevents unit confusion bugs (mg/dL vs mmol/L) that plague
                  glucose apps
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Open-source contribution
                  </strong>{' '}
                  to the diabetes developer community, reducing duplicated
                  effort
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Zero dependencies
                  </strong>{' '}
                  makes it safe to adopt in production health apps with strict
                  security requirements
                </li>
              </CaseStudyMutedList>
              <p className='text-lg leading-relaxed mt-8'>
                The library is actively maintained on npm and serves as the
                calculation engine for GlucoseIQ (Apple Watch app) and other
                health tech projects.
              </p>
            </div>
          ),
        },
      ]}
    />
  )
}

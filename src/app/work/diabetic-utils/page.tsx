'use client'

import CaseStudyLayout from '@/components/CaseStudyLayout'
import { getProjectBySlug } from '@/data/projects'
import { MONOKAI } from '@/lib/monokai-colors'

export default function DiabeticUtilsPage() {
  const project = getProjectBySlug('diabetic-utils')

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
          icon: (
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
              <path
                fillRule='evenodd'
                d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
                clipRule='evenodd'
              />
            </svg>
          ),
        },
        {
          label: 'npm Package',
          href: 'https://www.npmjs.com/package/diabetic-utils',
          icon: (
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M0 0v24h6.75v-1.5H18V24h6V0H0zm6.75 22.5H1.5V1.5h21v19.5H19.5v-18h-9v18H6.75v-18h-5.25v21z' />
            </svg>
          ),
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
              <ul
                className='space-y-3 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
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
              </ul>
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

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.pink }}
              >
                Glucose Conversions
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Type-safe functions for converting between mg/dL and mmol/L:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
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
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.pink }}
              >
                A1C Calculations
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Estimated A1C (eA1C) calculation from average glucose using the
                ADAG formula:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
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
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.pink }}
              >
                Time in Range (TIR)
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Calculate TIR metrics following ADA/ATTD consensus guidelines:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
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
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.pink }}
              >
                100% Test Coverage
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Comprehensive test suite with Vitest covering:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>All calculation formulas against known medical values</li>
                <li>
                  Edge cases: boundary values, negative numbers, zero handling
                </li>
                <li>Input validation and error handling</li>
                <li>Precision and rounding behavior</li>
              </ul>
            </div>
          ),
        },
        {
          title: 'Technical Implementation',
          content: (
            <div className='space-y-6'>
              <h3
                className='text-2xl font-mono mb-4'
                style={{ color: MONOKAI.pink }}
              >
                TypeScript-First Design
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Built with TypeScript for type safety:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>Strongly typed glucose reading objects</li>
                <li>Enum types for units (mg/dL, mmol/L)</li>
                <li>Generic functions supporting both unit systems</li>
                <li>Full IntelliSense support in IDEs</li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.pink }}
              >
                Clinical Accuracy
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Formulas validated against clinical sources:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>A1C calculation uses ADAG Study consensus formula</li>
                <li>TIR ranges follow ADA/ATTD 2019 guidelines</li>
                <li>Conversion factors match international standards</li>
                <li>Test cases derived from published medical examples</li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.pink }}
              >
                Developer Experience
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Designed for ease of use:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>Zero dependencies - pure TypeScript implementation</li>
                <li>Tree-shakeable exports for minimal bundle size</li>
                <li>Comprehensive JSDoc documentation</li>
                <li>Published on npm with semantic versioning</li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.pink }}
              >
                Use Cases
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Powers glucose monitoring features in:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>CGM (Continuous Glucose Monitor) companion apps</li>
                <li>Diabetes management dashboards</li>
                <li>Apple Watch and wearable health apps (like GlucoseIQ)</li>
                <li>HealthKit integration layers</li>
                <li>Clinical research data processing</li>
              </ul>
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
              <ul
                className='space-y-4 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
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
              </ul>
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

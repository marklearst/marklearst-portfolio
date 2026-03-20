'use client'

import CaseStudyLayout from '@/components/CaseStudyLayout'
import { MONOKAI } from '@/lib/monokai-colors'

export default function AuroraGMPage() {
  return (
    <CaseStudyLayout
      title='Aurora Design System'
      category='Design Systems'
      categoryColor='cyan'
      description="Built GM's first cross-brand React design system achieving 60% component reuse across 4 brands (Chevy, Buick, GMC, Cadillac) with WCAG 2.1 AA compliance embedded into every component."
      role='Senior Design Engineer, Lead - Authored Design Token Governance Document'
      timeline='Jun 2021 - Sep 2024 (3+ years)'
      technologies={[
        'React',
        'React Native',
        'TypeScript',
        'Storybook 10',
        'Style Dictionary',
        'Design Tokens',
        'WCAG 2.1 AA',
        'Figma Variables',
        'GitHub Actions',
      ]}
      links={[
        {
          label: 'General Motors',
          href: 'https://www.designsystem.gm.com',
          icon: (
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' />
            </svg>
          ),
        },
      ]}
      impact={[
        {
          metric: '60%',
          description:
            'Component reuse across 4 GM brands (Chevy, Buick, GMC, Cadillac)',
        },
        {
          metric: '30%',
          description:
            'Increase in release velocity across web and native platforms',
        },
        {
          metric: '50+',
          description: 'Engineers and designers trained on Aurora adoption',
        },
      ]}
      gradient='from-cyan-500/20 via-teal-500/10 to-transparent'
      sections={[
        {
          title: 'The Challenge',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                General Motors had 4 distinct automotive brands—Chevrolet,
                Buick, GMC, and Cadillac—each with separate design and
                development teams building their own digital experiences. This
                fragmentation created:
              </p>
              <ul
                className='space-y-3 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>
                  Duplicated effort across teams building similar components
                </li>
                <li>
                  Inconsistent user experiences across GM's digital ecosystem
                </li>
                <li>
                  No centralized accessibility strategy or component compliance
                </li>
                <li>Slow release velocity due to repeated work</li>
                <li>Knowledge silos preventing cross-team collaboration</li>
              </ul>
              <p className='text-lg leading-relaxed'>
                The goal was ambitious: create a unified design system that
                could serve all 4 brands while respecting their unique brand
                identities, embedding accessibility from the ground up, and
                dramatically increasing development velocity.
              </p>
            </div>
          ),
        },
        {
          title: 'The Solution',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                I led the design and implementation of <strong>Aurora</strong>
                —GM's first cross-brand design system—serving as the single
                source of truth for React components across web and native
                platforms.
              </p>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.cyan }}
              >
                Cross-Brand Component Architecture
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Built a sophisticated theming system using design tokens that
                allowed 60% of components to be shared across all 4 brands,
                while the remaining 40% could be customized per-brand through
                token overrides. This meant teams could:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>
                  Import core Aurora components that worked out-of-the-box
                </li>
                <li>
                  Apply brand-specific themes via token swaps (colors,
                  typography, spacing)
                </li>
                <li>
                  Extend components only when brand-specific behavior was needed
                </li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.cyan }}
              >
                Token Pipeline Automation
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Designed and built automated token workflows that synced design
                tokens from Figma Variables through Style Dictionary into React
                and React Native codebases. This removed manual handoff steps
                and ensured design-code consistency across all 4 brand teams.
              </p>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.cyan }}
              >
                WCAG 2.1 AA Compliance
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Embedded accessibility into every component from day one. All
                Aurora components shipped with:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>Proper ARIA patterns and semantic HTML</li>
                <li>Keyboard navigation and focus management</li>
                <li>Screen reader testing with NVDA and JAWS</li>
                <li>Color contrast validation (4.5:1 minimum for text)</li>
                <li>Automated accessibility testing in CI/CD pipeline</li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.cyan }}
              >
                Storybook-Driven Development
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Built comprehensive Storybook documentation for every component,
                showcasing all variants, states, and accessibility features.
                This became the central hub for designers, developers, and QA to
                reference Aurora's capabilities.
              </p>
            </div>
          ),
        },
        {
          title: 'Technical Implementation',
          content: (
            <div className='space-y-6'>
              <h3
                className='text-2xl font-mono mb-4'
                style={{ color: MONOKAI.cyan }}
              >
                Multi-Platform Library Strategy
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Unified React and React Native component library strategy that
                increased release velocity by 30%. Components were architected
                to share core logic while platform-specific rendering was
                handled through adapters.
              </p>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.cyan }}
              >
                Token Governance Rollout
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Opened Rosen Studio and established naming conventions, modes,
                and approval rules to keep tokens consistent at scale.
                Implemented semantic token structure (primitive → semantic →
                component tokens) that gave teams flexibility while maintaining
                brand consistency.
              </p>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.cyan }}
              >
                Team Enablement
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Trained and onboarded 50+ engineers and designers on Aurora
                adoption, reducing onboarding time by approximately 40%. Created
                workshops, documentation, and office hours to ensure smooth
                adoption across all brand teams.
              </p>
            </div>
          ),
        },
        {
          title: 'Impact & Outcomes',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                Aurora transformed how GM builds digital experiences:
              </p>
              <ul
                className='space-y-4 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    60% component reuse
                  </strong>{' '}
                  across Chevrolet, Buick, GMC, and Cadillac—eliminating
                  duplicated work and accelerating feature delivery
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    30% faster release velocity
                  </strong>{' '}
                  as teams stopped rebuilding components and started composing
                  from Aurora
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    WCAG 2.1 AA compliance
                  </strong>{' '}
                  embedded into design-to-code workflows, expanding user reach
                  by making all digital experiences accessible
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    40% reduction in onboarding time
                  </strong>{' '}
                  for new engineers and designers joining GM's digital teams
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Unified design-code handoff
                  </strong>{' '}
                  through automated token pipelines, removing manual translation
                  steps
                </li>
              </ul>
              <p className='text-lg leading-relaxed mt-8'>
                Aurora established the foundation for GM's design system
                practice and set the standard for cross-brand component
                architecture, token governance, and accessibility-first
                development.
              </p>
            </div>
          ),
        },
      ]}
    />
  )
}

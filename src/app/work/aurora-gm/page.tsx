'use client'

import CaseStudyLayout from '@/components/CaseStudyLayout'
import { ExternalLinkIcon } from '@/components/CaseStudyLinkIcons'
import {
  CaseStudyMutedList,
  CaseStudyMutedText,
  CaseStudySubheading,
} from '@/components/CaseStudyTypography'
import { getProjectBySlug } from '@/data/projects'
import { getCategoryColor } from '@/lib/project-categories'
import { MONOKAI } from '@/lib/monokai-colors'

export default function AuroraGMPage() {
  const project = getProjectBySlug('aurora-gm')
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
          label: 'Aurora Design System',
          href: 'https://zeroheight.com/8ee82a8f9/v/0/p/64b823-whats-new',
          icon: <ExternalLinkIcon />,
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
      gradient={project.caseStudyGradient}
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
              <CaseStudyMutedList className='space-y-3'>
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
              </CaseStudyMutedList>
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

              <CaseStudySubheading color={accent}>
                Cross-Brand Component Architecture
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Built a sophisticated theming system using design tokens that
                allowed 60% of components to be shared across all 4 brands,
                while the remaining 40% could be customized per-brand through
                token overrides. This meant teams could:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
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
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Token Pipeline Automation
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Designed and built automated token workflows that synced design
                tokens from Figma Variables through Style Dictionary into React
                and React Native codebases. This removed manual handoff steps
                and ensured design-code consistency across all 4 brand teams.
              </CaseStudyMutedText>

              <CaseStudySubheading color={accent}>
                WCAG 2.1 AA Compliance
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Embedded accessibility into every component from day one. All
                Aurora components shipped with:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Proper ARIA patterns and semantic HTML</li>
                <li>Keyboard navigation and focus management</li>
                <li>Screen reader testing with NVDA and JAWS</li>
                <li>Color contrast validation (4.5:1 minimum for text)</li>
                <li>Automated accessibility testing in CI/CD pipeline</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Storybook-Driven Development
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Built comprehensive Storybook documentation for every component,
                showcasing all variants, states, and accessibility features.
                This became the central hub for designers, developers, and QA to
                reference Aurora's capabilities.
              </CaseStudyMutedText>
            </div>
          ),
        },
        {
          title: 'Technical Implementation',
          content: (
            <div className='space-y-6'>
              <CaseStudySubheading color={accent} className='mt-0'>
                Multi-Platform Library Strategy
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Unified React and React Native component library strategy that
                increased release velocity by 30%. Components were architected
                to share core logic while platform-specific rendering was
                handled through adapters.
              </CaseStudyMutedText>

              <CaseStudySubheading color={accent}>
                Token Governance Rollout
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Opened Rosen Studio and established naming conventions, modes,
                and approval rules to keep tokens consistent at scale.
                Implemented semantic token structure (primitive → semantic →
                component tokens) that gave teams flexibility while maintaining
                brand consistency.
              </CaseStudyMutedText>

              <CaseStudySubheading color={accent}>
                Team Enablement
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Trained and onboarded 50+ engineers and designers on Aurora
                adoption, reducing onboarding time by approximately 40%. Created
                workshops, documentation, and office hours to ensure smooth
                adoption across all brand teams.
              </CaseStudyMutedText>
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
              <CaseStudyMutedList className='space-y-4'>
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
              </CaseStudyMutedList>
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

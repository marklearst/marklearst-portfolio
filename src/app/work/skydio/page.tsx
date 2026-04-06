'use client'

import CaseStudyLayout from '@/components/CaseStudyLayout'
import { ExternalLinkIcon, GitHubIcon } from '@/components/CaseStudyLinkIcons'
import {
  CaseStudyMutedList,
  CaseStudyMutedText,
  CaseStudySubheading,
} from '@/components/CaseStudyTypography'
import CodeBlock from '@/components/CodeBlock'
import { getProjectBySlug } from '@/data/projects'
import { getCategoryColor } from '@/lib/project-categories'
import { MONOKAI } from '@/lib/monokai-colors'

export default function SkydioPage() {
  const project = getProjectBySlug('skydio')
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
          label: 'GitHub (private)',
          href: '',
          icon: <GitHubIcon />,
        },
        {
          label: 'Storybook (password)',
          href: 'https://skydio-storybook-protected.vercel.app',
          icon: <ExternalLinkIcon />,
        },
      ]}
      impact={[
        {
          metric: 'Production',
          description:
            'Delivered widget system for real-time autonomous drone control',
        },
        {
          metric: 'Storybook',
          description:
            'Comprehensive component documentation with accessibility testing',
        },
        {
          metric: 'Config-Driven',
          description: 'Action-based architecture enabling UI-as-API pattern',
        },
      ]}
      gradient={project.caseStudyGradient}
      sections={[
        {
          title: 'The Challenge',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                Skydio, a leading autonomous drone company, needed a
                production-grade React widget for their Rivit design language to
                control real-time drone missions. The challenge required:
              </p>
              <CaseStudyMutedList className='space-y-3'>
                <li>
                  Highly composable widget system supporting multiple mission
                  types (Waypoint, RTD, Orbit, Tracking)
                </li>
                <li>Real-time UI updates synchronized with drone state</li>
                <li>
                  Config-driven architecture for seamless Figma-to-code parity
                </li>
                <li>
                  Responsive design adapting from mobile to desktop control
                  interfaces
                </li>
                <li>
                  Comprehensive Storybook documentation for product and
                  engineering teams
                </li>
              </CaseStudyMutedList>
              <p className='text-lg leading-relaxed'>
                The widget needed to function as a "UI microservice" that could
                be integrated into Skydio's drone control systems with minimal
                coupling.
              </p>
            </div>
          ),
        },
        {
          title: 'The Solution',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                I built the <strong>Autonomy Widget</strong> using a
                config-driven architecture that maps all actions, icons, and
                controls declaratively—making UI parity with Figma designs
                effortless.
              </p>

              <CaseStudySubheading color={accent}>
                Config-Driven Architecture
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Central action configuration pattern enabling declarative UI:
              </CaseStudyMutedText>
              <CodeBlock
                language='typescript'
                analyticsLabel='action_configs'
                code={`// AutonomyWidget.configs.ts
const ACTION_CONFIGS = {
  pause: {
    icon: PauseIcon,
    label: 'Pause',
    tooltip: 'Pause current mission',
    variant: 'secondary'
  },
  orbit: {
    icon: OrbitIcon,
    label: 'Orbit',
    tooltip: 'Enable orbit mode',
    variant: 'primary'
  },
  // ... 15+ mission actions
} as const

// Usage: Automatic UI generation
<IconButton {...ACTION_CONFIGS[action]} />`}
              />

              <CaseStudySubheading color={accent}>
                State Management Pattern
              </CaseStudySubheading>
              <CaseStudyMutedText>
                React Context Provider pattern for unified widget state:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>
                  Central state provider managing mission type, timer, and
                  action states
                </li>
                <li>
                  Remote state synchronization for real-time drone updates
                </li>
                <li>Event subscription hooks for analytics telemetry</li>
                <li>Config injection at runtime for dynamic UI behavior</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Component System
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Built highly composable React components:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>
                  <strong>Dynamic Timer:</strong> Circular countdown ring with
                  animated icon transitions
                </li>
                <li>
                  <strong>OrbitSlider:</strong> Dual progress indicators with
                  chevron controls
                </li>
                <li>
                  <strong>IconButton:</strong> Shared component with icons,
                  tooltips, and labels
                </li>
                <li>
                  <strong>StatusMessage:</strong> Expandable area for mission
                  updates
                </li>
                <li>
                  <strong>Tooltip System:</strong> Custom accessible tooltips
                  with ARIA support
                </li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Responsive Design
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Adaptive layouts using Tailwind CSS v4:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Compact mobile mode with minimal controls</li>
                <li>Expanded desktop mode showing full action sets</li>
                <li>Design tokens synced with Figma Variables</li>
                <li>Responsive by default with mobile-first approach</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Storybook Documentation
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Comprehensive component playground:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Storybook 9 with Vite integration for fast builds</li>
                <li>
                  Accessibility addon (@storybook/addon-a11y) for WCAG testing
                </li>
                <li>Theme switching addon for light/dark mode validation</li>
                <li>Component Docs tabs with prop tables and usage examples</li>
              </CaseStudyMutedList>
            </div>
          ),
        },
        {
          title: 'Technical Implementation',
          content: (
            <div className='space-y-6'>
              <CaseStudySubheading color={accent} className='mt-0'>
                Barrel Architecture Pattern
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Modular exports for clean import paths:
              </CaseStudyMutedText>
              <CodeBlock
                language='typescript'
                analyticsLabel='barrel_architecture'
                code={`// Clean imports via barrel pattern
import {
  AutonomyWidget,
  IconButton,
  OrbitSlider
} from '@/components'

// Instead of deep imports
import AutonomyWidget from '@/components/AutonomyWidget'
import IconButton from '@/components/IconButton'`}
              />

              <CaseStudySubheading color={accent}>
                Figma-to-Code Workflow
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Streamlined design handoff:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Figma-exported SVG icons imported as React components</li>
                <li>
                  Design tokens from Figma Variables mapped to Tailwind config
                </li>
                <li>
                  Config-driven approach maintains 1:1 parity with Figma designs
                </li>
                <li>Minimal translation layer between design and code</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Integration Patterns
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Widget functions as "UI microservice":
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Remote state synchronization with drone control systems</li>
                <li>Config injection at runtime for dynamic behavior</li>
                <li>Event subscription hooks for analytics telemetry</li>
                <li>Minimal coupling to external systems</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Build & Tooling
              </CaseStudySubheading>
              <CaseStudyMutedText>Modern development stack:</CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Vite for fast builds and HMR</li>
                <li>pnpm workspace management</li>
                <li>ESLint configuration for code quality</li>
                <li>TypeScript strict mode for type safety</li>
                <li>Deployed via Vercel for Storybook hosting</li>
              </CaseStudyMutedList>
            </div>
          ),
        },
        {
          title: 'Impact & Deliverables',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                The Autonomy Widget established a production-grade foundation
                for Skydio's drone control interfaces:
              </p>
              <CaseStudyMutedList className='space-y-4'>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Production-ready widget system
                  </strong>{' '}
                  powering real-time autonomous drone missions (Waypoint, RTD,
                  Orbit, Tracking)
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Config-driven architecture
                  </strong>{' '}
                  enabling effortless Figma-to-code parity through declarative
                  ACTION_CONFIGS mapping
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Storybook 9 documentation
                  </strong>{' '}
                  with accessibility testing, prop tables, and interactive
                  examples for team onboarding
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Responsive design
                  </strong>{' '}
                  adapting from compact mobile controls to expanded desktop
                  interfaces
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    UI-as-API pattern
                  </strong>{' '}
                  functioning as microservice with remote state sync and event
                  hooks
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Team onboarding
                  </strong>{' '}
                  training product and engineering teams on component patterns
                  and adoption workflows
                </li>
              </CaseStudyMutedList>
              <p className='text-lg leading-relaxed mt-8'>
                Delivered a composable, well-documented component library that
                accelerated Skydio's product development while maintaining
                design system consistency across their autonomous drone
                platform.
              </p>
            </div>
          ),
        },
      ]}
    />
  )
}

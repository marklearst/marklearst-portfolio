'use client'

import CaseStudyLayout from '@/components/CaseStudyLayout'
import CodeBlock from '@/components/CodeBlock'
import { MONOKAI } from '@/lib/monokai-colors'

export default function SkydioPage() {
  return (
    <CaseStudyLayout
      title='Skydio Autonomy Widget'
      category='Consulting'
      categoryColor='cyan'
      description="Built production-grade React widget system for Skydio's Rivit design language, enabling real-time drone control with config-driven UI architecture and Storybook documentation."
      role='Frontend Consultant - Component Architecture & Storybook'
      timeline='2024 (Contract)'
      technologies={[
        'React',
        'TypeScript',
        'Storybook 9',
        'Tailwind CSS v4',
        'Vite',
        'Config-Driven UI',
      ]}
      links={[
        {
          label: 'GitHub Repository',
          href: 'https://github.com/marklearst/skydio-autonomy-widget',
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
          label: 'Skydio',
          href: 'https://www.skydio.com',
          icon: (
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' />
            </svg>
          ),
        },
      ]}
      impact={[
        {
          metric: 'Production',
          description: 'Delivered widget system for real-time autonomous drone control',
        },
        {
          metric: 'Storybook 9',
          description: 'Comprehensive component documentation with accessibility testing',
        },
        {
          metric: 'Config-Driven',
          description: 'Action-based architecture enabling UI-as-API pattern',
        },
      ]}
      gradient='from-cyan-500/20 via-blue-500/10 to-transparent'
      sections={[
        {
          title: 'The Challenge',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                Skydio, a leading autonomous drone company, needed a production-grade React widget for their Rivit design language to control real-time drone missions. The challenge required:
              </p>
              <ul className='space-y-3 ml-6 list-disc' style={{ color: `${MONOKAI.foreground}b3` }}>
                <li>Highly composable widget system supporting multiple mission types (Waypoint, RTD, Orbit, Tracking)</li>
                <li>Real-time UI updates synchronized with drone state</li>
                <li>Config-driven architecture for seamless Figma-to-code parity</li>
                <li>Responsive design adapting from mobile to desktop control interfaces</li>
                <li>Comprehensive Storybook documentation for product and engineering teams</li>
              </ul>
              <p className='text-lg leading-relaxed'>
                The widget needed to function as a "UI microservice" that could be integrated into Skydio's drone control systems with minimal coupling.
              </p>
            </div>
          ),
        },
        {
          title: 'The Solution',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                I built the <strong>Autonomy Widget</strong> using a config-driven architecture that maps all actions, icons, and controls declaratively—making UI parity with Figma designs effortless.
              </p>

              <h3 className='text-2xl font-mono mt-8 mb-4' style={{ color: MONOKAI.cyan }}>
                Config-Driven Architecture
              </h3>
              <p className='leading-relaxed' style={{ color: `${MONOKAI.foreground}b3` }}>
                Central action configuration pattern enabling declarative UI:
              </p>
              <CodeBlock
                language='typescript'
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

              <h3 className='text-2xl font-mono mt-8 mb-4' style={{ color: MONOKAI.cyan }}>
                State Management Pattern
              </h3>
              <p className='leading-relaxed' style={{ color: `${MONOKAI.foreground}b3` }}>
                React Context Provider pattern for unified widget state:
              </p>
              <ul className='space-y-2 ml-6 list-disc' style={{ color: `${MONOKAI.foreground}b3` }}>
                <li>Central state provider managing mission type, timer, and action states</li>
                <li>Remote state synchronization for real-time drone updates</li>
                <li>Event subscription hooks for analytics telemetry</li>
                <li>Config injection at runtime for dynamic UI behavior</li>
              </ul>

              <h3 className='text-2xl font-mono mt-8 mb-4' style={{ color: MONOKAI.cyan }}>
                Component System
              </h3>
              <p className='leading-relaxed' style={{ color: `${MONOKAI.foreground}b3` }}>
                Built highly composable React components:
              </p>
              <ul className='space-y-2 ml-6 list-disc' style={{ color: `${MONOKAI.foreground}b3` }}>
                <li><strong>Dynamic Timer:</strong> Circular countdown ring with animated icon transitions</li>
                <li><strong>OrbitSlider:</strong> Dual progress indicators with chevron controls</li>
                <li><strong>IconButton:</strong> Shared component with icons, tooltips, and labels</li>
                <li><strong>StatusMessage:</strong> Expandable area for mission updates</li>
                <li><strong>Tooltip System:</strong> Custom accessible tooltips with ARIA support</li>
              </ul>

              <h3 className='text-2xl font-mono mt-8 mb-4' style={{ color: MONOKAI.cyan }}>
                Responsive Design
              </h3>
              <p className='leading-relaxed' style={{ color: `${MONOKAI.foreground}b3` }}>
                Adaptive layouts using Tailwind CSS v4:
              </p>
              <ul className='space-y-2 ml-6 list-disc' style={{ color: `${MONOKAI.foreground}b3` }}>
                <li>Compact mobile mode with minimal controls</li>
                <li>Expanded desktop mode showing full action sets</li>
                <li>Design tokens synced with Figma Variables</li>
                <li>Responsive by default with mobile-first approach</li>
              </ul>

              <h3 className='text-2xl font-mono mt-8 mb-4' style={{ color: MONOKAI.cyan }}>
                Storybook Documentation
              </h3>
              <p className='leading-relaxed' style={{ color: `${MONOKAI.foreground}b3` }}>
                Comprehensive component playground:
              </p>
              <ul className='space-y-2 ml-6 list-disc' style={{ color: `${MONOKAI.foreground}b3` }}>
                <li>Storybook 9 with Vite integration for fast builds</li>
                <li>Accessibility addon (@storybook/addon-a11y) for WCAG testing</li>
                <li>Theme switching addon for light/dark mode validation</li>
                <li>Component Docs tabs with prop tables and usage examples</li>
              </ul>
            </div>
          ),
        },
        {
          title: 'Technical Implementation',
          content: (
            <div className='space-y-6'>
              <h3 className='text-2xl font-mono mb-4' style={{ color: MONOKAI.cyan }}>
                Barrel Architecture Pattern
              </h3>
              <p className='leading-relaxed' style={{ color: `${MONOKAI.foreground}b3` }}>
                Modular exports for clean import paths:
              </p>
              <CodeBlock
                language='typescript'
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

              <h3 className='text-2xl font-mono mt-8 mb-4' style={{ color: MONOKAI.cyan }}>
                Figma-to-Code Workflow
              </h3>
              <p className='leading-relaxed' style={{ color: `${MONOKAI.foreground}b3` }}>
                Streamlined design handoff:
              </p>
              <ul className='space-y-2 ml-6 list-disc' style={{ color: `${MONOKAI.foreground}b3` }}>
                <li>Figma-exported SVG icons imported as React components</li>
                <li>Design tokens from Figma Variables mapped to Tailwind config</li>
                <li>Config-driven approach maintains 1:1 parity with Figma designs</li>
                <li>Minimal translation layer between design and code</li>
              </ul>

              <h3 className='text-2xl font-mono mt-8 mb-4' style={{ color: MONOKAI.cyan }}>
                Integration Patterns
              </h3>
              <p className='leading-relaxed' style={{ color: `${MONOKAI.foreground}b3` }}>
                Widget functions as "UI microservice":
              </p>
              <ul className='space-y-2 ml-6 list-disc' style={{ color: `${MONOKAI.foreground}b3` }}>
                <li>Remote state synchronization with drone control systems</li>
                <li>Config injection at runtime for dynamic behavior</li>
                <li>Event subscription hooks for analytics telemetry</li>
                <li>Minimal coupling to external systems</li>
              </ul>

              <h3 className='text-2xl font-mono mt-8 mb-4' style={{ color: MONOKAI.cyan }}>
                Build & Tooling
              </h3>
              <p className='leading-relaxed' style={{ color: `${MONOKAI.foreground}b3` }}>
                Modern development stack:
              </p>
              <ul className='space-y-2 ml-6 list-disc' style={{ color: `${MONOKAI.foreground}b3` }}>
                <li>Vite for fast builds and HMR</li>
                <li>pnpm workspace management</li>
                <li>ESLint configuration for code quality</li>
                <li>TypeScript strict mode for type safety</li>
                <li>Deployed via Vercel for Storybook hosting</li>
              </ul>
            </div>
          ),
        },
        {
          title: 'Impact & Deliverables',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                The Autonomy Widget established a production-grade foundation for Skydio's drone control interfaces:
              </p>
              <ul className='space-y-4 ml-6 list-disc' style={{ color: `${MONOKAI.foreground}b3` }}>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>Production-ready widget system</strong> powering real-time autonomous drone missions (Waypoint, RTD, Orbit, Tracking)
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>Config-driven architecture</strong> enabling effortless Figma-to-code parity through declarative ACTION_CONFIGS mapping
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>Storybook 9 documentation</strong> with accessibility testing, prop tables, and interactive examples for team onboarding
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>Responsive design</strong> adapting from compact mobile controls to expanded desktop interfaces
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>UI-as-API pattern</strong> functioning as microservice with remote state sync and event hooks
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>Team onboarding</strong> training product and engineering teams on component patterns and adoption workflows
                </li>
              </ul>
              <p className='text-lg leading-relaxed mt-8'>
                Delivered a composable, well-documented component library that accelerated Skydio's product development while maintaining design system consistency across their autonomous drone platform.
              </p>
            </div>
          ),
        },
      ]}
    />
  )
}

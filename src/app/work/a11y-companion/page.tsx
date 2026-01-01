'use client'

import CaseStudyLayout from '@/components/CaseStudyLayout'
import { MONOKAI } from '@/lib/monokai-colors'

export default function A11yCompanionPage() {
  return (
    <CaseStudyLayout
      title='a11y Companion'
      category='Accessibility'
      categoryColor='green'
      description='Figma widget bringing The A11Y Project Checklist into design workflows. 200+ active users across design teams with WCAG 2.2 tooltips, progress tracking, bulk actions, and MD/HTML/JSON export capabilities.'
      role='Creator & Maintainer'
      timeline='2023 - Present'
      technologies={[
        'Figma Widget API',
        'TypeScript',
        'WCAG 2.2',
        'React',
        'Figma Design',
        'Accessibility',
      ]}
      links={[
        {
          label: 'Figma Community',
          href: 'https://www.figma.com/community/widget/1509302611418259130/a11y-companion',
          icon: (
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M12 12.5c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5zm-3-3c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5 1.5-.672 1.5-1.5zm0-3c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5 1.5-.672 1.5-1.5zm3 0c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5zm3 3c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5z' />
            </svg>
          ),
        },
        {
          label: 'GitHub',
          href: 'https://github.com/marklearst/a11y-companion-widget',
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
      ]}
      impact={[
        {
          metric: '200+',
          description:
            'Active users across design teams at companies of all sizes',
        },
        {
          metric: 'WCAG 2.2',
          description:
            'Complete checklist coverage with tooltips explaining each criterion',
        },
        {
          metric: 'Open Source',
          description:
            'Published on Figma Community and GitHub for the a11y community',
        },
      ]}
      gradient='from-green-500/20 via-emerald-500/10 to-transparent'
      sections={[
        {
          title: 'The Problem',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                Designers working on accessible interfaces faced a fundamental
                workflow challenge: accessibility checklists lived outside their
                design tools. This created:
              </p>
              <ul
                className='space-y-3 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>
                  Context switching between Figma and external WCAG
                  documentation
                </li>
                <li>
                  No way to track accessibility progress directly in design
                  files
                </li>
                <li>
                  Accessibility often forgotten until developer handoff or QA
                </li>
                <li>
                  Teams reinventing accessibility checklists for each project
                </li>
                <li>
                  Designers unsure which WCAG criteria applied to their designs
                </li>
              </ul>
              <p className='text-lg leading-relaxed'>
                The A11Y Project had a comprehensive accessibility checklist,
                but it was a website—designers needed this information embedded
                in their design workflow, not a browser tab away.
              </p>
            </div>
          ),
        },
        {
          title: 'The Solution',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                <strong>a11y Companion</strong> is a Figma widget that embeds
                The A11Y Project Checklist directly into design files, making
                accessibility a first-class citizen in the design process.
              </p>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.green }}
              >
                Interactive Checklist
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Built a widget interface that presents the full A11Y Project
                Checklist with:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>Check/uncheck functionality to track completed items</li>
                <li>Progress indicator showing completion percentage</li>
                <li>
                  Category organization (Content, Design, Development, etc.)
                </li>
                <li>WCAG 2.2 tooltips explaining each criterion on hover</li>
                <li>Persistent state saved with the Figma file</li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.green }}
              >
                Search & Filtering
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Designed search functionality allowing designers to quickly find
                relevant accessibility criteria:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>Real-time search across all checklist items</li>
                <li>Filter by category (Content, Design, Development, QA)</li>
                <li>
                  Filter by completion status (completed, incomplete, all)
                </li>
                <li>Keyboard shortcuts for power users</li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.green }}
              >
                Bulk Actions
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Added productivity features for managing checklists at scale:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>Mark all items complete/incomplete in one action</li>
                <li>Reset checklist to start fresh on new projects</li>
                <li>Bulk select items by category</li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.green }}
              >
                Export Capabilities
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Built export functionality for sharing progress with teams:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>Markdown export for documentation</li>
                <li>HTML export for standalone pages</li>
                <li>JSON export for programmatic use</li>
                <li>Copy to clipboard for quick sharing</li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.green }}
              >
                Dark Mode Support
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Implemented theme detection that matches Figma's interface mode,
                ensuring the widget is comfortable to use in any environment.
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
                style={{ color: MONOKAI.green }}
              >
                Figma Widget API
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Built using Figma's Widget API with React-like components:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>State management using Figma's widget storage API</li>
                <li>Custom UI components matching Figma's design system</li>
                <li>Event handling for checkbox toggles and search input</li>
                <li>
                  Performance optimized for rendering 100+ checklist items
                </li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.green }}
              >
                WCAG 2.2 Integration
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Mapped each checklist item to specific WCAG 2.2 success
                criteria:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>Tooltips explaining the "why" behind each item</li>
                <li>Links to official WCAG documentation</li>
                <li>Conformance level indicators (A, AA, AAA)</li>
                <li>Context about which roles should address each item</li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.green }}
              >
                Community Publishing
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Published to Figma Community with:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>Detailed README with usage instructions</li>
                <li>Screenshots demonstrating key features</li>
                <li>Version history and changelog</li>
                <li>Open-source license on GitHub for contributions</li>
              </ul>
            </div>
          ),
        },
        {
          title: 'Impact & Adoption',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                a11y Companion has changed how design teams approach
                accessibility:
              </p>
              <ul
                className='space-y-4 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    200+ active users
                  </strong>{' '}
                  across companies ranging from startups to Fortune 500
                  enterprises
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Accessibility shifts left
                  </strong>{' '}
                  by embedding WCAG criteria directly in design workflows
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Progress tracking
                  </strong>{' '}
                  gives teams visibility into accessibility coverage before
                  development
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    WCAG 2.2 education
                  </strong>{' '}
                  through contextual tooltips that explain each criterion
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Export capabilities
                  </strong>{' '}
                  enable handoff documentation for developers and QA teams
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Open-source contribution
                  </strong>{' '}
                  to the accessibility community, making a11y easier to adopt
                </li>
              </ul>
              <p className='text-lg leading-relaxed mt-8'>
                The widget is actively maintained on Figma Community and GitHub,
                serving as a foundational tool for teams committed to building
                accessible digital experiences.
              </p>
            </div>
          ),
        },
      ]}
    />
  )
}

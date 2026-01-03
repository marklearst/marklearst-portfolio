'use client'

import CaseStudyLayout from '@/components/CaseStudyLayout'
import { FigmaIcon, GitHubIcon } from '@/components/CaseStudyLinkIcons'
import {
  CaseStudyMutedList,
  CaseStudyMutedText,
  CaseStudySubheading,
} from '@/components/CaseStudyTypography'
import { getProjectBySlug } from '@/data/projects'
import { getCategoryColor } from '@/lib/project-categories'
import { MONOKAI } from '@/lib/monokai-colors'

export default function A11yCompanionPage() {
  const project = getProjectBySlug('a11y-companion')
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
          label: 'Figma Community',
          href: 'https://www.figma.com/community/widget/1509302611418259130/a11y-companion',
          icon: <FigmaIcon />,
        },
        {
          label: 'GitHub',
          href: 'https://github.com/marklearst/a11y-companion-widget',
          icon: <GitHubIcon />,
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
      gradient={project.caseStudyGradient}
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
              <CaseStudyMutedList className='space-y-3'>
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
              </CaseStudyMutedList>
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

              <CaseStudySubheading color={accent}>
                Interactive Checklist
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Built a widget interface that presents the full A11Y Project
                Checklist with:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Check/uncheck functionality to track completed items</li>
                <li>Progress indicator showing completion percentage</li>
                <li>
                  Category organization (Content, Design, Development, etc.)
                </li>
                <li>WCAG 2.2 tooltips explaining each criterion on hover</li>
                <li>Persistent state saved with the Figma file</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Search & Filtering
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Designed search functionality allowing designers to quickly find
                relevant accessibility criteria:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Real-time search across all checklist items</li>
                <li>Filter by category (Content, Design, Development, QA)</li>
                <li>
                  Filter by completion status (completed, incomplete, all)
                </li>
                <li>Keyboard shortcuts for power users</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Bulk Actions
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Added productivity features for managing checklists at scale:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Mark all items complete/incomplete in one action</li>
                <li>Reset checklist to start fresh on new projects</li>
                <li>Bulk select items by category</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Export Capabilities
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Built export functionality for sharing progress with teams:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Markdown export for documentation</li>
                <li>HTML export for standalone pages</li>
                <li>JSON export for programmatic use</li>
                <li>Copy to clipboard for quick sharing</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Dark Mode Support
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Implemented theme detection that matches Figma's interface mode,
                ensuring the widget is comfortable to use in any environment.
              </CaseStudyMutedText>
            </div>
          ),
        },
        {
          title: 'Technical Implementation',
          content: (
            <div className='space-y-6'>
              <CaseStudySubheading color={accent} className='mt-0'>
                Figma Widget API
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Built using Figma's Widget API with React-like components:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>State management using Figma's widget storage API</li>
                <li>Custom UI components matching Figma's design system</li>
                <li>Event handling for checkbox toggles and search input</li>
                <li>
                  Performance optimized for rendering 100+ checklist items
                </li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                WCAG 2.2 Integration
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Mapped each checklist item to specific WCAG 2.2 success
                criteria:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Tooltips explaining the "why" behind each item</li>
                <li>Links to official WCAG documentation</li>
                <li>Conformance level indicators (A, AA, AAA)</li>
                <li>Context about which roles should address each item</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Community Publishing
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Published to Figma Community with:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Detailed README with usage instructions</li>
                <li>Screenshots demonstrating key features</li>
                <li>Version history and changelog</li>
                <li>Open-source license on GitHub for contributions</li>
              </CaseStudyMutedList>
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
              <CaseStudyMutedList className='space-y-4'>
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
              </CaseStudyMutedList>
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

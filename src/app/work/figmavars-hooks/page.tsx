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

export default function FigmaVarsHooksPage() {
  const project = getProjectBySlug('figmavars-hooks')
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
          href: 'https://github.com/marklearst/figma-vars-hooks',
          icon: <GitHubIcon />,
        },
        {
          label: 'npm Package',
          href: 'https://www.npmjs.com/package/@figma-vars/hooks',
          icon: <NpmIcon />,
        },
      ]}
      impact={[
        {
          metric: '100%',
          description:
            'Test coverage with Vitest ensuring reliability for production use',
        },
        {
          metric: 'Type-Safe',
          description:
            'Full TypeScript support with Zod validation for runtime safety',
        },
        {
          metric: 'Open Source',
          description:
            'MIT licensed and actively maintained for the design systems community',
        },
      ]}
      gradient={project.caseStudyGradient}
      sections={[
        {
          title: 'The Problem',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                Design systems teams using Figma Variables faced a critical
                workflow challenge: there was no official way to
                programmatically access Figma's design variables from React
                applications. This created:
              </p>
              <CaseStudyMutedList className='space-y-3'>
                <li>
                  Manual copy-paste workflows to sync design tokens from Figma
                  to code
                </li>
                <li>
                  Version drift between Figma variables and application code
                </li>
                <li>No way to validate variables at runtime in React apps</li>
                <li>
                  Inability to dynamically load Figma variables in Storybook or
                  dev tools
                </li>
                <li>
                  Fragmented token export solutions that didn't leverage
                  official APIs
                </li>
              </CaseStudyMutedList>
              <p className='text-lg leading-relaxed'>
                When Figma released their Variables REST API in 2024, I saw an
                opportunity to build the missing piece: a React hooks library
                that made Figma Variables a first-class citizen in React
                development.
              </p>
            </div>
          ),
        },
        {
          title: 'The Solution',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                <strong>FigmaVars Hooks</strong> is a React 19 hooks library
                that provides type-safe access to the Figma Variables REST API,
                paired with a CLI tool for exporting variables into CI/CD
                pipelines.
              </p>

              <CaseStudySubheading color={accent}>
                React Hooks API
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Built custom React hooks that fetch and cache Figma variables at
                runtime:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>
                  <code
                    className='text-sm px-2 py-1 rounded'
                    style={{
                      backgroundColor: `${MONOKAI.cyan}20`,
                      color: MONOKAI.cyan,
                    }}
                  >
                    useFigmaVariables()
                  </code>{' '}
                  - Fetch all variables from a Figma file
                </li>
                <li>
                  <code
                    className='text-sm px-2 py-1 rounded'
                    style={{
                      backgroundColor: `${MONOKAI.cyan}20`,
                      color: MONOKAI.cyan,
                    }}
                  >
                    useFigmaVariable()
                  </code>{' '}
                  - Get a specific variable by ID or name
                </li>
                <li>
                  <code
                    className='text-sm px-2 py-1 rounded'
                    style={{
                      backgroundColor: `${MONOKAI.cyan}20`,
                      color: MONOKAI.cyan,
                    }}
                  >
                    useFigmaCollection()
                  </code>{' '}
                  - Access variable collections
                </li>
                <li>
                  Built-in caching and request deduplication for performance
                </li>
                <li>
                  Full TypeScript support with inferred types from Zod schemas
                </li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                CLI Export Tool
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Created{' '}
                <code
                  className='text-sm px-2 py-1 rounded'
                  style={{
                    backgroundColor: `${MONOKAI.cyan}20`,
                    color: MONOKAI.cyan,
                  }}
                >
                  figma-vars-export
                </code>{' '}
                CLI for exporting Figma variables as JSON in CI/CD pipelines:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Runs in GitHub Actions or any CI environment</li>
                <li>
                  Exports variables to JSON format compatible with Style
                  Dictionary
                </li>
                <li>
                  Supports filtering by collection, mode, or variable name
                </li>
                <li>
                  Validates exported data against Zod schemas before writing
                </li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Zod Validation
              </CaseStudySubheading>
              <CaseStudyMutedText>
                All API responses are validated at runtime using Zod schemas,
                ensuring type safety beyond TypeScript's compile-time checks.
                This prevents runtime errors from malformed API data and
                provides clear error messages when validation fails.
              </CaseStudyMutedText>

              <CaseStudySubheading color={accent}>
                100% Test Coverage
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Built comprehensive test suite with Vitest covering:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>All hook behaviors and edge cases</li>
                <li>API request/response mocking and error handling</li>
                <li>Zod schema validation for all data structures</li>
                <li>CLI command execution and file output</li>
              </CaseStudyMutedList>
            </div>
          ),
        },
        {
          title: 'Technical Architecture',
          content: (
            <div className='space-y-6'>
              <CaseStudySubheading color={accent} className='mt-0'>
                React 19 Features
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Leveraged React 19's new capabilities:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>
                  Server Components for initial data fetching when used in
                  Next.js
                </li>
                <li>Use hook for async data loading</li>
                <li>Built-in caching strategies with React's cache function</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Developer Experience
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Optimized for DX:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Clear error messages with suggestions for common issues</li>
                <li>Comprehensive TypeScript types exported from package</li>
                <li>Detailed README with code examples and API reference</li>
                <li>Minimal configuration required to get started</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Use Cases
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Enables powerful workflows:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>
                  Live Storybook integration showing actual Figma variables
                </li>
                <li>
                  Design token validation tools that check Figma against
                  codebase
                </li>
                <li>Admin panels for managing design tokens across teams</li>
                <li>
                  CI/CD pipelines that auto-sync Figma changes to code repos
                </li>
              </CaseStudyMutedList>
            </div>
          ),
        },
        {
          title: 'Impact & Adoption',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                FigmaVars Hooks bridges the gap between Figma Variables and
                React development:
              </p>
              <CaseStudyMutedList className='space-y-4'>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Eliminates manual token sync
                  </strong>{' '}
                  by providing programmatic access to Figma Variables directly
                  from React
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Type-safe runtime validation
                  </strong>{' '}
                  using Zod ensures variables are valid before use in
                  applications
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    100% test coverage
                  </strong>{' '}
                  provides confidence for teams adopting the library in
                  production
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Open-source contribution
                  </strong>{' '}
                  to the design systems community, filling a critical gap in the
                  Figma Variables ecosystem
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    CLI tool enables CI/CD
                  </strong>{' '}
                  workflows that auto-sync design tokens on every Figma change
                </li>
              </CaseStudyMutedList>
              <p className='text-lg leading-relaxed mt-8'>
                The library is published on npm, actively maintained, and serves
                as a foundation for teams building design token workflows with
                Figma Variables.
              </p>
            </div>
          ),
        },
      ]}
    />
  )
}

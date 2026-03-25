'use client'

import CaseStudyLayout from '@/components/CaseStudyLayout'
import { MONOKAI } from '@/lib/monokai-colors'

export default function FigmaVarsHooksPage() {
  return (
    <CaseStudyLayout
      title='FigmaVars Hooks'
      category='DEVELOPER TOOLS'
      categoryColor='cyan'
      description='React 19 hooks library and CLI for the official Figma Variables REST API. Type-safe synchronization between Figma and React apps with 100% test coverage.'
      role='Creator & Maintainer'
      timeline='2024 - Present'
      technologies={[
        'React 19',
        'TypeScript',
        'Figma REST API',
        'Vitest',
        'Node.js',
        'CLI',
        'npm',
      ]}
      links={[
        {
          label: 'GitHub',
          href: 'https://github.com/marklearst/figma-vars-hooks',
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
          href: 'https://www.npmjs.com/package/@figma-vars/hooks',
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
      gradient='from-cyan-500/20 via-teal-500/10 to-transparent'
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
              <ul
                className='space-y-3 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
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
              </ul>
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

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.cyan }}
              >
                React Hooks API
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Built custom React hooks that fetch and cache Figma variables at
                runtime:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
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
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.cyan }}
              >
                CLI Export Tool
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
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
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
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
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.cyan }}
              >
                Zod Validation
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                All API responses are validated at runtime using Zod schemas,
                ensuring type safety beyond TypeScript's compile-time checks.
                This prevents runtime errors from malformed API data and
                provides clear error messages when validation fails.
              </p>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.cyan }}
              >
                100% Test Coverage
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Built comprehensive test suite with Vitest covering:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>All hook behaviors and edge cases</li>
                <li>API request/response mocking and error handling</li>
                <li>Zod schema validation for all data structures</li>
                <li>CLI command execution and file output</li>
              </ul>
            </div>
          ),
        },
        {
          title: 'Technical Architecture',
          content: (
            <div className='space-y-6'>
              <h3
                className='text-2xl font-mono mb-4'
                style={{ color: MONOKAI.cyan }}
              >
                React 19 Features
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Leveraged React 19's new capabilities:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>
                  Server Components for initial data fetching when used in
                  Next.js
                </li>
                <li>Use hook for async data loading</li>
                <li>Built-in caching strategies with React's cache function</li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.cyan }}
              >
                Developer Experience
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Optimized for DX:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>Clear error messages with suggestions for common issues</li>
                <li>Comprehensive TypeScript types exported from package</li>
                <li>Detailed README with code examples and API reference</li>
                <li>Minimal configuration required to get started</li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.cyan }}
              >
                Use Cases
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Enables powerful workflows:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
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
              </ul>
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
              <ul
                className='space-y-4 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
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
              </ul>
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

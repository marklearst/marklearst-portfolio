export type ProjectCategory =
  | 'DESIGN SYSTEMS'
  | 'DEVELOPER TOOLS'
  | 'ACCESSIBILITY'
  | 'HEALTH TECH'
  | 'STANDARDS'
  | 'CONSULTING'

export type ProjectCategoryColor =
  | 'purple'
  | 'cyan'
  | 'green'
  | 'pink'
  | 'orange'
  | 'yellow'

export type ProjectTerminalDurationKey =
  | 'homeRoute'
  | 'workRoute'
  | 'workRouteWithPackages'

export interface ProjectTerminalConfig {
  command: string
  loading?: string
  packages?: string[]
  output?: string
  outputWithCheck?: boolean
  durationKey: ProjectTerminalDurationKey
}

export interface ProjectMeta {
  slug: string
  route: string
  title: string
  cardTitle: string
  category: ProjectCategory
  categoryColor: ProjectCategoryColor
  summary: string
  description: string
  role: string
  timeline: string
  publishedAt?: string
  pinned?: boolean
  featured?: boolean
  technologies: string[]
  tags: string[]
  commitHash: string
  cardGradient: string
  caseStudyGradient: string
  terminal: ProjectTerminalConfig
}

export const PROJECTS: ProjectMeta[] = [
  {
    slug: 'aurora-gm',
    route: '/work/aurora-gm',
    title: 'Aurora Design System',
    cardTitle: 'Aurora Design System',
    category: 'DESIGN SYSTEMS',
    categoryColor: 'purple',
    summary:
      "Built GM's first cross-brand React design system achieving 60% component reuse across 4 brands (Chevy, Buick, GMC, Cadillac) with WCAG 2.1 AA compliance.",
    description:
      "Built GM's first cross-brand React design system achieving 60% component reuse across 4 brands (Chevy, Buick, GMC, Cadillac) with WCAG 2.1 AA compliance embedded into every component.",
    role: 'Senior Design Engineer, Lead - Authored Design Token Governance Document',
    timeline: 'Jun 2021 - Sep 2024 (3+ years)',
    publishedAt: '2024-09-01',
    pinned: true,
    featured: true,
    technologies: [
      'React',
      'React Native',
      'TypeScript',
      'Storybook 10',
      'Style Dictionary',
      'Design Tokens',
      'WCAG 2.1 AA',
      'Figma Variables',
      'GitHub Actions',
    ],
    tags: ['React', 'Design Tokens', 'Storybook'],
    commitHash: 'a3f9c2d',
    cardGradient: 'from-purple-500/10 via-pink-500/5 to-transparent',
    caseStudyGradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
    terminal: {
      command: 'cd /work/aurora-gm',
      loading: 'Loading design system...',
      packages: ['react@18.2.0', 'react-dom@18.2.0', 'storybook@9.0.15'],
      output: 'Ready',
      outputWithCheck: true,
      durationKey: 'workRouteWithPackages',
    },
  },
  {
    slug: 'hailstorm',
    route: '/work/hailstorm',
    title: 'Hailstorm Design System',
    cardTitle: 'Hailstorm Design System',
    category: 'DESIGN SYSTEMS',
    categoryColor: 'purple',
    summary:
      'Modernized Abusix design system to React 19, Tailwind v4 tokens, Storybook 10, and WCAG 2.2 AA patterns.',
    description:
      'Modernized Abusix design system into a React 19 component library with token-driven styling, Storybook 10 docs, and automated QA.',
    role: 'Design Systems Engineer, Modernization Lead',
    timeline: '2025 - Present',
    publishedAt: '2025-11-01',
    technologies: [
      'React 19',
      'TypeScript',
      'Tailwind CSS v4',
      'Storybook 10',
      'Headless UI',
      'WCAG 2.2',
      'Vitest',
      'Testing Library',
      'Playwright',
    ],
    tags: ['Design Tokens', 'Storybook', 'Accessibility'],
    commitHash: 'h7a15c1',
    cardGradient: 'from-purple-500/10 via-indigo-500/5 to-transparent',
    caseStudyGradient: 'from-purple-500/20 via-blue-500/10 to-transparent',
    terminal: {
      command: 'cd /work/hailstorm',
      loading: 'Loading design system...',
      packages: [
        'react@19.2.3',
        'storybook@10.1.11',
        'tailwindcss@4.1.18',
      ],
      output: 'Ready',
      outputWithCheck: true,
      durationKey: 'workRouteWithPackages',
    },
  },
  {
    slug: 'figmavars-hooks',
    route: '/work/figmavars-hooks',
    title: 'FigmaVars Hooks',
    cardTitle: 'FigmaVars Hooks',
    category: 'DEVELOPER TOOLS',
    categoryColor: 'cyan',
    summary:
      'React 19 hooks library and CLI for Figma Variables REST API. Type-safe synchronization between Figma and React apps with 100% test coverage.',
    description:
      'React 19 hooks library and CLI for the official Figma Variables REST API. Type-safe synchronization between Figma and React apps with 100% test coverage.',
    role: 'Creator & Maintainer',
    timeline: '2024 - Present',
    publishedAt: '2024-12-01',
    pinned: true,
    featured: true,
    technologies: [
      'React 19',
      'TypeScript',
      'Figma REST API',
      'Vitest',
      'Node.js',
      'CLI',
      'npm',
    ],
    tags: ['React 19', 'TypeScript', 'Figma API'],
    commitHash: 'b7e4f1a',
    cardGradient: 'from-teal-500/10 via-cyan-500/5 to-transparent',
    caseStudyGradient: 'from-cyan-500/20 via-teal-500/10 to-transparent',
    terminal: {
      command: 'cd /work/@figmavars/hooks',
      loading: 'Loading open source library...',
      packages: [
        'react@19.2.3',
        'react-dom@19.2.3',
        'typescript@5.3.3',
        '@vitest/ui@2.1.9',
        'swr@2.3.7',
      ],
      output: 'Ready',
      outputWithCheck: true,
      durationKey: 'workRouteWithPackages',
    },
  },
  {
    slug: 'a11y-companion',
    route: '/work/a11y-companion',
    title: 'a11y Companion',
    cardTitle: 'a11y Companion',
    category: 'ACCESSIBILITY',
    categoryColor: 'green',
    summary:
      'Figma widget bringing A11Y Project Checklist into design workflows. 200+ active users with WCAG 2.2 tooltips, progress tracking, and bulk actions.',
    description:
      'Figma widget bringing The A11Y Project Checklist into design workflows. 200+ active users across design teams with WCAG 2.2 tooltips, progress tracking, bulk actions, and MD/HTML/JSON export capabilities.',
    role: 'Creator & Maintainer',
    timeline: '2023 - Present',
    publishedAt: '2023-08-01',
    technologies: [
      'Figma Widget API',
      'TypeScript',
      'WCAG 2.2',
      'React',
      'Figma Design',
      'Accessibility',
    ],
    tags: ['Figma Widget', 'WCAG 2.2', 'Accessibility'],
    commitHash: 'c9d2e8b',
    cardGradient: 'from-green-500/10 via-emerald-500/5 to-transparent',
    caseStudyGradient: 'from-green-500/20 via-emerald-500/10 to-transparent',
    terminal: {
      command: 'cd /work/a11y-companion',
      loading: 'Loading Figma Widget...',
      packages: [
        '@figma/widget-typings@*',
        'typescript@5.3.2',
        'eslint@8.54.0',
        'esbuild@*',
      ],
      output: 'Ready',
      outputWithCheck: true,
      durationKey: 'workRouteWithPackages',
    },
  },
  {
    slug: 'diabetic-utils',
    route: '/work/diabetic-utils',
    title: 'Diabetic Utils',
    cardTitle: 'Diabetic Utils',
    category: 'HEALTH TECH',
    categoryColor: 'pink',
    summary:
      'TypeScript library for glucose, A1C, and TIR calculations. Featured in Google AI Overview with 100% test coverage and adopted by health tech teams.',
    description:
      'TypeScript library for glucose, A1C, and Time in Range (TIR) calculations. Featured in Google AI Overview for diabetes developer tools with 100% test coverage and adopted by health tech teams.',
    role: 'Creator & Maintainer',
    timeline: '2023 - Present',
    publishedAt: '2023-10-01',
    featured: true,
    technologies: [
      'TypeScript',
      'Vitest',
      'npm',
      'Open Source',
      'Clinical Algorithms',
      'HealthKit',
    ],
    tags: ['TypeScript', 'npm', 'Health Tech'],
    commitHash: 'e4a7b3f',
    cardGradient: 'from-pink-500/10 via-red-500/5 to-transparent',
    caseStudyGradient: 'from-orange-500/20 via-yellow-500/10 to-transparent',
    terminal: {
      command: 'cd /work/diabetic-utils',
      loading: 'Loading open source library...',
      packages: ['typescript@5.3.3', 'vitest@1.0.0', 'tsup@8.0.0'],
      output: 'Ready',
      outputWithCheck: true,
      durationKey: 'workRouteWithPackages',
    },
  },
  {
    slug: 'variable-contract',
    route: '/work/variable-contract',
    title: 'Variable Contract',
    cardTitle: 'Variables Contract',
    category: 'STANDARDS',
    categoryColor: 'orange',
    summary:
      'Open specification for design variable governance and cross-tool synchronization. DTCG 2025.10 compliant, solving tool lock-in and version control gaps.',
    description:
      'Open specification for design variable governance and cross-tool synchronization. DTCG 2025.10 compliant, addressing tool lock-in and broken design-code handoff workflows affecting design systems teams globally.',
    role: 'Specification Author & W3C Community Contributor',
    timeline: '2024 - Present',
    publishedAt: '2024-10-01',
    technologies: [
      'JSON Schema',
      'DTCG Spec',
      'Design Tokens',
      'Version Control',
      'Cross-Tool Integration',
      'Governance Models',
    ],
    tags: ['Specification', 'Design Tokens', 'W3C'],
    commitHash: 'f9c231d',
    cardGradient: 'from-orange-500/10 via-yellow-500/5 to-transparent',
    caseStudyGradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
    terminal: {
      command: 'cd /work/variable-contract',
      loading: 'Initializing design system...',
      packages: ['@dtcg/validator@1.0.0', 'typescript@5.3.3', 'semver@7.5.4'],
      output: 'Ready',
      outputWithCheck: true,
      durationKey: 'workRouteWithPackages',
    },
  },
  {
    slug: 'skydio',
    route: '/work/skydio',
    title: 'Skydio Autonomy Widget',
    cardTitle: 'Skydio Component Library',
    category: 'CONSULTING',
    categoryColor: 'yellow',
    summary:
      'Built React/Storybook component library and onboarded product and engineering teams on adoption patterns for autonomous drone platform.',
    description:
      "Built production-grade React widget system for Skydio's Rivit design language, enabling real-time drone control with config-driven UI architecture and Storybook documentation.",
    role: 'Frontend Consultant - Component Architecture & Storybook',
    timeline: '2024 (Contract)',
    publishedAt: '2024-05-01',
    technologies: [
      'React',
      'TypeScript',
      'Storybook 9',
      'Tailwind CSS v4',
      'Vite',
      'Config-Driven UI',
    ],
    tags: ['React', 'Storybook', 'Consulting'],
    commitHash: 'd8e5c7b',
    cardGradient: 'from-teal-500/10 via-blue-500/5 to-transparent',
    caseStudyGradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    terminal: {
      command: 'cd /work/skydio',
      loading: 'Loading Storybook...',
      packages: [
        'react@19.1.0',
        'react-dom@^19.1.0',
        'storybook@9.0.15',
        'tailwindcss@4.1.11',
      ],
      output: 'Ready',
      outputWithCheck: true,
      durationKey: 'workRouteWithPackages',
    },
  },
]

export const FEATURED_PROJECTS = PROJECTS.filter(
  (project) => project.featured,
)

export const PROJECTS_BY_ROUTE = PROJECTS.reduce<Record<string, ProjectMeta>>(
  (acc, project) => {
    acc[project.route] = project
    return acc
  },
  {},
)

export const PROJECTS_BY_SLUG = PROJECTS.reduce<Record<string, ProjectMeta>>(
  (acc, project) => {
    acc[project.slug] = project
    return acc
  },
  {},
)

export function getProjectBySlug(slug: string): ProjectMeta {
  const project = PROJECTS_BY_SLUG[slug]
  if (!project) {
    throw new Error(`Unknown project slug: ${slug}`)
  }
  return project
}

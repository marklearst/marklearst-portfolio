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
  /** Published under an open source license with a public repository. */
  openSource?: boolean
  technologies: string[]
  tags: string[]
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
      "Shared React components and brand-specific token themes for Chevrolet, Buick, GMC, and Cadillac, with a WCAG 2.1 AA accessibility target.",
    description:
      "Led design and implementation of GM's cross-brand React design system, with shared components, brand-specific token themes, and a WCAG 2.1 AA accessibility target.",
    role: 'Senior Design Engineer, Lead - Authored Design Token Governance Document',
    timeline: 'Jun 2021 - Sep 2024 (3+ years)',
    publishedAt: '2024-09-01',
    pinned: true,
    featured: true,
    technologies: [
      'React',
      'React Native',
      'TypeScript',
      'Storybook',
      'Style Dictionary',
      'Design Tokens',
      'WCAG 2.1 AA',
      'Figma Variables',
      'GitHub Actions',
    ],
    tags: ['React', 'Design Tokens', 'Storybook'],
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
    openSource: true,
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
  },
  {
    slug: 'primitree',
    route: '/work/primitree',
    title: 'Primitree',
    cardTitle: 'Primitree',
    category: 'DEVELOPER TOOLS',
    categoryColor: 'cyan',
    summary:
      'Token architecture rules, Figma-export diffs that preserve identity, and DTCG, CSS, Tailwind, and TypeScript output from one pipeline.',
    description:
      'DTCG token pipeline that turns design system architecture into a checkable contract. Six packages covering a CLI, token graph, emitters for CSS, Tailwind and TypeScript, React hooks, and an MCP server.',
    role: 'Creator & Maintainer',
    timeline: '2025 - Present',
    publishedAt: '2026-08-25',
    featured: true,
    openSource: true,
    technologies: [
      'TypeScript',
      'DTCG 2025.10',
      'Node.js 24',
      'Turborepo',
      'Figma Variables API',
      'MCP',
      'React 19',
    ],
    tags: ['Design Tokens', 'TypeScript', 'CLI'],
  },
  {
    slug: 'glucoseiq',
    route: '/work/glucoseiq',
    title: 'GlucoseIQ',
    cardTitle: 'GlucoseIQ',
    category: 'HEALTH TECH',
    categoryColor: 'pink',
    summary:
      'Headless TypeScript library for CGM and glucose data. 17 clinical metrics, device connectors, FHIR interop, and SVG rendering over a zero-dependency core.',
    description:
      'Headless TypeScript library for CGM and glucose data. Five packages covering 17 clinical metrics, device connectors, FHIR and Open mHealth interop, SVG rendering, React bindings, and seeded test fixtures.',
    role: 'Creator & Maintainer',
    timeline: '2025 - Present',
    publishedAt: '2026-07-28',
    featured: true,
    openSource: true,
    technologies: [
      'TypeScript',
      'Node.js 24',
      'React 19',
      'Turborepo',
      'SVG',
      'FHIR',
      'Changesets',
    ],
    tags: ['TypeScript', 'Health Tech', 'npm'],
  },
  {
    slug: 'a11y-companion',
    route: '/work/a11y-companion',
    title: 'a11y Companion',
    cardTitle: 'a11y Companion',
    category: 'ACCESSIBILITY',
    categoryColor: 'green',
    summary:
      'Canvas-native accessibility review for Figma and FigJam. v3.0.0 adds three on-canvas audits, live contrast inspection, native Dev Mode annotations, and evidence-bound sign-off.',
    description:
      'Canvas-native accessibility review workflow for Figma and FigJam. v3.0.0 pairs The A11Y Project Checklist with live contrast inspection, three on-canvas audits, native Dev Mode annotations, evidence-bound sign-off, and a canonical Canvas Record.',
    role: 'Creator & Maintainer',
    timeline: '2023 - Present',
    publishedAt: '2026-07-12',
    featured: true,
    openSource: true,
    technologies: [
      'Figma Widget API',
      'TypeScript',
      'WCAG 2.2',
      'TanStack Start',
      'Design Tokens',
      'Accessibility',
    ],
    tags: ['Figma Widget', 'WCAG 2.2', 'Accessibility'],
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
    openSource: true,
    technologies: [
      'TypeScript',
      'Vitest',
      'npm',
      'Open Source',
      'Clinical Algorithms',
      'HealthKit',
    ],
    tags: ['TypeScript', 'npm', 'Health Tech'],
  },
  {
    slug: 'variable-design-standard',
    route: '/work/variable-design-standard',
    title: 'Variable Design Standard',
    cardTitle: 'Variable Design Standard',
    category: 'STANDARDS',
    categoryColor: 'orange',
    summary:
      'Open specification for design variable governance and cross-tool synchronization. DTCG 2025.10 compliant, solving tool lock-in and version control gaps.',
    description:
      'Open specification for design variable governance and cross-tool synchronization. DTCG 2025.10 compliant, addressing tool lock-in and broken design-code handoff workflows affecting design systems teams globally.',
    role: 'Specification Author & W3C Community Contributor',
    timeline: '2024 - Present',
    publishedAt: '2024-10-01',
    featured: true,
    openSource: true,
    technologies: [
      'JSON Schema',
      'DTCG Spec',
      'Design Tokens',
      'Version Control',
      'Cross-Tool Integration',
      'Governance Models',
    ],
    tags: ['Specification', 'Design Tokens', 'W3C'],
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
      "Built a React mission-control widget implementing Skydio's Rivit design language, with configurable actions, shared state, and Storybook documentation.",
    role: 'Frontend Consultant - Component Architecture & Storybook',
    timeline: '2024 (Contract)',
    publishedAt: '2024-05-01',
    featured: true,
    technologies: [
      'React',
      'TypeScript',
      'Storybook',
      'Tailwind CSS',
      'Vite',
      'Config-Driven UI',
    ],
    tags: ['React', 'Storybook', 'Consulting'],
  },
]

const publishedTimestamp = (project: ProjectMeta) =>
  project.publishedAt ? new Date(project.publishedAt).getTime() : 0

const SELECTED_PROJECT_ORDER = ['primitree', 'skydio', 'aurora-gm', 'a11y-companion', 'glucoseiq']
const selectedRank = (slug: string) => {
  const index = SELECTED_PROJECT_ORDER.indexOf(slug)
  return index === -1 ? SELECTED_PROJECT_ORDER.length : index
}

/** Shared by the Work index and previous/next case-study navigation. */
export const PROJECTS_IN_DISPLAY_ORDER = [...PROJECTS].sort((a, b) => {
  const priority = selectedRank(a.slug) - selectedRank(b.slug)
  return priority || publishedTimestamp(b) - publishedTimestamp(a)
})

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

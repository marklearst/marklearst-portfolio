import { DURATION } from './terminal-timing'
import { MONOKAI } from './monokai-colors'

/**
 * Terminal command configurations for route-specific transitions
 * Each route gets a unique command sequence with loading states
 */

export interface TerminalCommand {
  route: string
  command: string
  loading?: string
  packages?: string[]
  output?: string
  duration?: number
  color?: string // Progress bar color (Monokai color)
}

export const ROUTE_COMMANDS: Record<string, TerminalCommand> = {
  '/': {
    route: '/',
    command: '❯ whoami',
    output: 'marklearst',
    packages: ['Senior Frontend Engineer'],
    duration: DURATION.homeRoute,
    color: MONOKAI.cyan,
  },

  '/work/variable-contract': {
    route: '/work/variable-contract',
    command: '❯ cd /work/variable-contract',
    loading: 'Initializing design system...',
    packages: ['@dtcg/validator@1.0.0', 'typescript@5.3.3', 'semver@7.5.4'],
    output: '✓ Ready',
    duration: DURATION.workRouteWithPackages,
    color: MONOKAI.orange,
  },

  '/work/glucoseiq': {
    route: '/work/glucoseiq',
    command: '❯ cd /work/glucoseiq',
    loading: 'Loading health tech project...',
    packages: ['@apple/healthkit@2.0.0', 'core-ml@1.5.0', 'swift-bridge@0.8.2'],
    output: '✓ Ready',
    duration: DURATION.workRouteWithPackages,
    color: MONOKAI.pink,
  },

  '/work/diabetic-utils': {
    route: '/work/diabetic-utils',
    command: '❯ cd /work/diabetic-utils',
    loading: 'Loading open source library...',
    packages: ['typescript@5.3.3', 'vitest@1.0.0', 'tsup@8.0.0'],
    output: '✓ Ready',
    duration: DURATION.workRouteWithPackages,
    color: MONOKAI.pink,
  },

  '/work/figmavars-hooks': {
    route: '/work/figmavars-hooks',
    command: '❯ cd /work/@figmavars/hooks',
    loading: 'Loading open source library...',
    packages: [
      'react@19.2.3',
      'react-dom@19.2.3',
      'typescript@5.3.3',
      '@vitest/ui@2.1.9',
      'swr@2.3.7',
    ],
    output: '✓ Ready',
    duration: DURATION.workRouteWithPackages,
    color: MONOKAI.cyan,
  },

  '/work/aurora-gm': {
    route: '/work/aurora-gm',
    command: '❯ cd /work/aurora-gm',
    loading: 'Loading design system...',
    packages: ['react@18.2.0', 'react-dom@18.2.0', 'storybook@9.0.15'],
    output: '✓ Ready',
    duration: DURATION.workRouteWithPackages,
    color: MONOKAI.purple,
  },

  '/work/skydio-autonomy-widget': {
    route: '/work/skydio-autonomy-widget',
    command: '❯ cd /work/skydio-autonomy-widget',
    loading: 'Loading Storybook...',
    packages: [
      'react@19.1.0',
      'react-dom@^19.1.0',
      'storybook@9.0.15',
      'tailwindcss@4.1.11',
    ],
    output: '✓ Ready',
    duration: DURATION.workRouteWithPackages,
    color: MONOKAI.yellow,
  },

  '/work/a11y-companion': {
    route: '/work/a11y-companion',
    command: '❯ cd /work/a11y-companion',
    loading: 'Loading Figma Widget...',
    packages: [
      '@figma/widget-typings@*',
      'typescript@5.3.2',
      'eslint@8.54.0',
      'esbuild@*',
    ],
    output: '✓ Ready',
    duration: DURATION.workRouteWithPackages,
    color: MONOKAI.green,
  },
}

/**
 * Map of routes to their project colors
 */
const ROUTE_COLORS: Record<string, string> = {
  '/work/aurora-gm': MONOKAI.purple, // Design Systems
  '/work/figmavars-hooks': MONOKAI.cyan, // Developer Tools
  '/work/a11y-companion': MONOKAI.green, // Accessibility
  '/work/diabetic-utils': MONOKAI.pink, // Health Tech
  '/work/variable-contract': MONOKAI.orange, // Standards
  '/work/skydio-autonomy-widget': MONOKAI.yellow, // Consulting
}

/**
 * Get terminal command for a given route
 * Falls back to generic cd command for unknown routes
 */
export function getCommandForRoute(route: string): TerminalCommand {
  // Check exact match first
  if (ROUTE_COMMANDS[route]) {
    return ROUTE_COMMANDS[route]
  }

  // Check if it's a work route
  if (route.startsWith('/work/')) {
    const slug = route.split('/').pop() || 'project'
    const color = ROUTE_COLORS[route] || MONOKAI.green

    return {
      route,
      command: `❯ cd ${route}`,
      loading: `Loading ${slug}...`,
      output: '✓ Ready',
      duration: DURATION.workRoute,
      color,
    }
  }

  // Check if it's a blog route
  if (route.startsWith('/blog/')) {
    const slug = route.split('/').pop() || 'post'
    return {
      route,
      command: `❯ cat ~/blog/${slug}.md`,
      loading: 'Reading markdown file...',
      output: '✓ Loaded',
      duration: DURATION.blogRoute,
    }
  }

  // Check if it's a lab route
  if (route.startsWith('/lab/')) {
    const slug = route.split('/').pop() || 'experiment'
    return {
      route,
      command: `❯ npm run lab:${slug}`,
      loading: 'Starting experiment...',
      output: '✓ Running',
      duration: DURATION.labRoute,
    }
  }

  // Generic fallback
  return {
    route,
    command: `❯ cd ${route}`,
    output: '✓ Ready',
    duration: DURATION.homeRoute,
  }
}

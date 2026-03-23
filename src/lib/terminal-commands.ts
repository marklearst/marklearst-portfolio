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
    duration: DURATION.homeRoute,
    color: MONOKAI.cyan, // Cyan for terminal/command vibe
  },

  '/work/variable-contract': {
    route: '/work/variable-contract',
    command: '❯ cd /work/variable-contract',
    loading: 'Initializing design system...',
    packages: ['@dtcg/validator@1.0.0', 'typescript@5.3.3', 'semver@7.5.4'],
    output: '✓ Ready',
    duration: DURATION.workRouteWithPackages,
  },

  '/work/glucoseiq': {
    route: '/work/glucoseiq',
    command: '❯ cd /work/glucoseiq',
    loading: 'Loading health tech project...',
    packages: [
      '@apple/healthkit@2.0.0',
      'core-ml@1.5.0',
      'swift-bridge@0.8.2',
    ],
    output: '✓ Ready',
    duration: DURATION.workRouteWithPackages,
  },

  '/work/diabetic-utils': {
    route: '/work/diabetic-utils',
    command: '❯ cd /work/diabetic-utils',
    loading: 'Loading open source library...',
    packages: ['typescript@5.3.3', 'vitest@1.0.0', 'tsup@8.0.0'],
    output: '✓ Ready',
    duration: DURATION.workRouteWithPackages,
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
  '/work/skydio': MONOKAI.yellow, // Consulting
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

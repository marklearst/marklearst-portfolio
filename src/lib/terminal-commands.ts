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
}

export const ROUTE_COMMANDS: Record<string, TerminalCommand> = {
  '/': {
    route: '/',
    command: '❯ whoami',
    output: 'marklearst',
    duration: 800,
  },

  '/work/variable-contract': {
    route: '/work/variable-contract',
    command: '❯ cd /work/variable-contract',
    loading: 'Initializing design system...',
    packages: ['@dtcg/validator@1.0.0', 'typescript@5.3.3', 'semver@7.5.4'],
    output: '✓ Ready',
    duration: 1500,
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
    duration: 1500,
  },

  '/work/diabetic-utils': {
    route: '/work/diabetic-utils',
    command: '❯ cd /work/diabetic-utils',
    loading: 'Loading open source library...',
    packages: ['typescript@5.3.3', 'vitest@1.0.0', 'tsup@8.0.0'],
    output: '✓ Ready',
    duration: 1500,
  },
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
    return {
      route,
      command: `❯ cd ${route}`,
      loading: `Loading ${slug}...`,
      output: '✓ Ready',
      duration: 1200,
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
      duration: 1000,
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
      duration: 1200,
    }
  }

  // Generic fallback
  return {
    route,
    command: `❯ cd ${route}`,
    output: '✓ Ready',
    duration: 800,
  }
}

import { PROJECTS, type ProjectTerminalDurationKey } from '@/data/projects'
import { CATEGORY_COLORS } from '@/lib/category-colors'
import { MONOKAI } from './monokai-colors'
import { DURATION } from './terminal-timing'

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

const COMMAND_PREFIX = '❯ '
const OUTPUT_PREFIX = '✓ '

const DURATION_BY_KEY: Record<ProjectTerminalDurationKey, number> = {
  homeRoute: DURATION.homeRoute,
  workRoute: DURATION.workRoute,
  workRouteWithPackages: DURATION.workRouteWithPackages,
}

const formatCommand = (command: string) => `${COMMAND_PREFIX}${command}`

const formatOutput = (output: string, withCheck?: boolean) =>
  withCheck ? `${OUTPUT_PREFIX}${output}` : output

const PROJECT_ROUTE_COMMANDS = PROJECTS.reduce<Record<string, TerminalCommand>>(
  (acc, project) => {
    const terminal = project.terminal
    const output = terminal.output
      ? formatOutput(terminal.output, terminal.outputWithCheck)
      : undefined

    acc[project.route] = {
      route: project.route,
      command: formatCommand(terminal.command),
      loading: terminal.loading,
      packages: terminal.packages,
      output,
      duration: DURATION_BY_KEY[terminal.durationKey],
      color: CATEGORY_COLORS[project.categoryColor],
    }

    return acc
  },
  {},
)

export const ROUTE_COMMANDS: Record<string, TerminalCommand> = {
  '/': {
    route: '/',
    command: formatCommand('whoami'),
    loading: 'Resolving identity...',
    output: formatOutput('marklearst', true),
    packages: ['Senior Frontend Engineer'],
    duration: DURATION.homeRoute,
    color: MONOKAI.cyan,
  },
  ...PROJECT_ROUTE_COMMANDS,
  '/work/glucoseiq': {
    route: '/work/glucoseiq',
    command: formatCommand('cd /work/glucoseiq'),
    loading: 'Loading health tech project...',
    packages: ['@apple/healthkit@2.0.0', 'core-ml@1.5.0', 'swift-bridge@0.8.2'],
    output: formatOutput('Ready', true),
    duration: DURATION.workRouteWithPackages,
    color: MONOKAI.pink,
  },
}

/**
 * Map of routes to their project colors
 */
const ROUTE_COLORS: Record<string, string> = {
  ...PROJECTS.reduce<Record<string, string>>((acc, project) => {
    acc[project.route] = CATEGORY_COLORS[project.categoryColor]
    return acc
  }, {}),
  '/work/glucoseiq': MONOKAI.pink,
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
      command: formatCommand(`cd ${route}`),
      loading: `Loading ${slug}...`,
      output: formatOutput('Ready', true),
      duration: DURATION.workRoute,
      color,
    }
  }

  // Check if it's a blog route
  if (route.startsWith('/blog/')) {
    const slug = route.split('/').pop() || 'post'
    return {
      route,
      command: formatCommand(`cat ~/blog/${slug}.md`),
      loading: 'Reading markdown file...',
      output: formatOutput('Loaded', true),
      duration: DURATION.blogRoute,
    }
  }

  // Check if it's a lab route
  if (route.startsWith('/lab/')) {
    const slug = route.split('/').pop() || 'experiment'
    return {
      route,
      command: formatCommand(`npm run lab:${slug}`),
      loading: 'Starting experiment...',
      output: formatOutput('Running', true),
      duration: DURATION.labRoute,
    }
  }

  // Generic fallback
  return {
    route,
    command: formatCommand(`cd ${route}`),
    output: formatOutput('Ready', true),
    duration: DURATION.homeRoute,
  }
}

/**
 * Monokai Pro Color System
 * Based on 10 years of coding theme preference
 * https://monokai.pro/
 */

export const MONOKAI = {
  // Primary syntax colors
  pink: '#ff6188',
  orange: '#fb9866',
  yellow: '#ffd866',
  green: '#a9dc75',
  cyan: '#78dce8',
  purple: '#ab9df2',

  // Background colors
  background: '#231f22',
  backgroundAlt: '#2e2a2e',

  // Foreground
  foreground: 'rgb(252, 252, 250)',

  // Semantic mappings for terminal
  terminal: {
    prompt: '#a9dc75', // Green for ❯
    command: '#78dce8', // Cyan for commands
    path: '#ffd866', // Yellow for file paths
    keyword: '#ff6188', // Pink for git/pnpm/cd
    success: '#a9dc75', // Green for ✓
    number: '#ab9df2', // Purple for numbers/versions
    string: '#ffd866', // Yellow for strings
    comment: '#727072', // Gray for comments
    error: '#ff6188', // Pink for errors
  },

  // Particle system distribution
  particles: [
    '#ff6188', // Pink - React/UI
    '#fb9866', // Orange - HTML
    '#ffd866', // Yellow - JavaScript
    '#a9dc75', // Green - Functions
    '#78dce8', // Cyan - TypeScript
    '#ab9df2', // Purple - Keywords
  ],
} as const

export type MonokaiColor = (typeof MONOKAI.particles)[number]

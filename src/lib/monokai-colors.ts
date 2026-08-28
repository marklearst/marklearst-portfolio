import baseTokens from '@/tokens/base.json'

// Compatibility values for inline styles and server-rendered share images.
// New UI styles consume the generated semantic CSS variables directly.
const hex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  '#' + [r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')
const base = baseTokens.color.base
const ink = hex(base.white.$value)
const secondary = hex(base.gray.$value)
const muted = hex(base.muted.$value)
const orange = hex(base.orange.$value)
const success = hex(baseTokens.color.status.success.$value)
const danger = hex(baseTokens.color.status.danger.$value)

export const MONOKAI = {
  pink: orange,
  orange,
  yellow: secondary,
  green: secondary,
  cyan: ink,
  purple: muted,
  background: hex(base.black.$value),
  backgroundAlt: hex(base.smoke.$value),
  foreground: ink,
  terminal: {
    prompt: secondary,
    command: ink,
    path: secondary,
    keyword: orange,
    success,
    number: muted,
    string: secondary,
    comment: muted,
    error: danger,
  },
  particles: [ink, secondary, muted, orange],
} as const

export type MonokaiColor = (typeof MONOKAI.particles)[number]

import tokens from '@/tokens/generated/site.tokens.json'

// Compatibility values for server-rendered share images, which cannot read CSS
// variables. They follow the dark theme's semantic tokens in Primitree's build
// output. UI styles read the generated CSS variables instead.
type TokenNode = { $value?: unknown; [key: string]: unknown }

function hex(path: string): string {
  let node: TokenNode | undefined = tokens as TokenNode
  for (const key of path.split('.')) node = node?.[key] as TokenNode | undefined
  const value = node?.$value
  if (typeof value === 'string') return hex(value.slice(1, -1))
  const color = value as { hex?: string } | undefined
  if (!color?.hex) throw new Error(`No color token at ${path}`)
  return color.hex.toLowerCase()
}

const ink = hex('semantic.color.ink.primary')
const secondary = hex('semantic.color.ink.secondary')
const muted = hex('semantic.color.ink.muted')
const orange = hex('semantic.color.accent.primary')
const success = hex('semantic.color.status.pass')
const danger = hex('semantic.color.status.fail')

export const MONOKAI = {
  pink: orange,
  orange,
  yellow: secondary,
  green: secondary,
  cyan: ink,
  purple: muted,
  background: hex('semantic.color.surface.canvas'),
  backgroundAlt: hex('semantic.color.surface.base'),
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

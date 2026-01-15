import { MONOKAI } from '@/lib/monokai-colors'

export type ArtifactTagCategory =
  | 'design-systems'
  | 'react-typescript'
  | 'wcag-a11y'
  | 'open-source'
  | 'developer-tools'
  | 'health-tech'

const CATEGORY_COLORS: Record<ArtifactTagCategory, string> = {
  'design-systems': MONOKAI.cyan,
  'react-typescript': MONOKAI.purple,
  'wcag-a11y': MONOKAI.yellow,
  'open-source': MONOKAI.pink,
  'developer-tools': MONOKAI.orange,
  'health-tech': MONOKAI.green,
}

const TAG_CATEGORY_MAP: Record<string, ArtifactTagCategory> = {
  design: 'design-systems',
  'design-system': 'design-systems',
  'design-systems': 'design-systems',
  tokens: 'design-systems',
  theming: 'design-systems',
  variables: 'design-systems',
  standards: 'open-source',
  governance: 'design-systems',
  react: 'react-typescript',
  typescript: 'react-typescript',
  javascript: 'react-typescript',
  frontend: 'react-typescript',
  next: 'react-typescript',
  motion: 'react-typescript',
  performance: 'react-typescript',
  wcag: 'wcag-a11y',
  a11y: 'wcag-a11y',
  accessibility: 'wcag-a11y',
  'open-source': 'open-source',
  oss: 'open-source',
  'developer-tools': 'developer-tools',
  tooling: 'developer-tools',
  cli: 'developer-tools',
  devtools: 'developer-tools',
  'health-tech': 'health-tech',
  health: 'health-tech',
  glucose: 'health-tech',
}

const normalizeTag = (tag: string) => tag.trim().toLowerCase()

export const getArtifactTagCategory = (tag: string): ArtifactTagCategory =>
  TAG_CATEGORY_MAP[normalizeTag(tag)] ?? 'react-typescript'

export const getArtifactTagColor = (tag: string) =>
  CATEGORY_COLORS[getArtifactTagCategory(tag)]

export const getArtifactAccentColor = (tags: string[]) => {
  for (const tag of tags) {
    const category = TAG_CATEGORY_MAP[normalizeTag(tag)]
    if (category) {
      return CATEGORY_COLORS[category]
    }
  }

  return CATEGORY_COLORS['react-typescript']
}

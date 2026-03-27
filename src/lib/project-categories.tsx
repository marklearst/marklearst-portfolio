import type { ReactNode } from 'react'
import type { ProjectCategory, ProjectCategoryColor } from '@/data/projects'
import { MONOKAI } from './monokai-colors'

const ICON_STYLE = { width: '14px', height: '14px' }

const CATEGORY_ICONS: Record<ProjectCategory, ReactNode> = {
  'DESIGN SYSTEMS': (
    <svg
      style={ICON_STYLE}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z'
      />
    </svg>
  ),
  'DEVELOPER TOOLS': (
    <svg
      style={ICON_STYLE}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
      />
    </svg>
  ),
  ACCESSIBILITY: (
    <svg
      style={ICON_STYLE}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
      />
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
      />
    </svg>
  ),
  'HEALTH TECH': (
    <svg
      style={ICON_STYLE}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
      />
    </svg>
  ),
  STANDARDS: (
    <svg
      style={ICON_STYLE}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      />
    </svg>
  ),
  CONSULTING: (
    <svg
      style={ICON_STYLE}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
      />
    </svg>
  ),
}

const normalizeCategory = (category: string): ProjectCategory | null => {
  const normalized = category.toUpperCase().trim()

  switch (normalized) {
    case 'DESIGN SYSTEMS':
      return 'DESIGN SYSTEMS'
    case 'DEVELOPER TOOLS':
      return 'DEVELOPER TOOLS'
    case 'ACCESSIBILITY':
      return 'ACCESSIBILITY'
    case 'HEALTH TECH':
      return 'HEALTH TECH'
    case 'STANDARDS':
      return 'STANDARDS'
    case 'CONSULTING':
      return 'CONSULTING'
    default:
      return null
  }
}

export const getCategoryIcon = (category: string): ReactNode | null => {
  const normalized = normalizeCategory(category)
  return normalized ? CATEGORY_ICONS[normalized] : null
}

export const getCategoryColor = (color: ProjectCategoryColor): string =>
  MONOKAI[color]

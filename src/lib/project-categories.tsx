import { ComponentIcon, CodeIcon, AccessibilityIcon, HealthIcon, FileTextIcon, BriefcaseIcon } from '@/components/ui/Icon'
import type { ReactNode } from 'react'
import type { ProjectCategory, ProjectCategoryColor } from '@/data/projects'
import { CATEGORY_COLORS } from './category-colors'

const CATEGORY_ICONS: Record<ProjectCategory, ReactNode> = {
  'DESIGN SYSTEMS': <ComponentIcon size={14} />,
  'DEVELOPER TOOLS': <CodeIcon size={14} />,
  ACCESSIBILITY: <AccessibilityIcon size={14} />,
  'HEALTH TECH': <HealthIcon size={14} />,
  STANDARDS: <FileTextIcon size={14} />,
  CONSULTING: <BriefcaseIcon size={14} />,
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
  CATEGORY_COLORS[color]

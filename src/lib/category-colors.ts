import type { ProjectCategoryColor } from '@/data/projects'
import { MONOKAI } from './monokai-colors'

export const CATEGORY_COLORS: Record<ProjectCategoryColor, string> = {
  purple: MONOKAI.purple,
  cyan: MONOKAI.cyan,
  green: MONOKAI.green,
  pink: MONOKAI.pink,
  orange: MONOKAI.orange,
  yellow: MONOKAI.yellow,
}

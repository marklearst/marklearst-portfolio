import path from 'node:path'
import fs from 'node:fs/promises'
import type { ComponentType, ReactElement, ReactNode } from 'react'
import matter from 'gray-matter'
import type { ProjectCategory, ProjectCategoryColor } from '@/data/projects'
import {
  ExternalLinkIcon,
  FigmaIcon,
  GitHubIcon,
  NpmIcon,
} from '@/components/CaseStudyLinkIcons'
import A11yCompanionContent from '@/content/case-studies/a11y-companion.mdx'
import AuroraGMContent from '@/content/case-studies/aurora-gm.mdx'
import DiabeticUtilsContent from '@/content/case-studies/diabetic-utils.mdx'
import FigmaVarsHooksContent from '@/content/case-studies/figmavars-hooks.mdx'
import HailstormContent from '@/content/case-studies/hailstorm.mdx'
import SkydioContent from '@/content/case-studies/skydio.mdx'
import VariableDesignStandardContent from '@/content/case-studies/variable-design-standard.mdx'

type CaseStudyLinkIcon = 'github' | 'npm' | 'figma' | 'external'

type CaseStudyLinkInput = {
  label: string
  href: string
  icon?: CaseStudyLinkIcon
}

type CaseStudyImpact = {
  metric: string
  description: string
}

export type CaseStudyFrontmatter = {
  slug: string
  title: string
  category: ProjectCategory
  categoryColor: ProjectCategoryColor
  description: string
  role: string
  timeline: string
  technologies: string[]
  links?: CaseStudyLinkInput[]
  impact?: CaseStudyImpact[]
  gradient: string
}

export type CaseStudyContent = Omit<CaseStudyFrontmatter, 'links'> & {
  links: { label: string; href: string; icon?: ReactNode }[]
  Content: MDXContent
}

type MDXComponents = Record<string, ComponentType<unknown>>
type MDXContent = (props: { components?: MDXComponents }) => ReactElement

const CONTENT_ROOT = path.join(process.cwd(), 'src', 'content', 'case-studies')

const CASE_STUDY_ENTRIES: Record<
  string,
  {
    Content: MDXContent
    fileName: string
  }
> = {
  'aurora-gm': {
    Content: AuroraGMContent,
    fileName: 'aurora-gm.mdx',
  },
  'figmavars-hooks': {
    Content: FigmaVarsHooksContent,
    fileName: 'figmavars-hooks.mdx',
  },
  'a11y-companion': {
    Content: A11yCompanionContent,
    fileName: 'a11y-companion.mdx',
  },
  'diabetic-utils': {
    Content: DiabeticUtilsContent,
    fileName: 'diabetic-utils.mdx',
  },
  hailstorm: {
    Content: HailstormContent,
    fileName: 'hailstorm.mdx',
  },
  'variable-design-standard': {
    Content: VariableDesignStandardContent,
    fileName: 'variable-design-standard.mdx',
  },
  skydio: {
    Content: SkydioContent,
    fileName: 'skydio.mdx',
  },
}

const LINK_ICON_MAP: Record<CaseStudyLinkIcon, () => ReactNode> = {
  github: () => <GitHubIcon />,
  npm: () => <NpmIcon />,
  figma: () => <FigmaIcon />,
  external: () => <ExternalLinkIcon />,
}

const resolveLinks = (links: CaseStudyLinkInput[] = []) =>
  links.map((link) => ({
    ...link,
    icon: link.icon ? LINK_ICON_MAP[link.icon]?.() : undefined,
  }))

const loadFrontmatter = async (fileName: string) => {
  const raw = await fs.readFile(path.join(CONTENT_ROOT, fileName), 'utf8')
  const { data } = matter(raw)
  return data as CaseStudyFrontmatter
}

export const getCaseStudyBySlug = async (
  slug: string,
): Promise<CaseStudyContent> => {
  const entry = CASE_STUDY_ENTRIES[slug]
  if (!entry) {
    throw new Error(`Unknown case study slug: ${slug}`)
  }

  const frontmatter = await loadFrontmatter(entry.fileName)

  return {
    ...frontmatter,
    links: resolveLinks(frontmatter.links),
    Content: entry.Content,
  }
}

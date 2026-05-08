import path from 'node:path'
import fs from 'node:fs/promises'
import type { ComponentType, ReactElement } from 'react'
import matter from 'gray-matter'
import { estimateReadingTime } from '@/lib/content/reading-time'
import TerminalNavigationContent from '@/content/artifacts/terminal-navigation.mdx'
import VariableDesignStandardSemverContent from '@/content/artifacts/variable-design-standard-semver.mdx'
import AgenticWorkflowsContent from '@/content/artifacts/agentic-workflows-claude-cursor.mdx'
import A11yCompanionV2ContrastHonestyContent from '@/content/artifacts/a11y-companion-v2-contrast-honesty.mdx'

export type ArtifactFrontmatter = {
  title: string
  slug: string
  summary: string
  tags: string[]
  published_at: string
  pinned?: boolean
}

export type ArtifactContent = ArtifactFrontmatter & {
  Content: MDXContent
  readingTime: {
    minutes: number
    words: number
  }
  publishedAt: Date
}

type MDXComponents = Record<string, ComponentType<unknown>>
type MDXContent = (props: { components?: MDXComponents }) => ReactElement

const CONTENT_ROOT = path.join(process.cwd(), 'src', 'content', 'artifacts')

const ARTIFACT_ENTRIES: Array<{
  fileName: string
  Content: MDXContent
}> = [
  {
    fileName: 'a11y-companion-v2-contrast-honesty.mdx',
    Content: A11yCompanionV2ContrastHonestyContent,
  },
  {
    fileName: 'agentic-workflows-claude-cursor.mdx',
    Content: AgenticWorkflowsContent,
  },
  {
    fileName: 'terminal-navigation.mdx',
    Content: TerminalNavigationContent,
  },
  {
    fileName: 'variable-design-standard-semver.mdx',
    Content: VariableDesignStandardSemverContent,
  },
]

const resolveArtifact = async (
  entry: (typeof ARTIFACT_ENTRIES)[number],
): Promise<ArtifactContent> => {
  const raw = await fs.readFile(path.join(CONTENT_ROOT, entry.fileName), 'utf8')
  const { data, content } = matter(raw)
  const frontmatter = data as ArtifactFrontmatter
  const readingTime = estimateReadingTime(content)
  const publishedAt = new Date(frontmatter.published_at)

  return {
    ...frontmatter,
    pinned: Boolean(frontmatter.pinned),
    publishedAt,
    readingTime,
    Content: entry.Content,
  }
}

export const getArtifacts = async (): Promise<ArtifactContent[]> => {
  const artifacts = await Promise.all(ARTIFACT_ENTRIES.map(resolveArtifact))

  return artifacts.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return b.publishedAt.getTime() - a.publishedAt.getTime()
  })
}

export const getArtifactBySlug = async (slug: string) => {
  const artifacts = await Promise.all(ARTIFACT_ENTRIES.map(resolveArtifact))
  const artifact = artifacts.find((item) => item.slug === slug)
  if (!artifact) {
    throw new Error(`Unknown artifact slug: ${slug}`)
  }

  return artifact
}

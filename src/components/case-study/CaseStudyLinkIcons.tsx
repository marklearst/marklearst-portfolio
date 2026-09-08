import { ExternalLinkIcon, FigmaIcon, GithubIcon, NpmIcon } from '@/components/ui/Icon'
import type { CaseStudyLinkIcon } from '@/lib/content/case-studies'

/** Content stores icon names; presentation resolves them to React components. */
export const caseStudyLinkIcons = {
  github: GithubIcon,
  npm: NpmIcon,
  figma: FigmaIcon,
  external: ExternalLinkIcon,
} satisfies Record<CaseStudyLinkIcon, typeof GithubIcon>

import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from 'react'
import { isValidElement } from 'react'
import Image from 'next/image'
import CodeBlock from '@/components/CodeBlock'
import { CaseStudyMutedList } from '@/components/CaseStudyTypography'
import { MONOKAI } from '@/lib/monokai-colors'
import styles from '@/components/CaseStudyLayout.module.css'

const extractCodeString = (value: ReactNode) => {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? item : '')).join('')
  }
  return ''
}

const Pre = ({ children, ...rest }: ComponentPropsWithoutRef<'pre'>) => {
  if (!isValidElement(children)) {
    return (
      <pre {...rest}>
        <code>{children}</code>
      </pre>
    )
  }

  const childProps = children.props as {
    className?: string
    children?: ReactNode
  }
  const className = childProps.className ?? ''
  const language = className.replace('language-', '') || 'typescript'
  const code = extractCodeString(childProps.children)

  return <CodeBlock code={code} language={language} />
}

const ArtifactHeading = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<'h2'>) => (
  <h2
    className={className}
    {...rest}
  />
)

const ArtifactSubheading = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<'h3'>) => (
  <h3
    className={className}
    {...rest}
  />
)

const ArtifactLink = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<'a'>) => (
  <a
    className={className}
    {...rest}
  />
)

const baseArtifactMdxComponents = {
  p: ({ className, ...rest }: ComponentPropsWithoutRef<'p'>) => (
    <p className={`${styles.paragraph} ${className ?? ''}`} {...rest} />
  ),
  img: ({ src, alt, className, title }: ComponentPropsWithoutRef<'img'>) => {
    if (!src || typeof src !== 'string') return null

    return (
      <Image
        src={src}
        alt={alt ?? ''}
        title={title}
        width={1600}
        height={900}
        sizes='100vw'
        className={`mt-6 mb-2 h-auto w-full rounded-[8px] ${className ?? ''}`}
      />
    )
  },
  ul: (props: ComponentPropsWithoutRef<'ul'>) => (
    <CaseStudyMutedList className='space-y-3' {...props} />
  ),
  h2: ArtifactHeading,
  h3: ArtifactSubheading,
  a: ArtifactLink,
  pre: Pre,
} as Record<string, ComponentType<unknown>>

export const createArtifactMdxComponents = (accent: string) => {
  // Existing callers pass a category accent; narrative headings use shared ink.
  void accent
  return baseArtifactMdxComponents
}

export const artifactMdxComponents = createArtifactMdxComponents(MONOKAI.cyan)

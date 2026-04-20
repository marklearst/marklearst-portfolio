import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from 'react'
import { isValidElement } from 'react'
import CodeBlock from '@/components/CodeBlock'
import { CaseStudySection } from '@/components/CaseStudySection'
import {
  CaseStudyMutedList,
  CaseStudyMutedText,
  CaseStudyParagraph,
  CaseStudySubheading,
} from '@/components/CaseStudyTypography'
import { MONOKAI } from '@/lib/monokai-colors'

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

export const createCaseStudyMdxComponents = (accent: string) => {
  const Subheading = (props: ComponentPropsWithoutRef<'h3'>) => (
    <CaseStudySubheading {...props} color={accent} />
  )

  // Custom paragraph that renders as <p> to avoid div-in-p hydration errors
  const Paragraph = ({
    children,
    className,
    ...rest
  }: ComponentPropsWithoutRef<'p'>) => {
    const classes = className
      ? `text-lg leading-relaxed ${className}`
      : 'text-lg leading-relaxed'

    return (
      <p
        className={classes}
        style={{ color: `${MONOKAI.foreground}cc` }}
        {...rest}
      >
        {children}
      </p>
    )
  }

  return {
    CaseStudySection,
    CaseStudySubheading: Subheading,
    CaseStudyMutedText,
    CaseStudyParagraph,
    CaseStudyMutedList,
    CodeBlock,
    p: Paragraph,
    // Passthrough anchor - prevents MDX from double-wrapping links
    a: ({ children, ...rest }: ComponentPropsWithoutRef<'a'>) => (
      <a {...rest}>{children}</a>
    ),
    h3: Subheading,
    ul: (props: ComponentPropsWithoutRef<'ul'>) => (
      <CaseStudyMutedList className='space-y-2' {...props} />
    ),
    pre: Pre,
  } as Record<string, ComponentType<unknown>>
}

export const caseStudyMdxComponents = createCaseStudyMdxComponents(
  MONOKAI.foreground,
)

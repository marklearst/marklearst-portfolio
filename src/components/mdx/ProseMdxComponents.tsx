import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import type { MDXComponents } from 'mdx/types'
import { isValidElement } from 'react'
import CodeBlock from '@/components/content/CodeBlock'
import styles from '@/components/content/Prose.module.css'

function extractCodeString(value: ReactNode) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? item : '')).join('')
  }
  return ''
}

function Pre({ children, ...rest }: ComponentPropsWithoutRef<'pre'>) {
  if (!isValidElement<{ className?: string; children?: ReactNode }>(children)) {
    return (
      <pre {...rest}>
        <code>{children}</code>
      </pre>
    )
  }

  const language = (children.props.className ?? '').replace('language-', '') || 'typescript'
  return <CodeBlock code={extractCodeString(children.props.children)} language={language} />
}

function Paragraph({ children, className, ...rest }: ComponentPropsWithoutRef<'p'>) {
  const classes = className ? `${styles.paragraph} ${className}` : styles.paragraph
  return <p className={classes} {...rest}>{children}</p>
}

export const proseMdxComponents = {
  p: Paragraph,
  a: ({ children, ...rest }: ComponentPropsWithoutRef<'a'>) => (
    <a {...rest}>{children}</a>
  ),
  pre: Pre,
} satisfies MDXComponents

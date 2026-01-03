import type { ReactNode } from 'react'
import { MONOKAI } from '@/lib/monokai-colors'

const MUTED_TEXT = `${MONOKAI.foreground}b3`
const SUBHEADING_CLASS = 'text-2xl font-mono mt-8 mb-4'

interface CaseStudySubheadingProps {
  children: ReactNode
  color: string
  className?: string
}

interface CaseStudyMutedTextProps {
  children: ReactNode
  className?: string
}

interface CaseStudyMutedListProps {
  children: ReactNode
  className?: string
}

export function CaseStudySubheading({
  children,
  color,
  className,
}: CaseStudySubheadingProps) {
  const classes = className
    ? `${SUBHEADING_CLASS} ${className}`
    : SUBHEADING_CLASS

  return (
    <h3 className={classes} style={{ color }}>
      {children}
    </h3>
  )
}

export function CaseStudyMutedText({
  children,
  className,
}: CaseStudyMutedTextProps) {
  const classes = className ? `leading-relaxed ${className}` : 'leading-relaxed'

  return (
    <p className={classes} style={{ color: MUTED_TEXT }}>
      {children}
    </p>
  )
}

export function CaseStudyMutedList({
  children,
  className,
}: CaseStudyMutedListProps) {
  const classes = className ? `ml-6 list-disc ${className}` : 'ml-6 list-disc'

  return (
    <ul className={classes} style={{ color: MUTED_TEXT }}>
      {children}
    </ul>
  )
}

import type { ComponentPropsWithoutRef } from 'react'
import { MONOKAI } from '@/lib/monokai-colors'

const MUTED_TEXT = `${MONOKAI.foreground}b3`
const SUBHEADING_CLASS = 'text-2xl font-mono mt-8 mb-4'

interface CaseStudySubheadingProps
  extends ComponentPropsWithoutRef<'h3'> {
  color?: string
}

type CaseStudyMutedTextProps = ComponentPropsWithoutRef<'div'>

type CaseStudyMutedListProps = ComponentPropsWithoutRef<'ul'>

type CaseStudyParagraphProps = ComponentPropsWithoutRef<'div'>

export function CaseStudySubheading({
  children,
  color,
  className,
  ...rest
}: CaseStudySubheadingProps) {
  const classes = className
    ? `${SUBHEADING_CLASS} ${className}`
    : SUBHEADING_CLASS
  const accent = color ?? MONOKAI.foreground

  return (
    <h3 className={classes} style={{ color: accent }} {...rest}>
      {children}
    </h3>
  )
}

export function CaseStudyMutedText({
  children,
  className,
  ...rest
}: CaseStudyMutedTextProps) {
  const classes = className ? `leading-relaxed ${className}` : 'leading-relaxed'

  return (
    <div className={classes} style={{ color: MUTED_TEXT }} {...rest}>
      {children}
    </div>
  )
}

export function CaseStudyMutedList({
  children,
  className,
  ...rest
}: CaseStudyMutedListProps) {
  const baseClasses = 'ml-6 list-disc [&_strong]:text-white'
  const classes = className ? `${baseClasses} ${className}` : baseClasses

  return (
    <ul className={classes} style={{ color: MUTED_TEXT }} {...rest}>
      {children}
    </ul>
  )
}

export function CaseStudyParagraph({
  children,
  className,
  ...rest
}: CaseStudyParagraphProps) {
  const classes = className
    ? `text-lg leading-relaxed ${className}`
    : 'text-lg leading-relaxed'

  return (
    <div
      className={classes}
      style={{ color: `${MONOKAI.foreground}cc` }}
      {...rest}
    >
      {children}
    </div>
  )
}

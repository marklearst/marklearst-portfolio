import type { ComponentPropsWithoutRef } from 'react'
import styles from './CaseStudyLayout.module.css'

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
  style,
  ...rest
}: CaseStudySubheadingProps) {
  const classes = className
    ? `${styles.subheading} ${className}`
    : styles.subheading

  return (
    <h3 className={classes} style={{ ...style, ...(color ? { color } : {}) }} {...rest}>
      {children}
    </h3>
  )
}

export function CaseStudyMutedText({
  children,
  className,
  ...rest
}: CaseStudyMutedTextProps) {
  const classes = className ? `${styles.mutedText} ${className}` : styles.mutedText

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}

export function CaseStudyMutedList({
  children,
  className,
  ...rest
}: CaseStudyMutedListProps) {
  const classes = className ? `${styles.list} ${className}` : styles.list

  return (
    <ul className={classes} role='list' {...rest}>
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
    ? `${styles.paragraph} ${className}`
    : styles.paragraph

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}

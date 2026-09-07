import type { ComponentPropsWithRef } from 'react'
import styles from './Prose.module.css'

interface ProseSubheadingProps
  extends ComponentPropsWithRef<'h3'> {
  color?: string
}

type ProseTextProps = ComponentPropsWithRef<'div'>

type ProseListProps = ComponentPropsWithRef<'ul'>

type ProseBlockProps = ComponentPropsWithRef<'div'>

export function ProseSubheading({
  children,
  color,
  className,
  style,
  ...rest
}: ProseSubheadingProps) {
  const classes = className
    ? `${styles.subheading} ${className}`
    : styles.subheading

  return (
    <h3 className={classes} style={{ ...style, ...(color ? { color } : {}) }} {...rest}>
      {children}
    </h3>
  )
}

export function ProseText({
  children,
  className,
  ...rest
}: ProseTextProps) {
  const classes = className ? `${styles.mutedText} ${className}` : styles.mutedText

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}

export function ProseList({
  children,
  className,
  ...rest
}: ProseListProps) {
  const classes = className ? `${styles.list} ${className}` : styles.list

  return (
    <ul className={classes} role='list' {...rest}>
      {children}
    </ul>
  )
}

export function ProseBlock({
  children,
  className,
  ...rest
}: ProseBlockProps) {
  const classes = className
    ? `${styles.paragraph} ${className}`
    : styles.paragraph

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}

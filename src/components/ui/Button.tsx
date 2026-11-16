import type { ComponentProps } from 'react'
import { Slot } from './Slot'
import styles from './Button.module.css'

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost'

export interface ButtonProps extends ComponentProps<'button'> {
  /** How loud the action is. One primary per view. */
  variant?: Variant
  size?: 'md' | 'sm'
  /** Render the child element with the button's styles and behavior, for links that should look like buttons. */
  asChild?: boolean
}

const NAMES: Record<Variant, string> = {
  primary: 'Primary button',
  accent: 'Accent button',
  secondary: 'Secondary button',
  ghost: 'Quiet button',
}

/**
 * The site's button. Its colors and timing are component tokens, so the
 * inspector can name them: `component.button.primary.background` and the rest.
 */
export function Button({ variant = 'primary', size = 'md', asChild = false, className, type, ...props }: ButtonProps) {
  const shared = {
    'data-inspect': NAMES[variant],
    ...props,
    'data-variant': variant,
    'data-size': size,
    className: className ? `${styles.button} ${className}` : styles.button,
  }
  if (asChild) return <Slot {...shared} />
  return <button type={type ?? 'button'} {...shared} />
}

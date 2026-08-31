import type { ComponentPropsWithoutRef } from 'react'

/**
 * A small, muted aside.
 *
 * It styles the paragraph MDX generates inside it rather than styling itself:
 * that generated <p> carries the body type scale, so a size set on this
 * wrapper alone would lose to it.
 */
export default function AboutNote({
  children,
  className,
  ...rest
}: ComponentPropsWithoutRef<'div'>) {
  const base = 'mt-6 [&>p]:text-base [&>p]:text-white/60'

  return (
    <div className={className ? `${base} ${className}` : base} {...rest}>
      {children}
    </div>
  )
}

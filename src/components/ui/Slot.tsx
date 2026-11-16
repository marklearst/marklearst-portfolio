import { cloneElement, isValidElement, type HTMLAttributes, type ReactElement, type ReactNode, type Ref } from 'react'

type SlotProps = HTMLAttributes<HTMLElement> & { children?: ReactNode; ref?: Ref<HTMLElement> }
type AnyProps = Record<string, unknown>

/**
 * Renders its one child with the slot's props merged in. It lets a component
 * lend its behavior and styles to another element: `<Button asChild><a href='/work'>Work</a></Button>`.
 * Class names join, styles merge, and handlers on both run, the child's first.
 */
export function Slot({ children, ...slot }: SlotProps) {
  if (!isValidElement(children)) return null
  const child = children as ReactElement<AnyProps>
  const merged: AnyProps = { ...slot, ...child.props }
  for (const key of Object.keys(slot)) {
    const ours = (slot as AnyProps)[key]
    const theirs = child.props[key]
    if (key === 'className') merged.className = [ours, theirs].filter(Boolean).join(' ')
    else if (key === 'style') merged.style = { ...(ours as object), ...(theirs as object) }
    else if (/^on[A-Z]/.test(key) && typeof ours === 'function' && typeof theirs === 'function') {
      merged[key] = (...args: unknown[]) => {
        theirs(...args)
        ours(...args)
      }
    }
  }
  return cloneElement(child, merged)
}

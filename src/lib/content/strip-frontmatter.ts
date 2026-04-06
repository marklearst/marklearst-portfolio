import { Children, cloneElement, isValidElement, type ReactNode } from 'react'

const isWhitespace = (node: ReactNode) =>
  typeof node === 'string' && node.trim().length === 0

const isHrNode = (node: ReactNode) => isValidElement(node) && node.type === 'hr'

export const stripFrontmatter = (node: ReactNode): ReactNode => {
  if (!isValidElement<{ children?: ReactNode }>(node)) return node

  const children = Children.toArray(node.props.children)
  if (children.length === 0) return node

  const firstContentIndex = children.findIndex((child) => !isWhitespace(child))
  if (firstContentIndex === -1) return node
  if (!isHrNode(children[firstContentIndex])) return node

  const endIndex = children.findIndex(
    (child, index) => index > firstContentIndex && isHrNode(child),
  )
  if (endIndex === -1) return node

  const filtered = [
    ...children.slice(0, firstContentIndex),
    ...children.slice(endIndex + 1),
  ]

  return cloneElement(node, { children: filtered })
}

import type { ComponentPropsWithoutRef } from 'react'
import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents = {}) {
  return {
    // Table wrapper - horizontal scroll on mobile, subtle surface background
    table: ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => (
      <div className="my-8 overflow-x-auto rounded-lg border border-ink-primary/8 bg-surface">
        <table
          tabIndex={0}
          className="w-full border-collapse text-sm"
          {...props}
        >
          {children}
        </table>
      </div>
    ),

    // Table head - subtle bottom border, muted text
    thead: ({ children, ...props }: ComponentPropsWithoutRef<'thead'>) => (
      <thead className="border-b border-ink-primary/8" {...props}>
        {children}
      </thead>
    ),

    // Table body
    tbody: ({ children, ...props }: ComponentPropsWithoutRef<'tbody'>) => (
      <tbody className="divide-y divide-ink-primary/5" {...props}>
        {children}
      </tbody>
    ),

    // Table row - subtle hover state
    tr: ({ children, ...props }: ComponentPropsWithoutRef<'tr'>) => (
      <tr
        className="transition-colors hover:bg-ink-primary/3"
        {...props}
      >
        {children}
      </tr>
    ),

    // Table header cell - left-aligned, primary ink
    th: ({ children, ...props }: ComponentPropsWithoutRef<'th'>) => (
      <th
        className="px-4 py-3 text-left font-medium text-ink-primary/80"
        {...props}
      >
        {children}
      </th>
    ),

    // Table data cell - comfortable padding, muted text
    td: ({ children, ...props }: ComponentPropsWithoutRef<'td'>) => (
      <td
        className="px-4 py-3 font-body text-ink-primary/70 whitespace-nowrap"
        {...props}
      >
        {children}
      </td>
    ),

    ...components,
  }
}

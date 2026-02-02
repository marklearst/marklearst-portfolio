import type { ComponentPropsWithoutRef } from 'react'

type MDXComponents = {
  [key: string]: React.ComponentType<ComponentPropsWithoutRef<'div'>>
}

export function useMDXComponents(components: MDXComponents = {}) {
  return {
    // Table wrapper - horizontal scroll on mobile, subtle surface background
    table: ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => (
      <div className="my-8 overflow-x-auto rounded-lg border border-white/8 bg-surface">
        <table
          className="w-full border-collapse text-sm font-mono"
          {...props}
        >
          {children}
        </table>
      </div>
    ),

    // Table head - subtle bottom border, muted text
    thead: ({ children, ...props }: ComponentPropsWithoutRef<'thead'>) => (
      <thead className="border-b border-white/8" {...props}>
        {children}
      </thead>
    ),

    // Table body
    tbody: ({ children, ...props }: ComponentPropsWithoutRef<'tbody'>) => (
      <tbody className="divide-y divide-white/5" {...props}>
        {children}
      </tbody>
    ),

    // Table row - subtle hover state
    tr: ({ children, ...props }: ComponentPropsWithoutRef<'tr'>) => (
      <tr
        className="transition-colors hover:bg-white/3"
        {...props}
      >
        {children}
      </tr>
    ),

    // Table header cell - left-aligned, monokai cyan accent
    th: ({ children, ...props }: ComponentPropsWithoutRef<'th'>) => (
      <th
        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-monokai-cyan/80"
        {...props}
      >
        {children}
      </th>
    ),

    // Table data cell - comfortable padding, muted text
    td: ({ children, ...props }: ComponentPropsWithoutRef<'td'>) => (
      <td
        className="px-4 py-3 text-white/70 whitespace-nowrap"
        {...props}
      >
        {children}
      </td>
    ),

    ...components,
  }
}

declare module '*.mdx' {
  import type { ReactElement } from 'react'
  import type { MDXComponents } from 'mdx/types'

  const MDXComponent: (props: { components?: MDXComponents }) => ReactElement

  export default MDXComponent
}

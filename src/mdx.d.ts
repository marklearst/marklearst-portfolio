declare module '*.mdx' {
  import type { ComponentType, ReactElement } from 'react'

  const MDXComponent: (props: {
    components?: Record<string, ComponentType<unknown>>
  }) => ReactElement

  export default MDXComponent
}

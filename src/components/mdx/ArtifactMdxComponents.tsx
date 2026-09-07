import type { ComponentPropsWithoutRef } from 'react'
import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import { ProseList } from '@/components/content/Prose'
import { proseMdxComponents } from './ProseMdxComponents'

const ArtifactHeading = (props: ComponentPropsWithoutRef<'h2'>) => <h2 {...props} />
const ArtifactSubheading = (props: ComponentPropsWithoutRef<'h3'>) => <h3 {...props} />

export const artifactMdxComponents = {
  ...proseMdxComponents,
  img: ({ src, alt, className, title }: ComponentPropsWithoutRef<'img'>) => {
    if (!src || typeof src !== 'string') return null

    return (
      <Image
        src={src}
        alt={alt ?? ''}
        title={title}
        width={1600}
        height={900}
        sizes='100vw'
        className={`mt-6 mb-2 h-auto w-full rounded-[8px] ${className ?? ''}`}
      />
    )
  },
  ul: (props: ComponentPropsWithoutRef<'ul'>) => (
    <ProseList className='space-y-3' {...props} />
  ),
  h2: ArtifactHeading,
  h3: ArtifactSubheading,
} satisfies MDXComponents

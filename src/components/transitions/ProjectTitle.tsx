import { ViewTransition, type ReactNode } from 'react'

/**
 * A project's name, wherever it links to or heads its case study. Two of these
 * with the same slug on either side of a navigation are one object to the
 * browser: the name travels from the list to the top of the page it opens.
 *
 * Render one per slug per page. The motion is the `title-morph` class in globals.css.
 */
export default function ProjectTitle({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <ViewTransition name={`project-title-${slug}`} share='title-morph' default='none'>
      <span>{children}</span>
    </ViewTransition>
  )
}

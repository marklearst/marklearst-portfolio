import { ViewTransition, type ReactNode } from 'react'

/**
 * A project's screenshot, wherever it stands for the project. Like `ProjectTitle`, two of these with the same
 * slug on either side of a navigation are one object: the plate in the list grows into the cover of the case study.
 *
 * Wrap the element that clips the image, so the whole framed picture travels. Render one per slug per page.
 * The motion is the `plate-morph` class in globals.css.
 */
export default function ProjectPlate({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <ViewTransition name={`project-plate-${slug}`} share='plate-morph' default='none'>
      {children}
    </ViewTransition>
  )
}

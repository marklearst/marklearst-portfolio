import { ViewTransition } from 'react'
import { PROJECT_PREVIEWS } from '@/data/project-previews'
import StaticImage from '@/components/media/StaticImage'

interface ProjectPlateProps {
  slug: string
  className: string
  sizes: string
  eager?: boolean
}

export default function ProjectPlate({ slug, className, sizes, eager }: ProjectPlateProps) {
  const preview = PROJECT_PREVIEWS[slug]
  if (!preview) return null
  return (
    <ViewTransition name={`project-plate-${slug}`} share='plate-morph' default='none'>
      <span className={className}>
        <StaticImage src={preview.src} alt={preview.alt} width={1280} height={720} sizes={sizes}
          loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} />
      </span>
    </ViewTransition>
  )
}

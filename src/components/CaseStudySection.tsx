import type { ReactNode } from 'react'

export interface CaseStudySectionProps {
  title: string
  children: ReactNode
}

export function CaseStudySection({ children }: CaseStudySectionProps) {
  return <>{children}</>
}

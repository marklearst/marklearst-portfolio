import { getGlucoseDemoData } from '@/lib/glucose-demo'
import GlucoseDemoClient from './GlucoseDemo'

interface GlucoseDemoProps {
  compact?: boolean
  className?: string
}

/** Render the real report at build time; load its analysis code when a visitor changes the sample. */
export function GlucoseDemo({ compact = false, className }: GlucoseDemoProps) {
  return (
    <GlucoseDemoClient
      initial={getGlucoseDemoData('complete')}
      compact={compact}
      className={className}
    />
  )
}

export default GlucoseDemo

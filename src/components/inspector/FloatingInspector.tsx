'use client'

import { lazy, Suspense } from 'react'
import { loadFloatingInspector } from './load-floating-inspector'
import { useInspector } from './InspectorProvider'

const Panel = lazy(loadFloatingInspector)

/** The dock that follows the visitor while they inspect: beside the page on a wide screen, a sheet on a narrow one. */
export default function FloatingInspector() {
  const floating = useInspector((state) => state.floating)
  if (!floating) return null

  return (
    <Suspense fallback={null}>
      <Panel />
    </Suspense>
  )
}

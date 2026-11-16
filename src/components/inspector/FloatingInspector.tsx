'use client'

import { InspectorBody, InspectorControls, InspectorDock, InspectorStatus } from './InspectorDock'
import { useInspector } from './InspectorProvider'

/** The dock that follows the visitor while they inspect: beside the page on a wide screen, a sheet on a narrow one. */
export default function FloatingInspector() {
  const floating = useInspector((state) => state.floating)
  if (!floating) return null

  return (
    <InspectorDock placement='floating'>
      <InspectorStatus />
      <InspectorBody />
      <InspectorControls />
    </InspectorDock>
  )
}

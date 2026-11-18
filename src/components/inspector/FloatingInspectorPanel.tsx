'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { InspectorBody, InspectorControls, InspectorDock, InspectorStatus } from './InspectorDock'
import { useInspectorController } from './InspectorProvider'
import InspectorTrace from './InspectorTrace'
import styles from './Inspector.module.css'

export default function FloatingInspectorPanel() {
  const controller = useInspectorController()
  const [expanded, setExpanded] = useState(false)
  const pinnedForDetails = useRef(false)
  const changed = useRef(false)

  useLayoutEffect(() => {
    if (!changed.current) return
    const first = expanded
      ? document.querySelector<HTMLElement>('[data-inspector-dock="floating"] [data-token-row]') ?? document.querySelector<HTMLElement>('[data-trace-back]')
      : document.querySelector<HTMLElement>('[data-trace-details]')
    first?.focus({ preventScroll: true })
  }, [expanded])

  function showDetails() {
    changed.current = true
    pinnedForDetails.current = !controller.getState().pinned
    if (pinnedForDetails.current) controller.togglePin()
    setExpanded(true)
  }

  if (!expanded) return <InspectorTrace expand={showDetails} />
  return (
    <InspectorDock placement='floating'>
      <button type='button' className={styles.traceBack} data-trace-back='' onClick={() => {
        if (pinnedForDetails.current && controller.getState().pinned) controller.togglePin()
        setExpanded(false)
      }}>← Back to trace</button>
      <InspectorStatus />
      <InspectorBody />
      <InspectorControls />
    </InspectorDock>
  )
}

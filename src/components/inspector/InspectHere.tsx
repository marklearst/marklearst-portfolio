'use client'

import { useInspector, useInspectorController } from './InspectorProvider'
import styles from './Inspector.module.css'

/** A plain text way into inspect mode, for the end of a page. */
export default function InspectHere() {
  const controller = useInspectorController()
  const inspecting = useInspector((state) => state.inspecting)

  return (
    <button
      type='button'
      className={styles.inspectHere}
      onClick={(event) => void controller.toggleInspecting(event.currentTarget)}
      onPointerEnter={controller.warm}
      onFocus={controller.warm}
    >
      {inspecting ? 'Stop inspecting' : 'Inspect this page'}
    </button>
  )
}

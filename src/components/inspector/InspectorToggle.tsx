'use client'

import { Button } from '@/components/ui/Button'
import { InspectIcon } from '@/components/ui/Icon'
import { useInspector, useInspectorController } from './InspectorProvider'
import styles from './Inspector.module.css'

/** Turns inspect mode on and off from anywhere on the site. */
export default function InspectorToggle() {
  const controller = useInspectorController()
  const inspecting = useInspector((state) => state.inspecting)

  return (
    <Button
      variant='ghost'
      size='sm'
      className={styles.toggle}
      aria-pressed={inspecting}
      onClick={(event) => void controller.toggleInspecting(event.currentTarget)}
      onPointerEnter={controller.warm}
      onFocus={controller.warm}
    >
      <InspectIcon size={18} />
      <span className={styles.toggleLabel}>Inspect</span>
    </Button>
  )
}

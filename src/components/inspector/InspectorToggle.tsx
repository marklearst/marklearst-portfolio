'use client'

import { useEffect, useId, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { InspectIcon } from '@/components/ui/Icon'
import { useInspector, useInspectorController } from './InspectorProvider'
import styles from './Inspector.module.css'

/** Turns inspect mode on and off from anywhere on the site. */
export default function InspectorToggle() {
  const controller = useInspectorController()
  const inspecting = useInspector((state) => state.inspecting)
  const loadStatus = useInspector((state) => state.loadStatus)

  const hint = useId()
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    const dismiss = (e: KeyboardEvent) => { if (e.key === 'Escape') setDismissed(true) }
    document.addEventListener('keydown', dismiss)
    return () => document.removeEventListener('keydown', dismiss)
  }, [])
  return (
    <span className={styles.toggleWrap} data-hint={(!inspecting && !dismissed) || undefined}
      onPointerEnter={() => setDismissed(false)} onFocus={() => setDismissed(false)}>
    <Button
      variant='ghost'
      size='sm'
      className={styles.toggle}
      aria-describedby={inspecting ? undefined : hint}
      aria-pressed={inspecting}
      aria-busy={loadStatus === 'loading' || undefined}
      aria-label={loadStatus === 'error' ? 'Retry Inspect' : undefined}
      title={loadStatus === 'error' ? 'The inspector could not load. Try again.' : undefined}
      onClick={(event) => {
        setDismissed(true)
        void controller.toggleInspecting(event.currentTarget)
      }}
      onPointerEnter={controller.warm}
      onFocus={controller.warm}
    >
      {loadStatus === 'error' ? <span className={styles.retryLabel}>Retry</span> : (
        <>
          <InspectIcon size={18} />
          <span className={styles.toggleLabel}>Inspect</span>
        </>
      )}
    </Button>
    <span id={hint} role='tooltip' className={styles.toggleHint}>Point to an element to see the design tokens behind it.</span>
    </span>
  )
}

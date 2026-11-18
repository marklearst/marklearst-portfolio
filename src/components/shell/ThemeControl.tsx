'use client'

import { Segmented, SegmentedOption } from '@/components/ui/Segmented'
import { useInspector, useInspectorController } from '@/components/inspector/InspectorProvider'
import styles from './ThemeControl.module.css'

export default function ThemeControl() {
  const controller = useInspectorController()
  const preference = useInspector((state) => state.themePreference)
  return (
    <div className={styles.control} data-inspector-ui=''>
      <span>Appearance</span>
      <Segmented aria-label='Appearance' value={preference} onValueChange={controller.setTheme} className={styles.options}>
        <SegmentedOption value='system' className={styles.option}>System</SegmentedOption>
        <SegmentedOption value='light' className={styles.option}>Light</SegmentedOption>
        <SegmentedOption value='dark' className={styles.option}>Dark</SegmentedOption>
      </Segmented>
    </div>
  )
}

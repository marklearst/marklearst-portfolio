import Wordmark from '@/components/brand/Wordmark'
import InspectorToggle from '@/components/inspector/InspectorToggle'
import PrimaryNav from '@/components/navigation/PrimaryNav'
import styles from './SiteHeader.module.css'

export default function SiteHeader() {
  return (
    // Named here, not in the CSS Module, which would scope the name and hide it from the transition rules in globals.css.
    <header className={styles.header} style={{ viewTransitionName: 'site-header' }}>
      <div className={styles.inner}>
        <Wordmark />
        <div className={styles.controls}>
          <PrimaryNav>
            <InspectorToggle />
          </PrimaryNav>
        </div>
      </div>
    </header>
  )
}

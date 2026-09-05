import Wordmark from '@/components/brand/Wordmark'
import PrimaryNav from '@/components/navigation/PrimaryNav'
import styles from './SiteHeader.module.css'

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Wordmark />
        <PrimaryNav />
      </div>
    </header>
  )
}

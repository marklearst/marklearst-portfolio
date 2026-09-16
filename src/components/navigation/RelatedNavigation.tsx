import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/ui/Icon'
import styles from './RelatedNavigation.module.css'

type NavigationItem = { href: string; title: string }

function NavigationArrow({ previous = false }: { previous?: boolean }) {
  const Arrow = previous ? ArrowLeftIcon : ArrowRightIcon

  return (
    <span className={styles.arrow} data-previous={previous || undefined} aria-hidden='true'>
      <Arrow size={20} className={styles.arrowFront} data-action-icon={undefined} />
      <Arrow size={20} className={styles.arrowBack} data-action-icon={undefined} />
    </span>
  )
}

interface RelatedNavigationProps {
  itemType: 'case study' | 'article'
  previous: NavigationItem | null
  next: NavigationItem | null
}

export default function RelatedNavigation({ itemType, previous, next }: RelatedNavigationProps) {
  if (!previous && !next) return null

  return (
    <nav
      className={styles.navigation}
      aria-label={itemType === 'case study' ? 'Case study navigation' : 'Article navigation'}
      data-related-navigation
    >
      {previous && (
        <Link href={previous.href} rel='prev' className={styles.link}>
          <span className={styles.direction}>
            <NavigationArrow previous />
            Previous {itemType}
          </span>
          <span className={styles.title}>{previous.title}</span>
        </Link>
      )}
      {next && (
        <Link href={next.href} rel='next' className={`${styles.link} ${styles.next}`}>
          <span className={styles.direction}>
            Next {itemType}
            <NavigationArrow />
          </span>
          <span className={styles.title}>{next.title}</span>
        </Link>
      )}
    </nav>
  )
}

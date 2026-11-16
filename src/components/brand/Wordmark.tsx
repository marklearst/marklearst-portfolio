'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useSyncExternalStore, type CSSProperties } from 'react'
import { trackNavigationClick, trackLogoHover } from '@/lib/analytics'
import styles from './Wordmark.module.css'

const NAME = 'marklearst'

/** The initials. They are in place in both states of the wordmark, so they never move. */
const INITIALS = [0, 4]

/**
 * Each letter with how far it sits from the initial before it: 0 for the letter right beside one, and -1 for an
 * initial itself. The wordmark opens outward from its initials, so that distance is the order letters arrive in.
 */
const LETTERS = NAME.split('').map((letter, index) => {
  const initial = Math.max(...INITIALS.filter((at) => at <= index))
  return { letter, distance: index - initial - 1 }
})
const FARTHEST = Math.max(...LETTERS.map(({ distance }) => distance))

const onScroll = (notify: () => void) => {
  window.addEventListener('scroll', notify, { passive: true })
  return () => window.removeEventListener('scroll', notify)
}

/**
 * The braced wordmark, in two states of one object: `{marklearst}` and `{ml}`.
 *
 * At the top of a page the name is written out. Once the page moves it folds down to its initials, and pointing
 * at it or focusing it opens it again. The braces and the two initials are in both states. The other eight
 * letters open up around the initials, and the row's layout carries the closing brace outward, so nothing has
 * to animate the brace itself. The timing is all in Wordmark.module.css.
 *
 * On a phone there is no room for the name, so it stays folded.
 */
export default function Wordmark() {
  const pathname = usePathname()
  const link = useRef<HTMLAnchorElement>(null)
  // Folded once the page has moved by more than the wordmark's own height, so a nudge at the top doesn't fold it.
  const folded = useSyncExternalStore(
    onScroll,
    () => window.scrollY > (link.current?.offsetHeight ?? 0),
    () => false,
  )

  return (
    <Link
      ref={link}
      href='/'
      className={styles.link}
      // The name starts with the word a visitor sees, so asking a voice control to click "marklearst" finds it.
      aria-label='marklearst, home'
      data-folded={folded || undefined}
      onClick={() => {
        if (pathname !== '/') trackNavigationClick({ action: 'logo_click', from: pathname, to: '/' })
      }}
      onPointerEnter={(event) => {
        if (folded && event.pointerType === 'mouse') trackLogoHover({ action: 'expand' })
      }}
    >
      <span aria-hidden='true' className={styles.wordmark}>
        <span className={styles.brace}>{'{'}</span>
        <span className={styles.name}>
          {LETTERS.map(({ letter, distance }, index) =>
            distance < 0 ? (
              <span key={index} className={styles.cell}>{letter}</span>
            ) : (
              <span key={index} className={`${styles.cell} ${styles.arriving}`} style={{ '--in': distance, '--out': FARTHEST - distance } as CSSProperties}>
                {letter}
              </span>
            ),
          )}
        </span>
        <span className={styles.brace}>{'}'}</span>
      </span>
    </Link>
  )
}

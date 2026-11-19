import Link from 'next/link'
import { BUILD_CHECK } from '@/lib/inspector/graph'
import InspectHere from './InspectHere'
import styles from './Inspector.module.css'

const REPO = 'https://github.com/marklearst/marklearst-portfolio'

/**
 * The footer's account of this deploy: the Primitree check that ran in the
 * build, and the commit it ran on when the host provides one.
 */
export default function BuildLine() {
  const { command, tokens, findings, exit } = BUILD_CHECK
  const commit = process.env.VERCEL_GIT_COMMIT_SHA

  return (
    <p className={styles.buildLine} data-inspector-ui=''>
      <span>
        <code>{command}</code>: {tokens} tokens, {findings.length} {findings.length === 1 ? 'finding' : 'findings'}, <code>exit {exit}</code>
        {commit && (
          <>
            {' '}at{' '}
            <a href={`${REPO}/commit/${commit}`} target='_blank' rel='noopener noreferrer'>
              <code>{commit.slice(0, 7)}</code>
            </a>
          </>
        )}
        .
      </span>
      <span>
        <Link href='/system'>Explore the design system</Link>. <InspectHere />
      </span>
    </p>
  )
}

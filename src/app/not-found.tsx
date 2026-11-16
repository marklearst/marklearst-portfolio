import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/shell/Footer'
import RequestedPath from '@/components/shell/RequestedPath'
import { Button } from '@/components/ui/Button'
import { ArrowRightIcon } from '@/components/ui/Icon'
import styles from '@/components/shell/NotFound.module.css'

export const metadata: Metadata = {
  title: 'Page not found | Mark Learst',
  description: 'That address does not lead to a page on marklearst.com.',
}

/**
 * The page for an address that leads nowhere. It speaks the way the rest of
 * the site does: a status line, then the chain that was followed and where it
 * stopped, then the ways back.
 */
export default function NotFound() {
  return (
    <>
      <main className={styles.page}>
        <div className={styles.container}>
          <p className={styles.status}>
            <code>GET <RequestedPath /></code>
            <strong>Not found</strong>
            <code className={styles.code}>404</code>
          </p>
          <h1 className={styles.title}>Nothing resolves here.</h1>
          <p className={styles.lead}>
            On this site a color, a type size, or a duration traces back to a token. This address traces back to nothing. The page may have moved, or the link was wrong.
          </p>
          <ol role='list' className={styles.chain} aria-label='What was followed, and where it stopped'>
            <li>
              <code><RequestedPath /></code>
              <span>the address you followed</span>
            </li>
            <li data-end=''>
              <strong>No route</strong>
              <span>nothing on the site answers to it</span>
            </li>
          </ol>
          <div className={styles.actions}>
            <Button asChild>
              <Link href='/work'>
                See the work <ArrowRightIcon />
              </Link>
            </Button>
            <Link className={styles.link} href='/artifacts'>Read the articles</Link>
            <Link className={styles.link} href='/'>Go to the start</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

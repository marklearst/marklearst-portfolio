import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './PrivacyPage.module.css'
import PrivacyBackLink from '@/components/ui/PrivacyBackLink'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy - Mark Learst',
  description:
    'Privacy details for marklearst.com, including anonymous analytics and opt-out controls.',
}

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <PrivacyBackLink />
        <header className={styles.header}>
          <h1>Privacy</h1>
          <p>
            This site uses Vercel Web Analytics to understand which pages and
            projects resonate. Data is anonymous and aggregated. No cookies,
            no ads, and no cross-site tracking.
          </p>
        </header>

        <div className={styles.content}>
          <section>
            <h2>What I collect</h2>
            <ul>
              <li>Anonymous page views and route transitions</li>
              <li>
                Interaction events like clicks, scroll depth, and section
                views
              </li>
              <li>
                Case study read signals such as impressions and completion
              </li>
            </ul>
          </section>

          <section>
            <h2>Why I collect it</h2>
            <p>
              The goal is clarity, not surveillance. I use the data to improve
              the site, learn which work is useful, and write more of what
              people actually want to read.
            </p>
          </section>

          <section>
            <h2>Your control</h2>
            <p className={styles.control}>
              <strong>Opt out anytime:</strong> use the
              "analytics on/off" toggle in the footer. Your preference is
              stored locally in your browser.
            </p>
          </section>

          <section>
            <h2>Questions</h2>
            <p>
              If you have questions, reach out at{' '}
              <a href='mailto:me@marklearst.com'>
                me@marklearst.com
              </a>
              . You can also head back to the{' '}
              <Link href='/'>
                homepage
              </Link>
              .
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}

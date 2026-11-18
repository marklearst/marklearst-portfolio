import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../../components/privacy/PrivacyPage.module.css'
import PrivacyBackLink from '@/components/privacy/PrivacyBackLink'
import Footer from '@/components/shell/Footer'

export const metadata: Metadata = {
  title: 'Privacy | Mark Learst',
  description:
    'Privacy details for marklearst.com, including anonymous analytics and opt-out controls.',
}

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <main>
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
              <ul role='list'>
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
                I use the data to improve the site and see which projects and
                articles people find useful.
              </p>
            </section>

            <section>
              <h2>Your control</h2>
              <p>
                Appearance follows your system unless you choose Light or Dark
                in the footer. That choice is saved only in your browser.
                Choosing System removes the saved override.
              </p>
              <p className={styles.control}>
                <strong>Opt out anytime:</strong> use the
                "analytics on/off" toggle in the footer. Your preference is
                stored locally in your browser.
              </p>
              <p>
                The inspector's motion setting is stored the same way, and
                only when you choose reduced or default motion against your
                system setting. Slow motion is never stored. Neither one
                leaves your browser.
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
      </main>
      <Footer showPrivacyLink={false} />
    </div>
  )
}

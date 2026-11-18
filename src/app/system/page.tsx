import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/shell/Footer'
import SiteTokenGraph from '@/components/tokens/SiteTokenGraph'
import SiteMotionBench from '@/components/tokens/SiteMotionBench'
import { ArrowRightIcon } from '@/components/ui/Icon'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'The system | Mark Learst',
  description: 'Explore the real Primitree token graph that powers Mark Learst’s portfolio: base values, semantic decisions, component roles, and architecture checks.',
}

export default function SystemPage() {
  return (
    <>
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.introduction}>
            <h1>The system behind this site.</h1>
            <p>Every connection here is a reference in this site’s Primitree graph. Change the accent, break a rule, or trace another token.</p>
          </header>
          <h2 className='sr-only'>Live token graph</h2>
          <SiteTokenGraph linkable />
          <div className={styles.notes}>
            <p>Base tokens own values. Meaning tokens give those values a job. Component tokens bind that job to an interface.</p>
            <p>When a meaning token holds a literal, Primitree reports the broken rule. The graph shows the reference it lost.</p>
            <nav aria-label='Token system sources'>
              <a href='/tokens.json'>DTCG source <ArrowRightIcon /></a>
              <a href='/graph.json'>Graph data <ArrowRightIcon /></a>
              <Link href='/work/primitree'>The Primitree case study <ArrowRightIcon /></Link>
            </nav>
          </div>
          <SiteMotionBench />
        </div>
      </main>
      <Footer />
    </>
  )
}

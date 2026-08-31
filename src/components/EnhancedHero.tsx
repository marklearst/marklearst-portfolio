'use client'

import Link from 'next/link'
import PrimitreeGuardrailDemo from '@/components/evidence/PrimitreeGuardrailDemo'
import { useAnalytics } from '@/hooks/useAnalytics'
import { ArrowDownIcon, ArrowRightIcon, ArrowUpRightIcon, GithubIcon } from '@/components/ui/Icon'
import styles from './Showcase.module.css'

export default function EnhancedHero() {
  const { trackHeroCTAClick, trackExternalLinkClick, getPlatformFromUrl } = useAnalytics()

  return (
    <section className={styles.hero} aria-labelledby='hero-name'>
      <div className={styles.container}>
        <div className={styles.heroGrid}>
          <div className={styles.introduction}>
            <h1 id='hero-name' className={styles.name}>Hi, I’m Mark.</h1>
            <p className={styles.lead}>Design engineer and UI architect who sets system direction in code.</p>
            <div className={styles.support}>
              <p>I build design systems from the tokens up, and the governance that keeps Figma and production React aligned.</p>
              <p>When work repeats, I turn it into an agent workflow with tests and human review before anything ships.</p>
            </div>
            <div className={styles.actions}>
              <a className={styles.primaryLink} href='#work' onClick={() => trackHeroCTAClick({ action: 'view_work', location: 'hero' })}>
                Explore the work <ArrowDownIcon />
              </a>
              <a className={styles.textLink} href='https://github.com/marklearst' target='_blank' rel='noopener noreferrer' onClick={() => trackExternalLinkClick({ platform: getPlatformFromUrl('https://github.com/marklearst'), href: 'https://github.com/marklearst', location: 'hero' })}>
                <GithubIcon size={20} className={styles.brandIcon} /> GitHub <ArrowUpRightIcon />
              </a>
            </div>
            <p className={styles.available}>Open to design engineering roles. <a href='mailto:jobs@marklearst.com'>Let’s talk <ArrowUpRightIcon /></a></p>
          </div>
          <div className={`${styles.livePreview} ${styles.heroPreview}`}>
            <div className={styles.previewHeading}>
              <span>Design system rules, in code</span>
            </div>
            <PrimitreeGuardrailDemo compact />
            <div className={styles.previewLinks}>
              <Link href='/work/primitree' className={styles.previewLink}>Primitree case study <ArrowRightIcon /></Link>
              <a href='https://primitree.com/docs' target='_blank' rel='noopener noreferrer' className={styles.previewLink}>Documentation <ArrowUpRightIcon /></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useRef } from 'react'
import Link from 'next/link'
import GlucoseDemo from '@/components/glucose/GlucoseDemo'
import KineticText from '@/components/ui/KineticText'
import { useHeroAnimation } from '@/hooks/useHeroAnimation'
import { useAnalytics } from '@/hooks/useAnalytics'
import styles from './Showcase.module.css'

export default function EnhancedHero() {
  const heroRef = useRef<HTMLElement>(null)
  const nameBoxRef = useRef<HTMLDivElement>(null)
  const { trackHeroCTAClick, trackExternalLinkClick, getPlatformFromUrl } = useAnalytics()
  useHeroAnimation(heroRef, nameBoxRef)

  return (
    <section ref={heroRef} className={styles.hero} aria-labelledby='hero-name'>
      <div className={styles.container}>
        <div className={styles.terminal}>
          <span><span className={styles.prompt}>❯</span> ~/portfolio</span>
          <span className={styles.terminalAside}>design / engineering</span>
        </div>
        <div ref={nameBoxRef} className={styles.nameBox}>
          <h1 id='hero-name' className={styles.name} aria-label='Mark Learst'>
            <span aria-hidden='true'><KineticText text='marklearst' /></span>
          </h1>
        </div>
        <div className={styles.heroGrid}>
          <div className={styles.introduction}>
            <p className={styles.lead}>Design engineer and UI architect who sets system direction in code.</p>
            <p className={styles.support}>I build <span className={styles.green}>design systems</span> from the tokens up, and the governance that keeps <span className={styles.cyan}>Figma and production React</span> aligned. When work repeats, I turn it into an <span className={styles.purple}>agent workflow</span> with tests and human review before anything ships.</p>
            <div className={styles.actions}>
              <a className={styles.primaryLink} href='#work' onClick={() => trackHeroCTAClick({ action: 'view_work', location: 'hero' })}>
                Explore the work <span aria-hidden='true'>↓</span>
              </a>
              <a className={styles.textLink} href='https://github.com/marklearst' target='_blank' rel='noopener noreferrer' onClick={() => trackExternalLinkClick({ platform: getPlatformFromUrl('https://github.com/marklearst'), href: 'https://github.com/marklearst', location: 'hero' })}>
                GitHub <span aria-hidden='true'>↗</span>
              </a>
            </div>
            <p className={styles.available}>Open to design engineering roles. <a href='mailto:jobs@marklearst.com'>Let’s talk <span aria-hidden='true'>↗</span></a></p>
          </div>
          <div className={`${styles.livePreview} hero-preview`}>
            <div className={styles.previewHeading}>
              <span>GlucoseIQ</span>
              <span>Interactive example</span>
            </div>
            <GlucoseDemo compact />
            <Link href='/work/glucoseiq' className={styles.previewLink}>Explore the data and design decisions <span aria-hidden='true'>↗</span></Link>
          </div>
        </div>
        <div className={styles.credentials}>
          <Link href='/work/aurora-gm'><strong>4 brands</strong><span>One shared system at GM</span></Link>
          <Link href='/work/a11y-companion'><strong>400+ users</strong><span>a11y Companion on Figma</span></Link>
          <Link href='/work/primitree'><strong>Tokens → production</strong><span>Building Primitree</span></Link>
        </div>
      </div>
    </section>
  )
}

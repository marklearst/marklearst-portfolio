'use client'

import { useRef } from 'react'
import Link from 'next/link'
import GlucoseDemo from '@/components/glucose/GlucoseDemo'
import KineticText from '@/components/ui/KineticText'
import { useHeroAnimation } from '@/hooks/useHeroAnimation'
import { useAnalytics } from '@/hooks/useAnalytics'
import { ArrowDownIcon, ArrowRightIcon, ArrowUpRightIcon } from '@/components/ui/Icon'
import styles from './Showcase.module.css'

export default function EnhancedHero() {
  const heroRef = useRef<HTMLElement>(null)
  const nameBoxRef = useRef<HTMLDivElement>(null)
  const { trackHeroCTAClick, trackExternalLinkClick, getPlatformFromUrl } = useAnalytics()
  useHeroAnimation(heroRef, nameBoxRef)

  return (
    <section ref={heroRef} className={styles.hero} aria-labelledby='hero-name'>
      <div className={styles.container}>
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
                Explore the work <ArrowDownIcon />
              </a>
              <a className={styles.textLink} href='https://github.com/marklearst' target='_blank' rel='noopener noreferrer' onClick={() => trackExternalLinkClick({ platform: getPlatformFromUrl('https://github.com/marklearst'), href: 'https://github.com/marklearst', location: 'hero' })}>
                GitHub <ArrowUpRightIcon />
              </a>
            </div>
            <p className={styles.available}>Open to design engineering roles. <a href='mailto:jobs@marklearst.com'>Let’s talk <ArrowUpRightIcon /></a></p>
          </div>
          <div className={`${styles.livePreview} hero-preview`}>
            <div className={styles.previewHeading}>
              <span>GlucoseIQ</span>
              <span>My library, running here</span>
            </div>
            <GlucoseDemo compact />
            <div className={styles.previewLinks}>
              <Link href='/work/glucoseiq' className={styles.previewLink}>GlucoseIQ case study <ArrowRightIcon /></Link>
              <a href='https://github.com/marklearst/marklearst-portfolio/blob/99ed8e2ec1b5c8f1665d893410a39efaee391778/src/lib/glucose-demo.ts' target='_blank' rel='noopener noreferrer' className={styles.previewLink}>View source <ArrowUpRightIcon /></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

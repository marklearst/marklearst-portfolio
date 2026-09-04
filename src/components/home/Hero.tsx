import Link from 'next/link'
import PrimitreeGuardrailDemo from '@/components/evidence/PrimitreeGuardrailDemo'
import TrackedLink from '@/components/analytics/TrackedLink'
import HeroExamples from '@/components/home/HeroExamples'
import A11yReadinessPreview from '@/components/home/A11yReadinessPreview'
import { ArrowDownIcon, ArrowRightIcon, ArrowUpRightIcon, GithubIcon } from '@/components/ui/Icon'
import styles from '@/components/home/Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby='hero-name'>
      <div className={styles.container}>
        <div className={styles.heroGrid}>
          <div className={styles.introduction}>
            <h1 id='hero-name' className={styles.name}>Hi, I’m Mark.</h1>
            <p className={styles.lead}>Design engineer and UI architect who sets system direction in code.</p>
            <div className={styles.support}>
              <p>I build design systems from the tokens up, and the governance that keeps Figma and production React aligned.</p>
              <p>I also build React component libraries, Storybook, interactive prototypes, and micro-interactions.</p>
              <p>When work repeats, I turn it into an agent workflow with tests and human review before anything ships.</p>
            </div>
            <div className={styles.actions}>
              <TrackedLink className={styles.primaryLink} href='#work' event={{ type: 'hero', data: { action: 'view_work', location: 'hero' } }}>
                Explore the work <ArrowDownIcon />
              </TrackedLink>
              <TrackedLink className={styles.textLink} href='https://github.com/marklearst' target='_blank' rel='noopener noreferrer' event={{ type: 'external', data: { platform: 'github', href: 'https://github.com/marklearst', location: 'hero' } }}>
                <GithubIcon size={20} className={styles.brandIcon} /> GitHub <ArrowUpRightIcon />
              </TrackedLink>
            </div>
            <p className={styles.available}>Open to design engineering roles. <a href='mailto:jobs@marklearst.com'>Let’s talk <ArrowUpRightIcon /></a></p>
          </div>
          <HeroExamples examples={[
            { id: 'primitree', label: 'Primitree', children: <>
              <PrimitreeGuardrailDemo compact />
              <div className={styles.previewLinks}>
                <Link href='/work/primitree' className={styles.previewLink}>Primitree case study <ArrowRightIcon /></Link>
                <a href='https://primitree.com/docs' target='_blank' rel='noopener noreferrer' className={styles.previewLink}>Documentation <ArrowUpRightIcon /></a>
              </div>
            </> },
            { id: 'a11y', label: 'a11y Companion', children: <>
              <A11yReadinessPreview />
              <div className={styles.previewLinks}>
                <Link href='/work/a11y-companion' className={styles.previewLink}>a11y Companion case study <ArrowRightIcon /></Link>
                <a href='https://marklearst.me/a11y-companion-widget/' target='_blank' rel='noopener noreferrer' className={styles.previewLink}>Project website <ArrowUpRightIcon /></a>
              </div>
            </> },
          ]} />
        </div>
      </div>
    </section>
  )
}

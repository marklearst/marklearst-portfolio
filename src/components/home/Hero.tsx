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
            <h1 id='hero-name' className={styles.name}>Principal design engineer.</h1>
            <p className={styles.lead}>
              I set system direction in code: the tokens and governance that keep Figma and production React aligned, and the interfaces people actually use.
            </p>
            <div className={styles.support}>
              <p>
                I architect design systems end to end: token pipelines, UI architecture, React component libraries, and Storybook documentation that teams can ship against without guessing.
              </p>
              <p>
                I also build interactive prototypes and the micro-interactions between them (motion that answers a click or a hover, not decoration that waits for applause).
              </p>
              <p>
                When the same work keeps showing up, I turn it into an agent workflow with tests and human review before anything ships.
              </p>
            </div>
            <div className={styles.actions}>
              <TrackedLink className={styles.primaryLink} href='#work' event={{ type: 'hero', data: { action: 'view_work', location: 'hero' } }}>
                Explore the work <ArrowDownIcon />
              </TrackedLink>
              <TrackedLink className={styles.textLink} href='https://github.com/marklearst' target='_blank' rel='noopener noreferrer' event={{ type: 'external', data: { platform: 'github', href: 'https://github.com/marklearst', location: 'hero' } }}>
                <GithubIcon size={20} className={styles.brandIcon} /> GitHub <ArrowUpRightIcon />
              </TrackedLink>
            </div>
            <p className={styles.available}>Open to Principal Design Engineer roles. <a href='mailto:jobs@marklearst.com'>Let’s talk <ArrowUpRightIcon /></a></p>
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

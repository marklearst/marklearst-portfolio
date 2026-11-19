import Link from 'next/link'
import { TrackedFragmentLink } from '@/components/analytics/TrackedLink'
import { ArrowDownIcon, ArrowUpRightIcon } from '@/components/ui/Icon'
import HeroXRay from './HeroXRay'
import semantic from '@/tokens/semantic.tokens.json'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby='hero-name'>
      <div className={styles.container}>
        <HeroXRay sourceToken={semantic.semantic.type.specimen.size.$value.slice(1, -1)} />
        <div className={styles.intro}>
          <p className={styles.lead}>I’m Mark Learst, a frontend design engineer. I build React interfaces and design systems.</p>
          <div className={styles.practice}>
            <p>I built the component architecture for Skydio’s Autonomy Widget. My design token tool, <Link href='/work/primitree'>Primitree</Link>, powers <Link href='/system'>this site’s design system</Link>.</p>
            <div className={styles.actions}>
              <TrackedFragmentLink href='#work' event={{ type: 'hero', data: { action: 'view_work', location: 'hero' } }}>Explore the work <ArrowDownIcon /></TrackedFragmentLink>
              <a href='mailto:jobs@marklearst.com'>Let’s talk <ArrowUpRightIcon /></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

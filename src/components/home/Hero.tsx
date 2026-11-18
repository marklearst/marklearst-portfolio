import Link from 'next/link'
import { TrackedFragmentLink } from '@/components/analytics/TrackedLink'
import { ArrowDownIcon, ArrowUpRightIcon } from '@/components/ui/Icon'
import HeroXRay from './HeroXRay'
import semantic from '@/tokens/semantic.tokens.json'
import styles from './Hero.module.css'

function Lettering({ measured = false }: { measured?: boolean }) {
  const baseline = measured ? <i className={styles.baseline} /> : null
  return <><span>Design{baseline}</span>{' '}<span>engineer.{baseline}</span></>
}

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby='hero-name'>
      <div className={styles.container}>
        <HeroXRay sourceToken={semantic.semantic.type.specimen.size.$value.slice(1, -1)} blueprint={<>
          <div className={styles.name}><Lettering measured /></div>
        </>}>
          <h1 id='hero-name' className={styles.name} data-inspect-preview='' data-inspect='Homepage headline'><Lettering /></h1>
        </HeroXRay>
        <div className={styles.intro}>
          <p className={styles.lead}>I’m Mark. I build React interfaces and the tools behind them.</p>
          <div className={styles.practice}>
            <p>I built the component architecture for Skydio’s Autonomy Widget. My design token tool, <Link href='/work/primitree'>Primitree</Link>, runs this site.</p>
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

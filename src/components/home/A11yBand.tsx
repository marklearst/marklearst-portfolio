import A11yReadinessPreview from '@/components/home/A11yReadinessPreview'
import TrackedLink from '@/components/analytics/TrackedLink'
import { ArrowRightIcon, ArrowUpRightIcon } from '@/components/ui/Icon'
import { getProjectBySlug } from '@/data/projects'
import styles from './A11yBand.module.css'

const PROJECT = getProjectBySlug('a11y-companion')
const SITE = 'https://marklearst.me/a11y-companion-widget/'

/** The second proof on the home page: a11y Companion's readiness rules, running with sample data. */
export default function A11yBand() {
  return (
    <section className={styles.band} aria-labelledby='a11y-band-heading'>
      <div className={styles.container}>
        <div className={styles.copy}>
          <h2 id='a11y-band-heading'>{PROJECT.cardTitle}</h2>
          <p>Canvas native accessibility review for Figma and FigJam. Checklist progress, contrast evidence, and audit findings stay with the file.</p>
          <div className={styles.links}>
            <TrackedLink href={PROJECT.route} className={styles.link} event={{ type: 'case-study', data: { project: PROJECT.slug, category: PROJECT.category, route: PROJECT.route, source: 'home_band' } }}>
              {PROJECT.cardTitle} case study <ArrowRightIcon />
            </TrackedLink>
            <TrackedLink href={SITE} target='_blank' rel='noopener noreferrer' className={styles.link} event={{ type: 'external', data: { platform: 'a11y-companion', href: SITE, location: 'home_band' } }}>
              Project website <ArrowUpRightIcon />
            </TrackedLink>
          </div>
        </div>
        <A11yReadinessPreview />
      </div>
    </section>
  )
}

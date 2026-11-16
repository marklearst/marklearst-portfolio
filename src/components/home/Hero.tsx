import type { CSSProperties } from 'react'
import TrackedLink from '@/components/analytics/TrackedLink'
import HeroXRay from '@/components/home/HeroXRay'
import { HERO_SPEC, type PartSpec } from '@/components/home/hero-spec'
import HeroInspector from '@/components/inspector/HeroInspector'
import { Button } from '@/components/ui/Button'
import { ArrowDownIcon, ArrowUpRightIcon, GithubIcon } from '@/components/ui/Icon'
import styles from '@/components/home/Hero.module.css'

/**
 * The token path the blueprint writes beside a part. It is written in two pieces so that when the line leaves it
 * too little room, the layer at the front goes and the name at the end, the part that tells one from another, stays.
 * The stylesheet decides which fits, and for that it needs both lengths.
 */
function Spec({ part }: { part: keyof typeof HERO_SPEC }) {
  const spec: PartSpec = HERO_SPEC[part]
  if (!spec.label) return null
  const cut = spec.label.indexOf('.') + 1
  const name = spec.label.slice(cut)
  return (
    // The label is set in a monospace face, so a piece of it is exactly as many `ch` wide as it has characters.
    <span className={styles.spec} style={{ '--path': `${spec.label.length}ch`, '--name': `${name.length}ch` } as CSSProperties}>
      <span className={styles.specLayer}>{spec.label.slice(0, cut)}</span>
      <span className={styles.specName}>{name}</span>
    </span>
  )
}

/**
 * The introduction. It renders twice from this one function: once as the page,
 * and once, with `blueprint`, as the drawing of itself that sits to the right of the line.
 * The blueprint copy is never read or focused, so it carries no ids, no links,
 * and no tracking. Sharing the markup is what keeps the two in register.
 */
function Introduction({ blueprint = false }: { blueprint?: boolean }) {
  return (
    <>
      <h1 id={blueprint ? undefined : 'hero-name'} className={styles.name} data-inspect-preview={blueprint ? undefined : ''}>
        Hi, I’m Mark.
      </h1>
      {blueprint && <Spec part='name' />}
      <p className={styles.lead}>
        Design engineer and UI architect who sets system direction in code.
        {blueprint && <Spec part='lead' />}
      </p>
      <div className={styles.support}>
        <p>I build design systems from the tokens up, and the governance that keeps Figma and production React aligned.</p>
        <p>I also build React component libraries, Storybook, interactive prototypes, and micro interactions.</p>
        <p>When work repeats, I turn it into an agent workflow with tests and human review before anything ships.</p>
        {blueprint && <Spec part='support' />}
      </div>
      <div className={styles.actions}>
        {blueprint ? (
          <>
            <Button asChild className={styles.explore}>
              <span>
                Explore the work <ArrowDownIcon />
              </span>
            </Button>
            <Spec part='explore' />
            <span className={styles.textLink}>
              <GithubIcon size={20} className={styles.brandIcon} /> GitHub <ArrowUpRightIcon />
            </span>
          </>
        ) : (
          <>
            <Button asChild className={styles.explore}>
              <TrackedLink href='#work' event={{ type: 'hero', data: { action: 'view_work', location: 'hero' } }}>
                Explore the work <ArrowDownIcon />
              </TrackedLink>
            </Button>
            <TrackedLink className={styles.textLink} href='https://github.com/marklearst' target='_blank' rel='noopener noreferrer' event={{ type: 'external', data: { platform: 'github', href: 'https://github.com/marklearst', location: 'hero' } }}>
              <GithubIcon size={20} className={styles.brandIcon} /> GitHub <ArrowUpRightIcon />
            </TrackedLink>
          </>
        )}
      </div>
      <p className={styles.available}>
        Open to design engineering roles.{' '}
        {blueprint ? (
          <span className={styles.availableLink}>Let’s talk <ArrowUpRightIcon /></span>
        ) : (
          <a className={styles.availableLink} href='mailto:jobs@marklearst.com'>Let’s talk <ArrowUpRightIcon /></a>
        )}
        {blueprint && <Spec part='available' />}
      </p>
    </>
  )
}

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby='hero-name'>
      <div className={styles.container}>
        <div className={styles.heroGrid}>
          <div className={styles.introduction}>
            <HeroXRay blueprint={<Introduction blueprint />}>
              <Introduction />
            </HeroXRay>
          </div>
          <HeroInspector />
        </div>
      </div>
    </section>
  )
}

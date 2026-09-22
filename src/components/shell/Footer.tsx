import { GithubIcon, LinkedinIcon, MailIcon, ArrowUpRightIcon } from '@/components/ui/Icon'
import TrackedLink from '@/components/analytics/TrackedLink'
import SectionViewTracker from '@/components/analytics/SectionViewTracker'
import AnalyticsOptOutToggle from '@/components/analytics/AnalyticsOptOutToggle'
import styles from './Footer.module.css'

const roleEmail = 'mailto:jobs@marklearst.com?subject=Role%20inquiry&body=Hi%20Mark%2C%0D%0A%0D%0AI%20am%20reaching%20out%20about%20a%20role%20on%20our%20team.'
const coffeeUrl = 'https://www.buymeacoffee.com/marklearst'
const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/marklearst', platform: 'github', icon: GithubIcon },
  { name: 'LinkedIn', href: 'https://linkedin.com/in/marklearst', platform: 'linkedin', icon: LinkedinIcon },
  { name: 'Email', href: 'mailto:github@marklearst.com', platform: 'email', icon: MailIcon },
] as const

export default function Footer({ showPrivacyLink = true }: { showPrivacyLink?: boolean }) {
  return (
    <footer id='site-footer' className={styles.footer}>
      <SectionViewTracker targetId='site-footer' section='footer' location='global' />
      <div className={styles.container}>
        <div className={styles.main}>
          <div>
            <h2 className={styles.contactHeading}>
              <TrackedLink href={roleEmail} event={{ type: 'social', data: { platform: 'email', href: roleEmail } }}>
                Have a role in mind? <span aria-hidden='true'><ArrowUpRightIcon /></span>
              </TrackedLink>
            </h2>
            <p className={styles.availability}>Open to Principal Design Engineer roles.</p>
          </div>
          <nav className={styles.socialLinks} aria-label='Contact and profiles'>
            {socialLinks.map(({ name, href, platform, icon: Icon }) => (
              <TrackedLink key={platform} href={href} className={styles.socialLink}
                target={platform === 'email' ? undefined : '_blank'} rel={platform === 'email' ? undefined : 'noopener noreferrer'}
                event={{ type: 'social', data: { platform, href } }}>
                <span className={styles.icon} aria-hidden='true'><Icon size={20} /></span>
                <span>{name}</span>
              </TrackedLink>
            ))}
          </nav>
        </div>
        <div className={styles.bottom}>
          <span className={styles.copyright}>© 2026 Mark Learst.</span>
          <div className={styles.controls}>
            <TrackedLink href={coffeeUrl} target='_blank' rel='noopener noreferrer'
              event={{ type: 'social', data: { platform: 'buy-me-a-coffee', href: coffeeUrl } }}>
              Buy Me a Coffee
            </TrackedLink>
            <AnalyticsOptOutToggle />
            {showPrivacyLink && <TrackedLink href='/privacy'
              event={{ type: 'navigation', data: { action: 'privacy_page', to: '/privacy', location: 'footer' } }}>
              Privacy
            </TrackedLink>}
          </div>
        </div>
      </div>
    </footer>
  )
}

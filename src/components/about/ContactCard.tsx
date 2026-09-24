import { ArrowUpRightIcon } from '@/components/ui/Icon'
import styles from './AboutLayout.module.css'

interface ContactCardProps {
  href: string
  title: string
  description: string
  cta: string
}

/** Plain-string props prevent MDX from creating nested autolinks. */
export default function ContactCard({
  href,
  title,
  description,
  cta,
}: ContactCardProps) {
  return (
    <a
      className={styles.contactAction}
      href={href}
      aria-label={`${title}: ${cta}. ${description}`}
    >
      <span className={styles.contactLabel}>{title}</span>
      <span className={styles.contactArrow} aria-hidden='true'><ArrowUpRightIcon size={20} /></span>
    </a>
  )
}

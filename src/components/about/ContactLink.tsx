interface ContactLinkProps {
  href: string
  /**
   * Rendered verbatim. A prop rather than children because MDX would
   * autolink a bare email or URL in children into a nested <a>.
   */
  label: string
  /** Opens in a new tab with the matching rel. */
  external?: boolean
}

export default function ContactLink({
  href,
  label,
  external = false,
}: ContactLinkProps) {
  return (
    <a
      className='text-ink-primary/50 hover:text-ink-primary'
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {label}
    </a>
  )
}

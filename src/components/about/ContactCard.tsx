interface ContactCardProps {
  href: string
  title: string
  description: string
  cta: string
  /** Tailwind gradient stops for the hover wash. */
  gradient: string
}

/**
 * A contact card for the About page.
 *
 * Text arrives as props rather than children on purpose: in MDX, children are
 * re-parsed as markdown, so a bare email or URL would be autolinked into an
 * <a> nested inside this component's own <a> — invalid HTML that breaks
 * hydration. Props are plain strings and are never parsed.
 */
export default function ContactCard({
  href,
  title,
  description,
  cta,
  gradient,
}: ContactCardProps) {
  return (
    <a className='group block' href={href}>
      <div className='relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/2 p-6 backdrop-blur-xl transition-colors duration-500 group-hover:border-white/25 group-hover:bg-white/4'>
        <div
          className={`absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${gradient}`}
          aria-hidden
        />
        <div className='relative z-10 space-y-3'>
          <div className='font-mono text-xl font-medium text-white'>{title}</div>
          <div className='text-sm text-white/50'>{description}</div>
          <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs text-white/70 transition-colors duration-300 group-hover:border-white/20 group-hover:text-white/90'>
            {cta}
          </div>
        </div>
      </div>
    </a>
  )
}

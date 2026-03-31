interface CaseStudyIconProps {
  className?: string
}

const withSize = (className?: string) =>
  className ? `w-4 h-4 ${className}` : 'w-4 h-4'

export function GitHubIcon({ className }: CaseStudyIconProps) {
  return (
    <svg
      className={withSize(className)}
      fill='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        fillRule='evenodd'
        d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
        clipRule='evenodd'
      />
    </svg>
  )
}

export function NpmIcon({ className }: CaseStudyIconProps) {
  return (
    <svg
      className={withSize(className)}
      fill='currentColor'
      viewBox='0 0 24 24'
    >
      <path d='M0 0v24h6.75v-1.5H18V24h6V0H0zm6.75 22.5H1.5V1.5h21v19.5H19.5v-18h-9v18H6.75v-18h-5.25v21z' />
    </svg>
  )
}

export function FigmaIcon({ className }: CaseStudyIconProps) {
  return (
    <svg
      className={withSize(className)}
      fill='currentColor'
      viewBox='0 0 24 24'
    >
      <path d='M12 12.5c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5zm-3-3c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5 1.5-.672 1.5-1.5zm0-3c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5 1.5-.672 1.5-1.5zm3 0c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5zm3 3c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5 1.5-.672 1.5-1.5z' />
    </svg>
  )
}

export function ExternalLinkIcon({ className }: CaseStudyIconProps) {
  return (
    <svg
      className={withSize(className)}
      fill='currentColor'
      viewBox='0 0 24 24'
    >
      <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' />
    </svg>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import { getArtifactBySlug, getArtifacts } from '@/lib/content/artifacts'
import { getArtifactAccentColor } from '@/lib/content/artifact-tags'
import { stripFrontmatter } from '@/lib/content/strip-frontmatter'
import { MONOKAI } from '@/lib/monokai-colors'
import { createArtifactMdxComponents } from '@/components/mdx/ArtifactMdxComponents'
import ArtifactTag from '@/components/ArtifactTag'

type ArtifactPageProps = {
  params: Promise<{ slug?: string }>
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)

export async function generateStaticParams() {
  const artifacts = await getArtifacts()
  return artifacts.map((artifact) => ({ slug: artifact.slug }))
}

export async function generateMetadata({
  params,
}: ArtifactPageProps): Promise<Metadata> {
  const { slug } = await params
  if (!slug) {
    return {
      title: 'Artifacts - Mark Learst',
      description:
        'Technical writeups and experiments across design systems, motion, frontend, design engineering, and tooling.',
    }
  }

  const artifact = await getArtifactBySlug(slug)

  return {
    title: `${artifact.title} - Mark Learst`,
    description: artifact.summary,
  }
}

export default async function ArtifactPage({ params }: ArtifactPageProps) {
  const { slug } = await params
  if (!slug) {
    notFound()
  }

  const artifact = await getArtifactBySlug(slug)
  const siteUrl = 'https://marklearst.com'
  const shareUrl = `${siteUrl}/artifacts/${artifact.slug}`
  const shareText = `${artifact.title} - ${artifact.summary}`
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedText = encodeURIComponent(shareText)
  const shareLinks = [
    {
      label: 'Share on X',
      href: `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      label: 'Share on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ]
  const accent = getArtifactAccentColor(artifact.tags)
  const mdxComponents = createArtifactMdxComponents(accent)
  const Content = artifact.Content
  const content = stripFrontmatter(Content({ components: mdxComponents }))

  return (
    <main
      className='min-h-screen relative overflow-hidden'
    >
      <div className='absolute inset-0 pointer-events-none'>
        <div
          className='absolute top-1/4 left-1/3 w-[520px] h-[520px] rounded-full blur-[140px] opacity-20'
          style={{ backgroundColor: MONOKAI.cyan }}
        />
        <div
          className='absolute bottom-1/3 right-1/4 w-[520px] h-[520px] rounded-full blur-[160px] opacity-15'
          style={{ backgroundColor: MONOKAI.purple }}
        />
      </div>

      <article className='relative z-10 px-6 pt-36 pb-24'>
        <div className='max-w-4xl mx-auto'>
          <Link
            href='/artifacts'
            className='inline-flex items-center gap-2 mb-10 font-mono text-sm transition-colors duration-300 group'
            style={{ color: `${MONOKAI.foreground}80` }}
          >
            <svg
              className='w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
            Back to artifacts
          </Link>

          <div className='flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-wider text-white/40 mb-6'>
            <span>{formatDate(artifact.publishedAt)}</span>
            <span>{artifact.readingTime.minutes} min read</span>
          </div>

          <h1
            className='text-[clamp(48px,7vw,96px)] font-mono font-bold! lowercase leading-[0.9] mb-6'
            style={{ color: MONOKAI.foreground }}
          >
            {artifact.title}
          </h1>

          <p
            className='text-[clamp(16px,2vw,22px)] leading-relaxed max-w-3xl mb-10'
            style={{ color: `${MONOKAI.foreground}b3` }}
          >
            {artifact.summary}
          </p>

          <div className='flex flex-wrap gap-2 mb-12'>
            {artifact.tags.map((tag) => (
              <ArtifactTag key={tag} tag={tag} />
            ))}
          </div>

          <div className='flex flex-wrap items-center gap-3 mb-12 text-xs font-mono uppercase tracking-wider text-white/40'>
            {shareLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target='_blank'
                rel='noopener noreferrer'
                className='px-3 py-1.5 rounded-md border border-white/20 text-white/70 transition-colors duration-300 hover:text-white/90 hover:border-white/60'
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className='space-y-6'>{content}</div>
        </div>
      </article>

      <Footer />
    </main>
  )
}

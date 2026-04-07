import Link from 'next/link'
import ArtifactTag from '@/components/ArtifactTag'
import { MONOKAI } from '@/lib/monokai-colors'

type ArtifactCardProps = {
  slug: string
  title: string
  summary: string
  tags: string[]
  readingTimeMinutes: number
  publishedAt: Date
  pinned?: boolean
  featured?: boolean
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)

export default function ArtifactCard({
  slug,
  title,
  summary,
  tags,
  readingTimeMinutes,
  publishedAt,
  pinned,
  featured,
}: ArtifactCardProps) {
  return (
    <Link
      href={`/artifacts/${slug}`}
      className={`group relative block ${featured ? 'md:col-span-2' : ''}`}
    >
      <div
        className={`relative h-full p-7 rounded-2xl bg-white/2 backdrop-blur-xl border border-white/10 transition-all duration-700 ease-out overflow-hidden hover:border-white/20 ${
          featured ? 'min-h-[260px]' : ''
        }`}
      >
        <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-linear-to-br from-white/5 via-transparent to-transparent' />

        <div className='relative z-10 h-full flex flex-col gap-4'>
          <div className='flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/40'>
            <span>{formatDate(publishedAt)}</span>
            {pinned && (
              <span
                className='px-2 py-1 rounded-full border'
                style={{
                  color: MONOKAI.yellow,
                  borderColor: `${MONOKAI.yellow}55`,
                  backgroundColor: `${MONOKAI.yellow}15`,
                }}
              >
                Pinned
              </span>
            )}
          </div>

          <div className='space-y-3'>
            <h3 className='text-2xl font-mono font-medium text-white/90 group-hover:text-white transition-colors duration-500'>
              {title}
            </h3>
            <p className='text-sm leading-relaxed text-white/60'>{summary}</p>
          </div>

          <div className='mt-auto flex flex-wrap items-center gap-2'>
            {tags.map((tag) => (
              <ArtifactTag key={tag} tag={tag} />
            ))}
          </div>

          <div className='flex items-center justify-between text-[11px] font-mono text-white/40'>
            <span>{readingTimeMinutes} min read</span>
            <span className='inline-flex items-center gap-2'>
              Read artifact
              <svg
                className='w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-300'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M13 7l5 5m0 0l-5 5m5-5H6'
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

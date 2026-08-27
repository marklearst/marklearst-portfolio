import Link from 'next/link'
import styles from './ArtifactLayout.module.css'

type ArtifactCardProps = {
  slug: string
  title: string
  summary: string
  tags: string[]
  readingTimeMinutes: number
  publishedAt: Date
  pinned?: boolean
}

const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
}).format(date)

export default function ArtifactCard({ slug, title, summary, tags, readingTimeMinutes, publishedAt, pinned }: ArtifactCardProps) {
  return (
    <article className={styles.entry}>
      <div className={styles.entryMeta}>
        <time dateTime={publishedAt.toISOString()}>{formatDate(publishedAt)}</time>
        <span>{readingTimeMinutes} min read</span>
        {pinned && <span className={styles.pinned}>Featured</span>}
      </div>
      <div className={styles.entryBody}>
        <h2><Link href={`/artifacts/${slug}`}>{title}<span aria-hidden='true'>↗</span></Link></h2>
        <p>{summary}</p>
        <ul className={styles.tags} aria-label='Topics'>{tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
      </div>
    </article>
  )
}

import { ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from '@/components/ui/Icon'
import type { Metadata } from 'next'
import { Children, cloneElement, isValidElement, type ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Footer from '@/components/shell/Footer'
import DisclosureSummary from '@/components/ui/DisclosureSummary'
import RelatedNavigation from '@/components/navigation/RelatedNavigation'
import { getArtifactBySlug, getArtifacts } from '@/lib/content/artifacts'
import { getAdjacentContent } from '@/lib/content/adjacent-content'
import { stripFrontmatter } from '@/lib/content/strip-frontmatter'
import { artifactMdxComponents } from '@/components/mdx/ArtifactMdxComponents'
import styles from '@/components/artifacts/ArtifactLayout.module.css'

type ArtifactPageProps = { params: Promise<{ slug?: string }> }
const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
}).format(date)

const nodeText = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children)
  return ''
}

export async function generateStaticParams() {
  return (await getArtifacts()).map((artifact) => ({ slug: artifact.slug }))
}

export async function generateMetadata({ params }: ArtifactPageProps): Promise<Metadata> {
  const { slug } = await params
  if (!slug) return { title: 'Artifacts - Mark Learst' }
  const artifact = await getArtifactBySlug(slug)
  return { title: `${artifact.title} - Mark Learst`, description: artifact.summary }
}

export default async function ArtifactPage({ params }: ArtifactPageProps) {
  const { slug } = await params
  if (!slug) notFound()
  const artifacts = await getArtifacts()
  const artifact = artifacts.find(item => item.slug === slug)
  if (!artifact) notFound()
  const { previous, next } = getAdjacentContent(artifacts, slug)
  const shareUrl = `https://marklearst.com/artifacts/${artifact.slug}`
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedText = encodeURIComponent(`${artifact.title} - ${artifact.summary}`)
  const shareLinks = [
    { label: 'Share on X', href: `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { label: 'Share on LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ]
  const headings: { id: string; label: string }[] = []
  const prepareContent = (node: ReactNode): ReactNode => Children.map(node, (child) => {
    if (!isValidElement<{ id?: string; children?: ReactNode }>(child)) return child
    // A code block cannot contain article headings. Preserve its single code child.
    if (child.type === artifactMdxComponents.pre) return child
    if (child.type === artifactMdxComponents.h2) {
      const label = nodeText(child.props.children)
      const id = `section-${headings.length + 1}`
      headings.push({ id, label })
      return cloneElement(child, { id })
    }
    if (child.props.children === undefined) return child
    return cloneElement(child, { children: prepareContent(child.props.children) })
  })
  const content = prepareContent(stripFrontmatter(artifact.Content({ components: artifactMdxComponents })))
  const relatedProject = artifact.slug.startsWith('a11y-companion')
    ? { title: 'a11y Companion case study', href: '/work/a11y-companion' }
    : artifact.slug === 'variable-design-standard-semver'
      ? { title: 'Variable Design Standard case study', href: '/work/variable-design-standard' }
      : null

  return (
    <main className={styles.page}>
      <article className={`${styles.container} ${styles.article}`}>
        <Link href='/artifacts' className={styles.backLink}><span aria-hidden='true'><ArrowLeftIcon /></span> ../artifacts</Link>
        <header>
          <div className={styles.articleMeta}><time dateTime={artifact.publishedAt.toISOString()}>{formatDate(artifact.publishedAt)}</time><span>{artifact.readingTime.minutes} min read</span></div>
          <h1 id='article-title' className={styles.title}>{artifact.title}</h1>
          <p className={styles.summary}>{artifact.summary}</p>
          <ul className={styles.tags} aria-label='Topics'>{artifact.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
        </header>
        {headings.length > 1 && <details className={styles.outline}>
          <DisclosureSummary>In this article</DisclosureSummary><nav aria-label='In this article'>
          <ol>{headings.map((heading) => <li key={heading.id}><a href={`#${heading.id}`}>{heading.label}</a></li>)}</ol>
        </nav></details>}
        <div className={styles.content}>{content}</div>
        <footer className={styles.articleEnd}>
          {relatedProject && <><p>Related work</p><Link href={relatedProject.href}>{relatedProject.title} <span aria-hidden='true'><ArrowRightIcon /></span></Link></>}
          <div className={styles.share}>{shareLinks.map((link) => <a key={link.label} href={link.href} target='_blank' rel='noopener noreferrer'>{link.label}</a>)}</div>
        </footer>
        <RelatedNavigation
          itemType='article'
          previous={previous ? { href: `/artifacts/${previous.slug}`, title: previous.title } : null}
          next={next ? { href: `/artifacts/${next.slug}`, title: next.title } : null}
        />
        <nav className={styles.endNavigation} aria-label='Article controls'>
          <Link href='/artifacts' className={styles.backLink} aria-label='Back to artifacts'><ArrowLeftIcon /> ../artifacts</Link>
          <a href='#article-title' className={styles.backLink}>Back to top <ArrowUpIcon /></a>
        </nav>
      </article>
      <Footer />
    </main>
  )
}

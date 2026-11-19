import type { Metadata } from 'next'

export const imageSize = { width: 1200, height: 630 }
export const publicationDate = new Intl.DateTimeFormat('en-US', {
  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
})

export function articleMetadata(url: string, title: string, description: string, publishedAt?: Date): Metadata {
  const byline = publishedAt ? `Mark Learst, ${publicationDate.format(publishedAt)}` : 'Mark Learst'
  const images = [{ url: `${url}/opengraph-image`, ...imageSize, alt: `${title} by ${byline}` }]
  return {
    title: `${title} | Mark Learst`,
    description,
    openGraph: { type: 'article', url, siteName: 'Mark Learst', locale: 'en_US', images },
    twitter: { card: 'summary_large_image', images },
  }
}

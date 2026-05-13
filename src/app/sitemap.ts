import type { MetadataRoute } from 'next'
import { PROJECTS } from '@/data/projects'
import { getArtifacts } from '@/lib/content/artifacts'

const BASE_URL = 'https://marklearst.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const artifacts = await getArtifacts()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, priority: 1.0 },
    { url: `${BASE_URL}/about`, priority: 0.8 },
    { url: `${BASE_URL}/work`, priority: 0.8 },
    { url: `${BASE_URL}/artifacts`, priority: 0.8 },
    { url: `${BASE_URL}/privacy`, priority: 0.3 },
  ]

  const workRoutes: MetadataRoute.Sitemap = PROJECTS.map((project) => ({
    url: `${BASE_URL}${project.route}`,
    lastModified: project.publishedAt,
    priority: 0.6,
  }))

  const artifactRoutes: MetadataRoute.Sitemap = artifacts.map((artifact) => ({
    url: `${BASE_URL}/artifacts/${artifact.slug}`,
    lastModified: artifact.published_at,
    priority: 0.6,
  }))

  return [...staticRoutes, ...workRoutes, ...artifactRoutes]
}

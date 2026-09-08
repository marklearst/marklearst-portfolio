/** Follow the supplied index order, with no wrap at either endpoint. */
export function getAdjacentContent<T extends { slug: string }>(
  items: readonly T[],
  currentSlug: string,
): { previous: T | null; next: T | null } {
  const index = items.findIndex(item => item.slug === currentSlug)
  if (index === -1) throw new Error(`Unknown content slug: ${currentSlug}`)

  return {
    previous: index > 0 ? items[index - 1] : null,
    next: index < items.length - 1 ? items[index + 1] : null,
  }
}

/** The artifact index and adjacent navigation share newest-first ordering. */
export function orderArtifacts<T extends { publishedAt: Date }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
}

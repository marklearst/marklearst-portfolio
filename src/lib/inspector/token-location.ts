const PREFIX = '#token='

/** Only a path in the built graph can become a URL-selected token. */
export function tokenFromHash(hash: string, paths: readonly string[]): string | null {
  if (!hash.startsWith(PREFIX)) return null
  try {
    const path = decodeURIComponent(hash.slice(PREFIX.length))
    return paths.includes(path) ? path : null
  } catch {
    return null
  }
}

export function tokenHash(path: string): string {
  return PREFIX + encodeURIComponent(path)
}

export function tokenHref(path: string): string {
  return '/system' + tokenHash(path)
}

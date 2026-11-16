'use client'

import { useSyncExternalStore } from 'react'

const never = () => () => {}

/**
 * The address the visitor asked for, as they typed or followed it.
 *
 * The server can't know it: the not found page is rendered once, ahead of time, for every unknown address. So
 * the server writes a placeholder, the browser starts from the same placeholder, and the real path replaces it
 * once the page has taken over. Reading the path during that first render made the two disagree, and React
 * threw the page away and built it again.
 */
export default function RequestedPath() {
  const path = useSyncExternalStore(
    never,
    () => window.location.pathname,
    () => null,
  )
  return <>{path ?? '…'}</>
}

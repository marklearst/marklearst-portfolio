'use client'

import { usePathname } from 'next/navigation'

/** The address the visitor asked for, as they typed or followed it. */
export default function RequestedPath() {
  return <>{usePathname()}</>
}

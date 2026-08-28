'use client'

import { ViewTransition } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <ViewTransition key={pathname} enter='page-enter' exit='page-exit' default='none'>
      <div id='page-content' className='page-transition-surface' tabIndex={-1}>{children}</div>
    </ViewTransition>
  )
}

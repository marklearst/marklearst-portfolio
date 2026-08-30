'use client'

import { ViewTransition } from 'react'
import './PageTransition.css'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    // Keep the router subtree mounted. Next coordinates navigation, focus, and
    // scroll; React captures the content change when that transition commits.
    <ViewTransition update='route-content' default='none'>
      <div id='page-content' className='page-transition-surface' tabIndex={-1}>{children}</div>
    </ViewTransition>
  )
}

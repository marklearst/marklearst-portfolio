'use client'

import { useLayoutEffect, useRef } from 'react'
import Wordmark from '@/components/brand/Wordmark'
import InspectorToggle from '@/components/inspector/InspectorToggle'
import PrimaryNav from '@/components/navigation/PrimaryNav'
import styles from './SiteHeader.module.css'

export default function SiteHeader() {
  const header = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const node = header.current
    if (!node) return
    const root = document.documentElement
    const measure = () => root.style.setProperty('--site-header-height', `${node.getBoundingClientRect().height}px`)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => {
      observer.disconnect()
      root.style.removeProperty('--site-header-height')
    }
  }, [])

  return (
    <header ref={header} className={styles.header}>
      <div className={styles.inner}>
        <Wordmark />
        <div className={styles.controls}>
          <PrimaryNav>
            <InspectorToggle />
          </PrimaryNav>
        </div>
      </div>
    </header>
  )
}

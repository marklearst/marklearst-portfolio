'use client'

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { SPECIMEN_SIZE } from './hero-spec'
import styles from './Hero.module.css'

const REST = 53

export default function HeroXRay({ children, blueprint, sourceToken }: { children: ReactNode; blueprint: ReactNode; sourceToken: string }) {
  const description = useId()
  const stage = useRef<HTMLDivElement>(null)
  const [peel, setPeel] = useState(REST)
  const [pixels, setPixels] = useState<number>()
  const [mode, setMode] = useState<'rest' | 'drag' | 'switch'>('rest')

  useEffect(() => {
    const name = stage.current?.querySelector('h1')
    if (!name) return
    const observer = new ResizeObserver(() => setPixels(Math.round(parseFloat(getComputedStyle(name).fontSize) * 10) / 10))
    observer.observe(name)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.specimen}>
      <div ref={stage} className={styles.stage} style={{ '--peel': `${peel}%` } as CSSProperties} data-mode={mode}>
        <div className={styles.rendered}>{children}</div>
        <div className={styles.xray} inert aria-hidden='true' data-inspector-ui=''>
          {blueprint}
          <div className={styles.sourceNote}><span>Type scale</span> <b>{sourceToken}</b></div>
        </div>
        <div className={styles.seam} aria-hidden='true'><span>‹ ›</span></div>
        <input type='range' className={styles.scan} min='0' max='100' dir='rtl' value={100 - peel}
          aria-label='Blueprint reveal' aria-describedby={description} aria-valuetext={`${100 - peel}% blueprint`} data-inspector-ui=''
          onPointerDown={() => setMode('drag')}
          onChange={event => {
            setMode('drag')
            setPeel(100 - event.currentTarget.valueAsNumber)
          }} />
      </div>
      <div className={styles.legend}>
        <button type='button' className={styles.flip} aria-describedby={description} onClick={() => {
          setMode('switch')
          setPeel(peel > 0 ? 0 : 100)
        }}>
          <span className={styles.splitIcon} aria-hidden='true' />
          {peel > 0 ? 'Show blueprint' : 'Show interface'}
        </button>
        <span id={description} className={styles.readout}><span className="sr-only">{sourceToken} sets </span>{SPECIMEN_SIZE}<span className="sr-only">, rendered at </span><b>{pixels === undefined ? '' : `${pixels} px`}</b></span>
      </div>
    </div>
  )
}

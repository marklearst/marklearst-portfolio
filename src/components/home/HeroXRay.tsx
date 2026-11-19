'use client'

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { SPECIMEN_SIZE } from './hero-spec'
import { FINAL_TITLE, HERO_TITLES, RESTING_SPLIT, type TitlePhase } from './hero-titles'
import { useHeroTitles } from './useHeroTitles'
import styles from './Hero.module.css'

function TitleRows({ index }: { index: number }) {
  return HERO_TITLES[index].map((word, line) => (
    <span key={line} className={styles.word} data-ink={word}><span>{word}</span></span>
  ))
}

function Title({ index, phase, guides }: { index: number; phase: TitlePhase; guides?: ReactNode }) {
  const opening = phase === 'entering' || phase === 'docking'
  const first = phase === 'initial' || opening
  return <span className={styles.titleStack} aria-hidden='true'>
    {first && <span className={styles.first} data-title-plane='first'><TitleRows index={0} /></span>}
    {!opening && <span className={phase === 'initial' ? styles.fallback : undefined} data-title-plane={phase === 'turning' ? 'out' : undefined}>
      <TitleRows index={index} />
    </span>}
    {phase === 'turning' && <span data-title-plane='in'><TitleRows index={index + 1} /></span>}
    {guides}
  </span>
}

type TypeMetrics = { size: number; cap: number; x: number; descent: number; leading: number; tracking: number }

function TypeGuides({ metrics }: { metrics?: TypeMetrics }) {
  const line = (guide: string, bottom?: number, label?: string) => <span data-guide={guide} className={styles.rule} style={{ bottom }}>
    {label && <span className={styles.ruleLabel}>{label}</span>}
  </span>
  return <span className={styles.guides}>
    {[0, 1].map(row => <span key={row} className={styles.guideRow}><span className={styles.origin}>
      {line('cap', metrics?.cap, row === 0 ? 'Cap height' : undefined)}
      {line('x', metrics?.x, row === 0 ? 'x-height' : undefined)}
      {line('baseline', 0, row === 1 ? 'Baseline' : undefined)}
      {line('descent', metrics && -metrics.descent, row === 1 ? 'g descent' : undefined)}
    </span></span>)}
  </span>
}

export default function HeroXRay({ sourceToken }: { sourceToken: string }) {
  const description = useId()
  const inkBlur = useId()
  const stage = useRef<HTMLDivElement>(null)
  const grip = useRef<HTMLSpanElement>(null)
  const { frame, hold, toggle } = useHeroTitles(stage)
  const titleProps = { index: frame.index, phase: frame.phase }
  const replay = frame.phase === 'finished' || (frame.phase === 'held' && frame.index === FINAL_TITLE)
  const control = frame.motion === 'reduced' ? 'Next title' : replay ? 'Replay titles' : frame.phase === 'held' ? 'Resume titles' : 'Pause titles'
  const [split, setPeel] = useState(RESTING_SPLIT)
  const peel = frame.phase === 'entering' || frame.phase === 'docking' ? 0 : split
  const [metrics, setMetrics] = useState<TypeMetrics>()
  const [mode, setMode] = useState<'rest' | 'drag' | 'switch'>('rest')

  function takeGuide() {
    if ((frame.phase === 'entering' || frame.phase === 'docking' || mode === 'switch') && grip.current && stage.current) {
      const sheet = stage.current.getBoundingClientRect()
      const guide = grip.current.getBoundingClientRect()
      const position = 100 * (guide.left + guide.width / 2 - sheet.left) / sheet.width
      setPeel(Math.max(0, Math.min(100, position)))
    }
    setMode('drag')
    hold()
  }

  useEffect(() => {
    const name = stage.current?.querySelector('h1')
    const pen = document.createElement('canvas').getContext('2d')
    if (!name || !pen) return
    let mounted = true
    let pending = 0
    const measure = () => {
      pending = 0
      const style = getComputedStyle(name)
      pen.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
      const round = (value: number) => Math.round(value * 10) / 10
      const next = {
        leading: round(parseFloat(style.lineHeight)),
        tracking: round(parseFloat(style.letterSpacing) || 0),
        size: round(parseFloat(style.fontSize)),
        cap: round(pen.measureText('H').actualBoundingBoxAscent),
        x: round(pen.measureText('x').actualBoundingBoxAscent),
        descent: round(pen.measureText('g').actualBoundingBoxDescent),
      }
      setMetrics(prev => prev && prev.size === next.size && prev.cap === next.cap && prev.x === next.x && prev.descent === next.descent && prev.leading === next.leading && prev.tracking === next.tracking ? prev : next)
    }
    const schedule = () => {
      if (mounted && !pending) pending = requestAnimationFrame(measure)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(name)
    void document.fonts.ready.then(schedule)
    document.fonts.addEventListener('loadingdone', schedule)
    return () => {
      mounted = false
      cancelAnimationFrame(pending)
      observer.disconnect()
      document.fonts.removeEventListener('loadingdone', schedule)
    }
  }, [])

  return (
    <div className={styles.specimen} data-title-phase={frame.phase}>
      <div ref={stage} className={styles.stage} style={{ '--peel': `${peel}%`, '--ink-blur': `url("#${inkBlur}")` } as CSSProperties} data-mode={mode}>
        <svg width='0' height='0' aria-hidden='true' className={styles.filterDefs}>
          <defs>
            <filter id={inkBlur} x='-50%' width='200%'>
              <feGaussianBlur in='SourceGraphic' stdDeviation='15 0' />
            </filter>
          </defs>
        </svg>
        <div className={styles.sheet}>
          <div className={styles.rendered}>
            <h1 id='hero-name' className={styles.name} aria-label='Mark Learst, frontend and design engineer' data-inspect-preview='' data-inspect='Homepage headline'>
              <Title {...titleProps} />
            </h1>
          </div>
          <div className={styles.xray} inert aria-hidden='true' data-inspector-ui=''>
            <div className={styles.drawing}>
              <div className={styles.name}><Title {...titleProps} guides={<TypeGuides metrics={metrics} />} /></div>
              <div className={styles.sourceNote}><span>Blueprint</span><b>{sourceToken}</b></div>
            </div>
          </div>
        </div>
        <div className={styles.seam} aria-hidden='true' data-inspector-ui=''>
          <span ref={grip} className={styles.grip}>
            <svg width='12' height='16' viewBox='0 0 12 16' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M4.5 4 1.5 8l3 4M7.5 4l3 4-3 4' />
            </svg>
          </span>
        </div>
        <div className={styles.sliderTarget}>
          <input type='range' className={styles.scan} min='0' max='100' dir='rtl' value={Math.round(100 - peel)}
            aria-label='Blueprint reveal' aria-describedby={description} aria-valuetext={`${Math.round(100 - peel)}% blueprint`} data-inspector-ui=''
            onFocus={takeGuide}
            onPointerDown={takeGuide}
            onChange={event => {
              hold()
              setMode('drag')
              setPeel(100 - event.currentTarget.valueAsNumber)
            }} />
        </div>
      </div>
      <div className={styles.legend}>
        <div className={styles.tools} data-inspector-ui=''>
          <button type='button' className={styles.flip} aria-describedby={description} onClick={() => {
            hold()
            setMode('switch')
            setPeel(split > 0 ? 0 : 100)
          }}>
            <span className={styles.splitIcon} aria-hidden='true' />
            {split > 0 ? 'Show blueprint' : 'Show interface'}
          </button>
          <button type='button' className={styles.playback} onClick={() => {
            if (replay && frame.motion !== 'reduced') {
              setPeel(RESTING_SPLIT)
              setMode('rest')
            } else if (frame.phase === 'entering' || frame.phase === 'docking') {
              takeGuide()
              return
            }
            toggle()
          }}
            aria-description={frame.motion !== 'reduced' && (frame.phase === 'held' || frame.phase === 'finished') ? `Current title: ${HERO_TITLES[frame.index].join(' ')}` : undefined}
            aria-label={frame.motion === 'reduced' ? `Next title. Current title: ${HERO_TITLES[frame.index].join(' ')}` : undefined}>
            {control}
          </button>
        </div>
        <span className='sr-only' id={description}>
          {sourceToken} sets {SPECIMEN_SIZE}.
          {metrics && ` Rendered at ${metrics.size} pixels. Cap height ${metrics.cap} pixels, x-height ${metrics.x} pixels and g descent ${metrics.descent} pixels. Line height ${metrics.leading} pixels. Letter spacing ${metrics.tracking} pixels.`}
        </span>
        <span aria-hidden='true' className={styles.readout} data-full={split === 0 && metrics ? '' : undefined}>
          <span className={styles.scaleSummary}>{SPECIMEN_SIZE}<b>{metrics && `${metrics.size} px`}</b></span>
          {metrics && split === 0 && <span className={styles.metricSummary}>
            <span>Cap {metrics.cap} px</span><span>x-height {metrics.x} px</span><span>g descent {metrics.descent} px</span>
          </span>}
          {metrics && split === 0 && <span className={styles.cssMetrics}><span>Line height {metrics.leading} px</span><span>Tracking {metrics.tracking} px</span></span>}
        </span>
      </div>
    </div>
  )
}

'use client'

import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react'
import { useInspector, useInspectorController } from '@/components/inspector/InspectorProvider'
import type { Motion } from '@/components/inspector/inspector-controller'
import { Button } from '@/components/ui/Button'
import { Segmented, SegmentedOption } from '@/components/ui/Segmented'
import { Slider } from '@/components/ui/Slider'
import { curvePath, curveProgress, type Bezier } from '@/lib/motion-curve'
import { playMotionPreview } from '@/lib/motion-preview'
import TokenPath from './TokenPath'
import styles from './MotionBench.module.css'

export interface MotionProfile {
  id: string
  name: string
  description: string
  token: string
  easing: string
  durationVariable: `--${string}`
  easingVariable: `--${string}`
  contexts: Record<Motion, { milliseconds: number; curve: Bezier; chain: string[] }>
}

function TimingSample({ profile, motion }: { profile: MotionProfile; motion: Motion }) {
  const resolved = profile.contexts[motion]
  const instant = resolved.milliseconds === 0
  const initial = instant ? 1 : 0
  const rail = useRef<HTMLDivElement>(null)
  const sample = useRef<HTMLDivElement>(null)
  const probe = useRef<SVGGElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const output = useRef<HTMLOutputElement>(null)
  const status = useRef<HTMLParagraphElement>(null)
  const replay = useRef<HTMLButtonElement>(null)
  const scrubbingFocus = useRef(false)
  const playback = useRef<ReturnType<typeof playMotionPreview> | null>(null)
  const frame = useRef(0)
  const time = useRef(initial)
  const distance = useRef(0)
  const label = useId()
  const help = useId()

  const announce = useCallback((message: string) => {
    if (status.current && status.current.textContent !== message) status.current.textContent = message
  }, [])

  const paint = useCallback((position: number, move = true) => {
    time.current = position
    const progress = instant ? 1 : curveProgress(position, resolved.curve)
    probe.current?.setAttribute('transform', `translate(${position * 100} ${100 - progress * 100})`)
    if (move && sample.current) sample.current.style.transform = `translateX(${distance.current * progress}px)`
    if (input.current) {
      input.current.value = String(Math.round(position * 1000))
      input.current.setAttribute('aria-valuetext', `${Math.round(position * resolved.milliseconds)} milliseconds, ${Math.round(progress * 100)} percent progress`)
    }
    if (output.current) output.current.textContent = `${Math.round(position * resolved.milliseconds)} ms · ${Math.round(progress * 100)}% progress`
  }, [instant, resolved])

  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current)
    if (playback.current) {
      const position = Math.min(1, playback.current.time / playback.current.duration)
      playback.current.stop()
      playback.current = null
      paint(position)
      announce('Playback paused.')
    }
  }, [paint, announce])

  useLayoutEffect(() => {
    const host = rail.current
    const specimen = sample.current
    if (!host || !specimen) return
    const observer = new ResizeObserver(() => {
      stop()
      distance.current = Math.max(0, host.clientWidth - specimen.offsetWidth)
      paint(time.current)
    })
    distance.current = Math.max(0, host.clientWidth - specimen.offsetWidth)
    paint(initial)
    announce('')
    if (instant && scrubbingFocus.current) replay.current?.focus()
    observer.observe(host)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame.current)
      playback.current?.stop()
      playback.current = null
    }
  }, [paint, stop, initial, instant, announce])

  const play = () => {
    stop()
    if (instant) {
      paint(1)
      announce('Applied instantly. Reduced motion resolves this duration to zero.')
      return
    }
    if (!sample.current) return
    paint(0)
    const animation = playMotionPreview(sample.current, distance.current, profile.durationVariable, profile.easingVariable)
    playback.current = animation
    announce(`Playing ${profile.name.toLowerCase()} over ${resolved.milliseconds} milliseconds.`)
    const tick = () => {
      if (playback.current !== animation) return
      const position = Math.min(1, animation.time * 1000 / resolved.milliseconds)
      paint(position, false)
      frame.current = requestAnimationFrame(tick)
    }
    void animation.then(() => {
      if (playback.current !== animation) return
      cancelAnimationFrame(frame.current)
      playback.current = null
      paint(1)
      announce(`${profile.name} complete. Scrub time to inspect its progress.`)
    })
    frame.current = requestAnimationFrame(tick)
  }

  return (
    <div className={styles.study}>
      <div className={styles.plot}>
        <svg viewBox='-6 -6 112 112' aria-hidden='true'>
          <path className={styles.axes} d='M0 0 V100 H100' />
          <path className={styles.reference} d='M0 100 L100 0' />
          <path className={styles.curve} d={instant ? 'M0 100 V0 H100' : curvePath(resolved.curve)} />
          <g ref={probe} className={styles.probe} transform={`translate(${initial * 100} ${100 - initial * 100})`}><path d='M-2 0 H2 M0 -2 V2' /></g>
        </svg>
        <span className={styles.progressLabel}>Progress</span>
        <span className={styles.timeLabel}>Time</span>
      </div>
      <div className={styles.playback}>
        <div>
          <p className={styles.duration}>{resolved.milliseconds}<span> ms</span></p>
          <p className={styles.description}>{profile.description}</p>
        </div>
        <div className={styles.rail} ref={rail} aria-hidden='true'><div className={styles.sample} ref={sample}>Preview</div></div>
        <div className={styles.scrubber}>
          <div className={styles.readout}><label id={label}>Time</label><output ref={output} aria-hidden='true'>{instant ? '0 ms · 100% progress' : '0 ms · 0% progress'}</output></div>
          <Slider ref={input} min={0} max={1000} step={1} defaultValue={initial * 1000} disabled={instant} aria-labelledby={label} aria-describedby={help} aria-valuetext={instant ? '0 milliseconds, 100 percent progress' : '0 milliseconds, 0 percent progress'} onFocus={() => { scrubbingFocus.current = true }} onBlur={() => { scrubbingFocus.current = false }} onValueChange={(value) => {
            const next = value / 1000
            stop()
            paint(next)
            announce('Playback paused. Scrubbing time.')
          }} />
        </div>
        <div className={styles.playActions}><Button ref={replay} variant='secondary' onClick={play}>{instant ? 'Apply instantly' : 'Replay motion'}</Button><p id={help}>{instant ? 'No elapsed time. The end state is immediate.' : 'Drag time to pause and inspect the curve.'}</p></div>
        <p ref={status} className={styles.status} role='status' />
      </div>
    </div>
  )
}

export default function MotionBench({ profiles }: { profiles: readonly MotionProfile[] }) {
  const [selected, setSelected] = useState(profiles[0].id)
  const profile = profiles.find((entry) => entry.id === selected) ?? profiles[0]
  const motion = useInspector((state) => state.motion)
  const controller = useInspectorController()
  const heading = useId()
  const resolved = profile.contexts[motion]

  return (
    <section className={styles.section} aria-labelledby={heading}>
      <header className={styles.heading}><h2 id={heading}>Read the motion.</h2><p>Choose a timing role, play it, or scrub through its curve. These are the Primitree values running this site.</p></header>
      <div className={styles.bench} data-inspector-ui=''>
        <div className={styles.toolbar}><Segmented aria-label='Timing role' value={selected} onValueChange={setSelected}>{profiles.map((entry) => <SegmentedOption key={entry.id} className={styles.option} value={entry.id}>{entry.name}</SegmentedOption>)}</Segmented><span className={styles.context}>{motion === 'slow' ? 'Quarter speed' : motion === 'reduced' ? 'Instant' : 'As designed'}</span></div>
        <TimingSample profile={profile} motion={motion} />
        <div className={styles.source}>
          <div><h3>Duration reference</h3><ol>{resolved.chain.map((path) => <li key={path}><code><TokenPath path={path} /></code></li>)}</ol></div>
          <div><h3>Easing</h3><code><TokenPath path={profile.easing} /></code><p><code>cubic-bezier({resolved.curve.join(', ')})</code></p></div>
        </div>
        <div className={styles.contextControl}><div><h3>Motion across this site</h3><p>Slow stretches every duration. Reduced resolves each one to zero.</p></div><Segmented aria-label='Site motion' value={motion} onValueChange={controller.setMotion}><SegmentedOption className={styles.option} value='reduced'>Reduced</SegmentedOption><SegmentedOption className={styles.option} value='default'>Default</SegmentedOption><SegmentedOption className={styles.option} value='slow'>Slow</SegmentedOption></Segmented></div>
      </div>
    </section>
  )
}

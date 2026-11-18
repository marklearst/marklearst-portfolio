'use client'

import { ActivityIcon } from '@/components/ui/Icon'
import DisclosureSummary from '@/components/ui/DisclosureSummary'

import { useId, useMemo, useRef, useState, type PointerEvent } from 'react'
import {
  GLUCOSE_DEMO_END,
  GLUCOSE_DEMO_INTERVAL,
  GLUCOSE_DEMO_TRACE_START,
} from '@/lib/glucose-demo-model.mjs'
import type { GlucoseDemoData, GlucoseDemoScenario } from '@/lib/glucose-demo'
import styles from './GlucoseDemo.module.css'

interface GlucoseDemoProps {
  initial: GlucoseDemoData
  compact?: boolean
  className?: string
}

const scenarios: { id: GlucoseDemoScenario; label: string }[] = [
  { id: 'complete', label: 'Complete data' },
  { id: 'missing', label: 'Missing readings' },
  { id: 'empty', label: 'No data' },
]

const formatNumber = (value: number | null, digits = 0) => (
  value !== null && Number.isFinite(value) ? value.toFixed(digits) : '—'
)

const plot = { left: 34, top: 14, width: 514, height: 139 }
const traceDuration = GLUCOSE_DEMO_END - GLUCOSE_DEMO_TRACE_START
const traceIntervals = traceDuration / GLUCOSE_DEMO_INTERVAL
const xAt = (interval: number) => plot.left + (interval / traceIntervals) * plot.width
const yAt = (value: number, height: number) => plot.top + ((260 - value) / 220) * height
const inspectionTime = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC',
})

function GlucoseTrace({
  demo,
  compact,
  scenario,
  summary,
}: {
  demo: GlucoseDemoData
  compact: boolean
  scenario: GlucoseDemoScenario
  summary: string
}) {
  const id = useId()
  const [selectedInterval, setSelectedInterval] = useState(traceIntervals)
  const height = compact ? 96 : plot.height
  const valid = demo.report.valid
  const readingsByInterval = useMemo(() => new Map(demo.trace), [demo.trace])
  const paths = useMemo(() => {
    const segments: { interval: number; d: string }[] = []
    let previous = -Infinity
    for (const [interval, value] of demo.trace) {
      const point = `${xAt(interval).toFixed(2)},${yAt(value, height).toFixed(2)}`
      if (interval - previous > 1) segments.push({ interval, d: `M${point}` })
      else segments[segments.length - 1].d += ` L${point}`
      previous = interval
    }
    return segments
  }, [demo.trace, height])
  const timestamp = GLUCOSE_DEMO_TRACE_START + selectedInterval * GLUCOSE_DEMO_INTERVAL
  const selectedReading = readingsByInterval.get(selectedInterval)
  const selectedX = plot.left + (selectedInterval / traceIntervals) * plot.width
  const selectedTime = `${inspectionTime.format(timestamp)} UTC`
  const selectedValue = selectedReading !== undefined ? `${selectedReading} mg/dL` : 'No reading'

  function inspectPointer(event: PointerEvent<SVGSVGElement>) {
    if (!valid || event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (!bounds.width) return
    const x = ((event.clientX - bounds.left) / bounds.width) * 560
    const interval = Math.round(((x - plot.left) / plot.width) * traceIntervals)
    setSelectedInterval(Math.max(0, Math.min(traceIntervals, interval)))
  }

  return (
    <figure className={styles.chart}>
      <div className={styles.chartLabel}>
        <span>Last 24 hours</span>
        <span>May 14–15 · UTC</span>
      </div>
      <svg
        viewBox={`0 0 560 ${height + 45}`}
        role="img"
        data-inspect="Glucose trace"
        aria-labelledby={`${id}-chart-title ${id}-chart-desc`}
        onPointerMove={inspectPointer}
        className={demo.trace.length ? styles.inspectableChart : undefined}
      >
        <title id={`${id}-chart-title`}>Synthetic glucose trace</title>
        <desc id={`${id}-chart-desc`}>{summary}</desc>
        <rect className={styles.targetZone} x={plot.left} y={yAt(180, height)} width={plot.width} height={yAt(70, height) - yAt(180, height)} fillOpacity="0.045" />
        {[250, 180, 70].map((value) => (
          <g key={value}>
            <line className={styles.gridLine} x1={plot.left} x2={plot.left + plot.width} y1={yAt(value, height)} y2={yAt(value, height)} strokeDasharray={value === 250 ? undefined : '3 5'} />
            <text x="24" y={yAt(value, height) + 3} textAnchor="end">{value}</text>
          </g>
        ))}
        {[0, 6, 12, 18, 24].map((hour) => (
          <text key={hour} x={plot.left + (hour / 24) * plot.width} y={height + 39} textAnchor={hour === 0 ? 'start' : hour === 24 ? 'end' : 'middle'}>
            {String(hour === 24 ? 0 : hour).padStart(2, '0')}:00
          </text>
        ))}
        {paths.map((path) => (
          <path
            key={path.interval}
            d={path.d}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {scenario === 'missing' && <text className={styles.chartAnnotation} x={plot.left + (10 / 24) * plot.width} y={height / 2 + 18} textAnchor="middle">Missing readings</text>}
        {!valid && <text className={styles.chartAnnotation} x={plot.left + plot.width / 2} y={height / 2 + 18} textAnchor="middle">No readings in this sample</text>}
        {valid && (
          <g aria-hidden="true" pointerEvents="none">
            <line className={styles.chartCursor} x1={selectedX} x2={selectedX} y1={plot.top} y2={plot.top + height} strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
            {selectedReading !== undefined && <circle className={styles.selectedReading} cx={selectedX} cy={yAt(selectedReading, height)} r="4" strokeWidth="2" vectorEffect="non-scaling-stroke" />}
          </g>
        )}
      </svg>
      <div className={styles.inspection}>
        <div className={styles.inspectionHeading}>
          <label htmlFor={`${id}-trace-time`}>Inspect readings</label>
          <output htmlFor={`${id}-trace-time`} aria-live="off" className={styles.inspectionValue}>
            <span>{valid ? `${new Date(timestamp).toISOString().slice(11, 16)} UTC` : '—'}</span>
            <span>{valid ? selectedValue : 'No data'}</span>
          </output>
        </div>
        <input
          id={`${id}-trace-time`}
          type="range"
          min={0}
          max={traceIntervals}
          step={1}
          value={selectedInterval}
          disabled={!valid}
          aria-valuetext={valid ? `${selectedTime}, ${selectedValue}` : 'No data'}
          onChange={(event) => setSelectedInterval(event.currentTarget.valueAsNumber)}
        />
      </div>
      {!compact && <figcaption>{summary}</figcaption>}
    </figure>
  )
}

export default function GlucoseDemo({ initial, compact = false, className = '' }: GlucoseDemoProps) {
  const [{ scenario, demo }, setSample] = useState({ scenario: 'complete' as GlucoseDemoScenario, demo: initial })
  const [hasInteracted, setHasInteracted] = useState(false)
  const [pending, setPending] = useState<GlucoseDemoScenario | null>(null)
  const [loadError, setLoadError] = useState(false)
  const request = useRef(0)
  const root = useRef<HTMLElement>(null)

  async function selectScenario(next: GlucoseDemoScenario, trigger: HTMLButtonElement) {
    const ticket = ++request.current
    setLoadError(false)
    if (next === scenario) {
      setPending(null)
      return
    }
    setPending(next)
    try {
      const { getGlucoseDemoData } = await import('@/lib/glucose-demo')
      if (ticket !== request.current) return
      const nextDemo = getGlucoseDemoData(next)
      // A visitor may have reached the chart while its next sample loaded.
      // Keep that control mounted; if the result disables it, return to the choice that requested it.
      const focused = document.activeElement
      if (!nextDemo.report.valid && focused instanceof HTMLInputElement && focused.type === 'range' && root.current?.contains(focused)) {
        trigger.focus({ preventScroll: true })
      }
      setSample({ scenario: next, demo: nextDemo })
      setHasInteracted(true)
    } catch {
      if (ticket === request.current) setLoadError(true)
    } finally {
      if (ticket === request.current) setPending(null)
    }
  }
  const { report } = demo
  const valid = report.valid
  const coverage = valid ? report.dataSufficiency.activePercent : 0
  const range = report.timeInRange
  const bands = [
    { label: 'Below 70', value: range ? range.veryLow.percentage + range.low.percentage : 0, color: 'var(--component-glucose-low)' },
    { label: '70–180', value: range?.inRange.percentage ?? 0, color: 'var(--component-glucose-inRange)' },
    { label: 'Above 180', value: range ? range.high.percentage + range.veryHigh.percentage : 0, color: 'var(--component-glucose-high)' },
  ]
  const statusTitle = pending
    ? 'Loading sample…'
    : loadError
      ? 'Sample could not load. Choose it again to retry.'
      : !valid
        ? 'No readings to analyze'
        : report.dataSufficiency.meetsCGMStandard
          ? 'Enough data for a 14-day report'
          : 'Usable readings. Incomplete coverage.'
  const statusDetail = !valid
    ? 'Values stay empty until readings are available.'
    : scenario === 'missing'
      ? 'Eight hours are missing each day. The trace keeps those gaps.'
      : 'All expected readings are present in this synthetic sample.'
  const chartSummary = !valid
    ? 'No glucose readings are available. The chart is empty.'
    : `The final 24 hours of a 14-day synthetic sample, in mg/dL. ${demo.trace.length} readings are shown. ${scenario === 'missing' ? 'The line is interrupted from 06:00 to 14:00 UTC because readings are missing.' : 'The line contains no missing intervals.'} The latest reading is ${demo.latest} mg/dL.`

  return (
    <section
      ref={root}
      className={`${styles.demo} ${compact ? styles.compact : ''} ${className}`}
      aria-label="Interactive GlucoseIQ example"
      data-scenario={scenario}
      data-request={pending ? 'loading' : loadError ? 'failed' : undefined}
    >
      <div className={styles.heading}>
        <div className={styles.headingLabel}>
          <ActivityIcon size={20} />
          <span>{compact ? 'Glucose report' : 'GlucoseIQ / sample report'}</span>
        </div>
        <span className={styles.synthetic}>Synthetic data</span>
      </div>

      <div className={styles.controls} role="group" aria-label="Choose a sample data scenario" aria-busy={pending !== null}>
        {scenarios.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={scenario === option.id}
            onClick={event => void selectScenario(option.id, event.currentTarget)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div
        className={hasInteracted ? styles.changed : undefined}
        onAnimationEnd={event => {
          if (event.target === event.currentTarget) setHasInteracted(false)
        }}
      >
        <dl className={styles.metrics}>
          <div className={styles.primaryMetric}>
            <dt>Latest reading</dt>
            <dd>{formatNumber(demo.latest)}<span>mg/dL</span></dd>
          </div>
          <div>
            <dt>14-day mean</dt>
            <dd>{formatNumber(report.meanGlucose)}<span>mg/dL</span></dd>
          </div>
          <div>
            <dt>Variability <abbr title="Coefficient of variation">CV</abbr></dt>
            <dd>{formatNumber(report.cv, 1)}<span>%</span></dd>
          </div>
        </dl>

        <GlucoseTrace demo={demo} compact={compact} scenario={scenario} summary={chartSummary} />

        <div className={styles.distribution}>
          <div className={styles.distributionTitle}><span>Reading distribution</span><span>mg/dL</span></div>
          <div className={styles.rangeBar} aria-hidden="true">
            {bands.map((band) => <span key={band.label} style={{ width: `${band.value}%`, backgroundColor: band.color }} />)}
          </div>
          <dl className={styles.rangeLegend}>
            {bands.map((band) => (
              <div key={band.label}>
                <dt><i aria-hidden="true" style={{ backgroundColor: band.color }} />{band.label}</dt>
                <dd>{valid ? `${formatNumber(band.value, 1)}%` : '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className={styles.status} role="status" aria-live="polite" aria-atomic="true">
        <span className={styles.statusIcon} aria-hidden="true">{pending ? '…' : loadError ? '!' : !valid ? '○' : report.dataSufficiency.meetsCGMStandard ? '✓' : '!'}</span>
        <div>
          <p>{statusTitle}</p>
          {!compact && <p className={styles.statusDetail}>{statusDetail}</p>}
        </div>
        <span className={styles.coverage}>{coverage}%<span>coverage</span></span>
      </div>

      {!compact && (
        <details className={styles.report}>
          <DisclosureSummary>Inspect the computed report</DisclosureSummary>
          <div className={styles.reportBody}>
            <p>Output from <code>analyzeGlucose()</code> using a fixed seed and a 14-day UTC window. No patient data. Non-finite numbers appear as null in JSON. The optional percentile profile is disabled for this example.</p>
            <pre tabIndex={0} role="group" aria-label="Computed GlucoseIQ report in JSON"><code>{JSON.stringify(report, null, 2)}</code></pre>
          </div>
        </details>
      )}
    </section>
  )
}

'use client'

import { ActivityIcon } from '@/components/ui/Icon'
import DisclosureSummary from '@/components/ui/DisclosureSummary'

import { useId, useMemo, useState, type PointerEvent } from 'react'
import {
  getGlucoseDemoScenario,
  GLUCOSE_DEMO_END,
  GLUCOSE_DEMO_INTERVAL,
  GLUCOSE_DEMO_TRACE_START,
  type GlucoseDemoScenario,
} from '@/lib/glucose-demo'
import styles from './GlucoseDemo.module.css'

interface GlucoseDemoProps {
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
const xAt = (timestamp: string) => (
  plot.left + ((Date.parse(timestamp) - GLUCOSE_DEMO_TRACE_START) / traceDuration) * plot.width
)
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
  demo: ReturnType<typeof getGlucoseDemoScenario>
  compact: boolean
  scenario: GlucoseDemoScenario
  summary: string
}) {
  const id = useId()
  const [selectedInterval, setSelectedInterval] = useState(traceIntervals)
  const height = compact ? 96 : plot.height
  const valid = demo.report.valid
  const readingsByTime = useMemo(
    () => new Map(demo.traceReadings.map((reading) => [Date.parse(reading.timestamp), reading])),
    [demo.traceReadings],
  )
  const paths = useMemo(() => demo.traceSegments.map((segment) => ({
    timestamp: segment[0].timestamp,
    d: segment.map((reading, index) => `${index === 0 ? 'M' : 'L'}${xAt(reading.timestamp).toFixed(2)},${yAt(reading.value, height).toFixed(2)}`).join(' '),
  })), [demo.traceSegments, height])
  const timestamp = GLUCOSE_DEMO_TRACE_START + selectedInterval * GLUCOSE_DEMO_INTERVAL
  const selectedReading = readingsByTime.get(timestamp)
  const selectedX = plot.left + (selectedInterval / traceIntervals) * plot.width
  const selectedTime = `${inspectionTime.format(timestamp)} UTC`
  const selectedValue = selectedReading ? `${selectedReading.value} mg/dL` : 'No reading'

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
        aria-labelledby={`${id}-chart-title ${id}-chart-desc`}
        onPointerMove={inspectPointer}
        className={valid ? styles.inspectableChart : undefined}
      >
        <title id={`${id}-chart-title`}>Synthetic glucose trace</title>
        <desc id={`${id}-chart-desc`}>{summary}</desc>
        <rect x={plot.left} y={yAt(180, height)} width={plot.width} height={yAt(70, height) - yAt(180, height)} fill="#a9dc76" fillOpacity="0.045" />
        {[250, 180, 70].map((value) => (
          <g key={value}>
            <line x1={plot.left} x2={plot.left + plot.width} y1={yAt(value, height)} y2={yAt(value, height)} stroke="#ffffff" strokeOpacity="0.12" strokeDasharray={value === 250 ? undefined : '3 5'} />
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
            key={path.timestamp}
            d={path.d}
            fill="none"
            stroke="#78dce8"
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
            <line x1={selectedX} x2={selectedX} y1={plot.top} y2={plot.top + height} stroke="#f3f5f4" strokeOpacity="0.35" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
            {selectedReading && <circle cx={selectedX} cy={yAt(selectedReading.value, height)} r="4" fill="#78dce8" stroke="#131719" strokeWidth="2" vectorEffect="non-scaling-stroke" />}
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

export function GlucoseDemo({ compact = false, className = '' }: GlucoseDemoProps) {
  const [scenario, setScenario] = useState<GlucoseDemoScenario>('complete')
  const [hasInteracted, setHasInteracted] = useState(false)
  const demo = useMemo(() => getGlucoseDemoScenario(scenario), [scenario])
  const { report } = demo
  const valid = report.valid
  const coverage = valid ? report.dataSufficiency.activePercent : 0
  const range = report.timeInRange
  const bands = [
    { label: 'Below 70', value: range ? range.veryLow.percentage + range.low.percentage : 0, color: '#ff6188' },
    { label: '70–180', value: range?.inRange.percentage ?? 0, color: '#a9dc76' },
    { label: 'Above 180', value: range ? range.high.percentage + range.veryHigh.percentage : 0, color: '#ffd866' },
  ]
  const statusTitle = !valid
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
    : `The final 24 hours of a 14-day synthetic sample, in mg/dL. ${demo.traceReadings.length} readings are shown. ${scenario === 'missing' ? 'The line is interrupted from 06:00 to 14:00 UTC because readings are missing.' : 'The line contains no missing intervals.'} The latest reading is ${demo.latest} mg/dL.`

  return (
    <section
      className={`${styles.demo} ${compact ? styles.compact : ''} ${className}`}
      aria-label="Interactive GlucoseIQ example"
      data-scenario={scenario}
    >
      <div className={styles.heading}>
        <div className={styles.headingLabel}>
          <ActivityIcon size={20} />
          <span>{compact ? 'Glucose report' : 'GlucoseIQ / sample report'}</span>
        </div>
        <span className={styles.synthetic}>Synthetic data</span>
      </div>

      <div className={styles.controls} role="group" aria-label="Choose a sample data scenario">
        {scenarios.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={scenario === option.id}
            onClick={() => {
              if (scenario === option.id) return
              setHasInteracted(true)
              setScenario(option.id)
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div key={scenario} className={hasInteracted ? styles.changed : undefined}>
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
        <span className={styles.statusIcon} aria-hidden="true">{!valid ? '○' : report.dataSufficiency.meetsCGMStandard ? '✓' : '!'}</span>
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
            <pre tabIndex={0} aria-label="Computed GlucoseIQ report in JSON"><code>{JSON.stringify(report, null, 2)}</code></pre>
          </div>
        </details>
      )}
    </section>
  )
}

export default GlucoseDemo

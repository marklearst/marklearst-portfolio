import { analyzeGlucose, type GlucoseReading } from '@glucoseiq/core'
import { generateCGMSeries } from '@glucoseiq/testing'

export type GlucoseDemoScenario = 'complete' | 'missing' | 'empty'

export const GLUCOSE_DEMO_START = Date.parse('2026-05-01T00:00:00.000Z')
export const GLUCOSE_DEMO_END = GLUCOSE_DEMO_START + 14 * 86_400_000
export const GLUCOSE_DEMO_INTERVAL = 5 * 60_000
export const GLUCOSE_DEMO_TRACE_START = GLUCOSE_DEMO_END - 86_400_000

// Include both boundaries of an exact 14-day window. The generator produces
// end-exclusive days; stopping at its 14th day would be five minutes short.
const completeReadings = generateCGMSeries({
  days: 15,
  seed: 7,
  start: new Date(GLUCOSE_DEMO_START).toISOString(),
  intervalMin: 5,
  basal: 112,
  mealAmplitude: 85,
  noise: 8,
  nocturnalHypoDays: [3, 8, 13],
}).filter((reading) => Date.parse(reading.timestamp) <= GLUCOSE_DEMO_END)

/** Preserve real time gaps rather than drawing a line across absent readings. */
export function splitGlucoseTrace(readings: readonly GlucoseReading[]) {
  const segments: GlucoseReading[][] = []
  for (const reading of readings) {
    const segment = segments.at(-1)
    const previous = segment?.at(-1)
    if (
      !previous ||
      Date.parse(reading.timestamp) - Date.parse(previous.timestamp) > GLUCOSE_DEMO_INTERVAL
    ) {
      segments.push([reading])
    } else {
      segment!.push(reading)
    }
  }
  return segments
}

export function getGlucoseDemoScenario(scenario: GlucoseDemoScenario) {
  const readings = scenario === 'empty'
    ? []
    : scenario === 'missing'
      ? completeReadings.filter((reading) => {
        const hour = new Date(reading.timestamp).getUTCHours()
        return hour < 6 || hour >= 14
      })
      : completeReadings

  const report = analyzeGlucose(readings, { timeZone: 'UTC', includeProfile: false })
  const traceReadings = readings.filter(
    (reading) => Date.parse(reading.timestamp) >= GLUCOSE_DEMO_TRACE_START,
  )

  return {
    readings,
    report,
    traceReadings,
    traceSegments: splitGlucoseTrace(traceReadings),
    latest: readings.at(-1)?.value ?? null,
  }
}

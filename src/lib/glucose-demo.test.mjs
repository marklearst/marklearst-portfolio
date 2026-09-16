import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getGlucoseDemoScenario,
  GLUCOSE_DEMO_INTERVAL,
  splitGlucoseTrace,
} from './glucose-demo.ts'

test('complete sample spans exactly 14 days and passes core sufficiency', () => {
  const demo = getGlucoseDemoScenario('complete')
  assert.equal(demo.report.valid, true)
  assert.equal(demo.report.dataSufficiency.daysOfData, 14)
  assert.equal(demo.report.dataSufficiency.activePercent, 100)
  assert.equal(demo.report.dataSufficiency.meetsCGMStandard, true)
  assert.equal(demo.readings.length, 4033)
  assert.deepEqual(demo.report, getGlucoseDemoScenario('complete').report)
})

test('missing sample remains valid but fails sufficiency and preserves trace gaps', () => {
  const demo = getGlucoseDemoScenario('missing')
  assert.equal(demo.report.valid, true)
  assert.equal(demo.report.dataSufficiency.daysOfData, 14)
  assert.ok(demo.report.dataSufficiency.activePercent < 70)
  assert.equal(demo.report.dataSufficiency.meetsCGMStandard, false)
  assert.equal(demo.traceSegments.length, 2)
  for (const segment of demo.traceSegments) {
    for (let i = 1; i < segment.length; i++) {
      assert.equal(Date.parse(segment[i].timestamp) - Date.parse(segment[i - 1].timestamp), GLUCOSE_DEMO_INTERVAL)
    }
  }
  assert.equal(new Date(demo.traceSegments[0].at(-1).timestamp).getUTCHours(), 5)
  assert.equal(new Date(demo.traceSegments[1][0].timestamp).getUTCHours(), 14)
})

test('empty sample has no trace and no fabricated zero-valued metrics', () => {
  const demo = getGlucoseDemoScenario('empty')
  assert.equal(demo.report.valid, false)
  assert.equal(demo.latest, null)
  assert.ok(Number.isNaN(demo.report.meanGlucose))
  assert.ok(Number.isNaN(demo.report.cv))
  assert.equal(demo.report.timeInRange, null)
  assert.deepEqual(demo.traceSegments, [])
})

test('trace breaks at even one absent sample', () => {
  const { traceReadings } = getGlucoseDemoScenario('complete')
  const segments = splitGlucoseTrace([traceReadings[0], traceReadings[2]])
  assert.equal(segments.length, 2)
})

import assert from 'node:assert/strict'
import test from 'node:test'
import {
  A11Y_DEMO_SCENARIOS,
  assessNormalTextContrast,
  buildA11yDemoScenario,
  calculateDemoContrast,
  deriveRecordReadiness,
} from './a11y-demo.ts'

const ready = {
  failures: 0, reviews: 0, staleSignoffs: 0, partialEvidence: false,
  missingAuditTypes: 0, remainingChecks: 0, remainingSignoffs: 0,
  checklistComplete: true, signoffsComplete: true,
  passingContrast: true, contrastFails: false,
}

test('contrast comes from sRGB colors rather than saved fixture ratios', () => {
  assert.ok(Math.abs(calculateDemoContrast('#92400E', '#FEF3C7') - 6.367237217) < 0.000001)
  assert.ok(Math.abs(calculateDemoContrast('#1D1012', '#000000') - 1.135093398) < 0.000001)
  assert.equal(calculateDemoContrast('#000000', '#ffffff'), 21)
  assert.equal(calculateDemoContrast('#ffffff', '#ffffff'), 1)
  assert.equal(calculateDemoContrast('#FEF3C7', '#92400E'), calculateDemoContrast('#92400E', '#FEF3C7'))
  assert.throws(() => calculateDemoContrast('red', '#ffffff'), /Unsupported sRGB/)
})

test('normal text contrast honors inclusive 3, 4.5, and 7 boundaries', () => {
  assert.equal(assessNormalTextContrast(2.999).grade, 'Failed')
  assert.equal(assessNormalTextContrast(3).grade, 'Large text only')
  assert.equal(assessNormalTextContrast(4.499).passesAA, false)
  assert.equal(assessNormalTextContrast(4.5).grade, 'AA')
  assert.equal(assessNormalTextContrast(6.999).grade, 'AA')
  assert.equal(assessNormalTextContrast(7).grade, 'AAA')
})

test('blocking failure takes precedence over partial evidence and stale sign-off', () => {
  const result = deriveRecordReadiness({ ...ready, failures: 2, contrastFails: true, passingContrast: false, partialEvidence: true, staleSignoffs: 1 })
  assert.equal(result.status, 'action-required')
  assert.equal(result.detail, '3 blocking issues need a fix before handoff.')
})

test('partial and missing evidence cannot become ready even with completed checks', () => {
  assert.equal(deriveRecordReadiness({ ...ready, partialEvidence: true }).status, 'review-remaining')
  assert.match(deriveRecordReadiness({ ...ready, partialEvidence: true, missingAuditTypes: 1 }).detail, /Selection-only or capped/)
  assert.match(deriveRecordReadiness({ ...ready, missingAuditTypes: 1, staleSignoffs: 1 }).detail, /1 audit type is still missing/)
  assert.equal(deriveRecordReadiness({ ...ready, staleSignoffs: 1 }).status, 'review-remaining')
  assert.equal(deriveRecordReadiness({ ...ready, passingContrast: false }).status, 'in-progress')
})

test('four excerpted scenarios preserve their source readiness and evidence differences', () => {
  const demos = Object.fromEntries(A11Y_DEMO_SCENARIOS.map((scenario) => [scenario.id, buildA11yDemoScenario(scenario)]))
  assert.equal(demos['ready-for-handoff'].record.status, 'ready')
  assert.equal(demos['stale-signoff'].record.status, 'review-remaining')
  assert.equal(demos['partial-node-scan'].record.status, 'review-remaining')
  assert.equal(demos['contrast-failure-120'].record.status, 'action-required')
  assert.equal(demos['stale-signoff'].scenario.widget.staleSignoffs, 1)
  assert.equal(demos['partial-node-scan'].partialEvidence, true)
  assert.equal(demos['partial-node-scan'].scenario.evidence.find((audit) => audit.kind === 'tokens').checked, 800)
  assert.equal(demos['contrast-failure-120'].recordedKinds, 0)
  assert.equal(demos['contrast-failure-120'].contrastRatio.toFixed(2), '1.14')
  assert.equal(demos['ready-for-handoff'].contrastRatio.toFixed(2), '6.37')
})

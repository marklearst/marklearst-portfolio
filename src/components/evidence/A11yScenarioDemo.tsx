'use client'

import { useId, useState } from 'react'
import {
  A11Y_DEMO_SAMPLE_DATE,
  A11Y_DEMO_SCENARIOS,
  buildA11yDemoScenario,
  type A11yDemoScenarioId,
} from '@/lib/a11y-demo'
import styles from './A11yScenarioDemo.module.css'

const demos = A11Y_DEMO_SCENARIOS.map(buildA11yDemoScenario)
const auditKinds = [
  { kind: 'touch', label: 'Touch targets', unit: 'targets' },
  { kind: 'text', label: 'Text readability', unit: 'layers' },
  { kind: 'tokens', label: 'Token contrast', unit: 'pairs' },
] as const

interface A11yScenarioDemoProps {
  className?: string
}

export function A11yScenarioDemo({ className = '' }: A11yScenarioDemoProps) {
  const id = useId()
  const [selectedId, setSelectedId] = useState<A11yDemoScenarioId>('ready-for-handoff')
  const selected = demos.find((demo) => demo.scenario.id === selectedId)!

  return (
    <section className={`${styles.demo} ${className}`} aria-label="a11y Companion readiness scenarios">
      <header className={styles.header}>
        <span className={styles.product}>a11y Companion</span>
        <span className={styles.mode}>Browser demo</span>
      </header>

      <div className={styles.scenarios} role="group" aria-label="Choose a review scenario">
        {demos.map(({ scenario }) => (
          <button
            key={scenario.id}
            type="button"
            aria-pressed={selectedId === scenario.id}
            aria-controls={`${id}-evidence`}
            onClick={() => setSelectedId(scenario.id)}
          >
            {scenario.label}
          </button>
        ))}
      </div>

      <div id={`${id}-evidence`} className={styles.panels}>
        {demos.map(({ scenario, contrast, contrastRatio, recordedKinds, partialEvidence, record }) => {
          const active = scenario.id === selectedId
          const { widget } = scenario
          return (
            <div
              key={scenario.id}
              className={styles.panel}
              data-active={active}
              data-status={record.status}
              aria-hidden={!active}
              inert={!active}
            >
              <div className={styles.inspection}>
                <div className={styles.sectionHeading}>
                  <span>Page evidence</span>
                  <span>{recordedKinds} / 3 audits</span>
                </div>
                <dl className={styles.evidence}>
                  {auditKinds.map(({ kind, label, unit }) => {
                    const audit = scenario.evidence.find((entry) => entry.kind === kind)
                    return (
                      <div key={kind} className={styles.audit} data-partial={audit?.state === 'partial'}>
                        <dt>{label}</dt>
                        <dd>
                          <span>{audit ? `${audit.checked} ${unit}` : 'Not recorded'}</span>
                          <span className={styles.auditScope}>{audit ? (audit.state === 'partial' ? 'Partial scan' : 'Page scan') : 'No evidence'}</span>
                        </dd>
                      </div>
                    )
                  })}
                </dl>

                <div className={styles.contrast}>
                  <div
                    className={styles.specimen}
                    aria-hidden="true"
                    style={{ color: widget.contrast.text, backgroundColor: widget.contrast.background }}
                  >Aa</div>
                  <div className={styles.contrastResult}>
                    <span className={styles.contrastLabel}>Selected text contrast</span>
                    <strong>{contrastRatio.toFixed(2)}<span>:1</span></strong>
                    <span className={styles.contrastVerdict}>{contrast.passesAA ? 'Passes AA normal text' : 'Fails AA normal text'}</span>
                  </div>
                  <dl className={styles.colors}>
                    <div><dt>Text</dt><dd>{widget.contrast.text}</dd></div>
                    <div><dt>Background</dt><dd>{widget.contrast.background}</dd></div>
                  </dl>
                </div>
              </div>

              <div className={styles.record}>
                <div className={styles.recordHeading}>
                  <span>Canvas Record</span>
                  <span className={styles.recordMarker} aria-hidden="true" />
                </div>
                <p className={styles.readiness}>{record.label}</p>
                <dl className={styles.recordFields}>
                  <div>
                    <dt>Checklist</dt>
                    <dd>{widget.completedChecks}<span> / {widget.totalChecks}</span></dd>
                  </div>
                  <div>
                    <dt>Sign-offs</dt>
                    <dd>{widget.signedSections}<span> / {widget.totalSections}</span>{widget.staleSignoffs > 0 && <span className={styles.stale}> · {widget.staleSignoffs} stale</span>}</dd>
                  </div>
                  <div>
                    <dt>Evidence</dt>
                    <dd>{partialEvidence ? 'Partial' : recordedKinds === 3 ? 'Complete' : 'Not recorded'}</dd>
                  </div>
                </dl>
                <p className={styles.explanation}>{scenario.explanation}</p>
                <p className={styles.nextStep}>{record.detail}</p>
              </div>
            </div>
          )
        })}
      </div>

      <p className={styles.liveStatus} role="status" aria-live="polite" aria-atomic="true">
        {selected.scenario.label}: {selected.record.label}. {selected.scenario.explanation}
      </p>
      <footer className={styles.footer}>
        <p>Same readiness rules as the widget, running here with sample data. Review evidence, not a compliance certification.</p>
        <time dateTime={A11Y_DEMO_SAMPLE_DATE}>Sample · 13 Jul 2026</time>
      </footer>
    </section>
  )
}

export default A11yScenarioDemo

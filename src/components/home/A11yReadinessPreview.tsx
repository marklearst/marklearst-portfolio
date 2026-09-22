'use client'

import { useId } from 'react'
import { A11Y_DEMO_SCENARIOS, buildA11yDemoScenario, type A11yDemoScenarioId } from '@/lib/a11y-demo'
import { useAnimatedSelection } from '@/hooks/useAnimatedSelection'
import { CircleCheckIcon, CircleXIcon, ArrowRightIcon } from '@/components/ui/Icon'
import styles from './A11yReadinessPreview.module.css'

const examples = A11Y_DEMO_SCENARIOS
  .filter(scenario => scenario.id !== 'partial-node-scan')
  .map(buildA11yDemoScenario)

export default function A11yReadinessPreview() {
  const id = useId()
  const { value, motion, select } = useAnimatedSelection<A11yDemoScenarioId>('ready-for-handoff')
  const selected = examples.find(example => example.scenario.id === value)!

  return (
    <section className={styles.demo} aria-label='a11y Companion readiness example'>
      <header className={styles.header}><span>a11y Companion</span><span>Browser demo</span></header>
      <p className={styles.intro}>A completed checklist is only part of the evidence.</p>
      <div className={styles.choices} role='group' aria-label='Choose a readiness scenario'>
        {examples.map(({ scenario }) => (
          <button key={scenario.id} type='button' aria-pressed={value === scenario.id}
            aria-controls={`${id}-result`} onClick={event => select(scenario.id, event.detail > 0)}>
            {scenario.label}
          </button>
        ))}
      </div>
      <div id={`${id}-result`} className={styles.panels} data-motion={motion}>
        {examples.map(({ scenario, record, contrastRatio, contrast }) => {
          const active = value === scenario.id
          return <div key={scenario.id} className={styles.panel} data-active={active} inert={!active} aria-hidden={!active}>
            <dl className={styles.evidence}>
              <div><dt>Checklist</dt><dd>{scenario.widget.completedChecks} / {scenario.widget.totalChecks}</dd></div>
              <div><dt>Sign-offs</dt><dd>{scenario.widget.signedSections} / {scenario.widget.totalSections}{scenario.widget.staleSignoffs > 0 && <span>{scenario.widget.staleSignoffs} stale</span>}</dd></div>
              <div><dt>Text contrast</dt><dd>{contrastRatio.toFixed(2)}:1 <span>{contrast.passesAA ? 'AA' : 'Fails AA'}</span></dd></div>
            </dl>
            <div className={styles.result} data-status={record.status}>
              <h3>{record.status === 'ready' ? <CircleCheckIcon /> : record.status === 'action-required' ? <CircleXIcon /> : <ArrowRightIcon />}{record.label}</h3>
              <p>{scenario.explanation}</p>
            </div>
          </div>
        })}
      </div>
      <p key={value} className={styles.status} role='status' aria-atomic='true'>{selected.scenario.label}: {selected.record.label}. {selected.scenario.explanation}</p>
      <footer className={styles.footer}>The widget’s readiness rules, running here with sample data.</footer>
    </section>
  )
}

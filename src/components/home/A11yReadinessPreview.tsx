import { A11Y_DEMO_SCENARIOS, buildA11yDemoScenario } from '@/lib/a11y-demo'
import { CircleCheckIcon, CircleXIcon, ArrowRightIcon } from '@/components/ui/Icon'
import { ReadinessSelector, ReadinessPanel } from './ReadinessSelector'
import styles from './A11yReadinessPreview.module.css'

const examples = A11Y_DEMO_SCENARIOS
  .filter(scenario => scenario.id !== 'partial-node-scan')
  .map(buildA11yDemoScenario)

export default function A11yReadinessPreview() {
  return (
    <section className={styles.demo} aria-label='a11y Companion readiness example'>
      <header className={styles.header}><span>a11y Companion</span><span>Browser demo</span></header>
      <p className={styles.intro}>A completed checklist is only part of the evidence.</p>
      <ReadinessSelector choices={examples.map(({ scenario, record }) => ({
        id: scenario.id,
        label: scenario.label,
        announcement: `${scenario.label}: ${record.label}. ${scenario.explanation}`,
      }))}>
        {examples.map(({ scenario, record, contrastRatio, contrast }) => (
          <ReadinessPanel key={scenario.id} scenario={scenario.id}>
            <dl className={styles.evidence}>
              <div><dt>Checklist</dt><dd>{scenario.widget.completedChecks} / {scenario.widget.totalChecks}</dd></div>
              <div><dt>Sign-offs</dt><dd>{scenario.widget.signedSections} / {scenario.widget.totalSections}{scenario.widget.staleSignoffs > 0 && <span>{scenario.widget.staleSignoffs} stale</span>}</dd></div>
              <div><dt>Text contrast</dt><dd>{contrastRatio.toFixed(2)}:1 <span>{contrast.passesAA ? 'AA' : 'Fails AA'}</span></dd></div>
            </dl>
            <div className={styles.result} data-status={record.status}>
              <h3>{record.status === 'ready' ? <CircleCheckIcon /> : record.status === 'action-required' ? <CircleXIcon /> : <ArrowRightIcon />}{record.label}</h3>
              <p>{scenario.explanation}</p>
            </div>
          </ReadinessPanel>
        ))}
      </ReadinessSelector>
      <footer className={styles.footer}>The widget’s readiness rules, applied to sample data.</footer>
    </section>
  )
}

'use client'

import { createContext, useContext, useId, type ReactNode } from 'react'
import { useAnimatedSelection } from '@/hooks/useAnimatedSelection'
import type { A11yDemoScenarioId } from '@/lib/a11y-demo'
import styles from './A11yReadinessPreview.module.css'

interface Choice {
  id: A11yDemoScenarioId
  label: string
  announcement: string
}

const SelectedScenario = createContext<A11yDemoScenarioId | null>(null)

/** The panels arrive as server content; only selection and its feedback run here. */
export function ReadinessSelector({ choices, children }: { choices: readonly Choice[]; children: ReactNode }) {
  const id = useId()
  const { value, motion, select } = useAnimatedSelection<A11yDemoScenarioId>('ready-for-handoff')
  const selected = choices.find(choice => choice.id === value)!

  return (
    <SelectedScenario value={value}>
      <div className={styles.choices} role='group' aria-label='Choose a readiness scenario'>
        {choices.map(choice => (
          <button key={choice.id} type='button' aria-pressed={value === choice.id}
            aria-controls={`${id}-result`} onClick={event => select(choice.id, event.detail > 0)}>
            {choice.label}
          </button>
        ))}
      </div>
      <div id={`${id}-result`} className={styles.panels} data-motion={motion}>{children}</div>
      <p className={styles.status} role='status' aria-atomic='true'>{selected.announcement}</p>
    </SelectedScenario>
  )
}

export function ReadinessPanel({ scenario, children }: { scenario: A11yDemoScenarioId; children: ReactNode }) {
  const selected = useContext(SelectedScenario)
  if (selected === null) throw new Error('ReadinessPanel requires ReadinessSelector')
  const active = selected === scenario
  return <div className={styles.panel} data-active={active} inert={!active} aria-hidden={!active}>{children}</div>
}

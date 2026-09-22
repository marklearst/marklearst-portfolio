'use client'

import { useId } from 'react'
import { useAnimatedSelection } from '@/hooks/useAnimatedSelection'
import { PRIMITREE_DEMO } from '@/lib/primitree-demo'
import { getPrimitreeCssExcerpt } from '@/lib/primitree-demo-display'
import { ArrowRightIcon, CircleCheckIcon, CircleXIcon } from '@/components/ui/Icon'
import DisclosureSummary from '@/components/ui/DisclosureSummary'
import styles from './PrimitreeGuardrailDemo.module.css'

type ScenarioId = (typeof PRIMITREE_DEMO.scenarios)[number]['id']
const labels: Record<ScenarioId, string> = { literal: 'Literal color', reference: 'Base reference' }
const layers = PRIMITREE_DEMO.config.sources.brand.architecture.layers

function TokenTrace({ scenario }: { scenario: (typeof PRIMITREE_DEMO.scenarios)[number] }) {
  const value = scenario.tokens.semantic.action.$value
  const reference = typeof value === 'string' ? value.slice(1, -1) : null
  const color = typeof value === 'string' ? scenario.tokens.color.cyan.$value.hex : value.hex

  return (
    <figure className={styles.trace} data-reference={Boolean(reference)}>
      <svg className={styles.traceLines} width='32' height='148' viewBox='0 0 32 148' fill='none' aria-hidden='true'>
        <path className={styles.traceConnector} pathLength={1}
          d={reference
            ? 'M28 14H24Q16 14 16 22V58Q16 66 24 66H28M16 66V110Q16 118 24 118H28'
            : 'M28 14H12Q4 14 4 22V110Q4 118 12 118H28'} />
        {reference && <path d='m24 62 4 4-4 4' />}
        <path d='m24 114 4 4-4 4' />
      </svg>
      <dl className={styles.traceNodes}>
        <div><dt className={styles.liveStatus}>Semantic token</dt><dd><code>semantic.action</code></dd></div>
        <div className={styles.traceBase}><dt>{reference ? 'Referenced' : 'Not referenced'}</dt><dd><code>{reference ?? 'color.cyan'}</code></dd></div>
        <div><dt className={styles.liveStatus}>Color value</dt><dd className={styles.traceColor}><span aria-hidden='true' style={{ backgroundColor: color }} /><code>{color}</code></dd></div>
      </dl>
      <figcaption className={styles.liveStatus}>
        {reference ? `semantic.action references ${reference}, which resolves to ${color}.` : `semantic.action contains ${color} directly, without referencing color.cyan.`}
      </figcaption>
    </figure>
  )
}

interface PrimitreeGuardrailDemoProps {
  className?: string
  compact?: boolean
}

export function PrimitreeGuardrailDemo({ className = '', compact = false }: PrimitreeGuardrailDemoProps) {
  const id = useId()
  const { value: selectedId, motion, select } = useAnimatedSelection<ScenarioId>('literal')
  const selected = PRIMITREE_DEMO.scenarios.find((scenario) => scenario.id === selectedId)!
  const failed = selected.build.exitCode !== 0

  return (
    <section className={`${styles.demo} ${compact ? styles.compact : ''} ${className}`} aria-label="Primitree architecture rule example">
      <header className={styles.header}>
        <span className={styles.product}>Primitree</span>
        <span className={styles.mode}>{compact ? `CLI ${PRIMITREE_DEMO.provenance.version} · recorded` : 'Recorded CLI runs'}</span>
      </header>

      <div className={styles.rule}>
        <div>
          <span className={styles.ruleLabel}>Layer rule</span>
          <p><code>{layers[1].id}</code><ArrowRightIcon size={16} /><code>{layers[0].id}</code></p>
        </div>
        <p>Semantic tokens must reference the base layer.</p>
      </div>

      <div className={styles.controls} role="group" aria-label="Choose the semantic token value">
        {PRIMITREE_DEMO.scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            aria-pressed={selectedId === scenario.id}
            aria-controls={`${id}-result`}
            onClick={event => select(scenario.id, event.detail > 0)}
          >
            {labels[scenario.id]}
          </button>
        ))}
      </div>

      <div className={styles.panels} id={`${id}-result`} data-motion={motion}>
        {PRIMITREE_DEMO.scenarios.map((scenario) => {
          const active = scenario.id === selectedId
          const blocked = scenario.build.exitCode !== 0
          const finding = scenario.checkReport.findings[0]
          const cssExcerpt = getPrimitreeCssExcerpt(scenario.css)
          const declaration = compact
            ? cssExcerpt?.split('\n').find((line) => line.trim().startsWith('--semantic-action:'))?.trim()
            : undefined
          const visibleCss = declaration?.replace(': ', ':\n  ') ?? cssExcerpt
          return (
            <div className={styles.panel} key={scenario.id} data-active={active} data-blocked={blocked} inert={!active} aria-hidden={!active}>
              <div className={styles.source}>
                <div className={styles.sourceTitle}><span>Source token</span><span>tokens.json</span></div>
                {!compact && <>
                  <code className={styles.tokenPath}>semantic.action</code>
                  <pre className={styles.tokenCode} tabIndex={0} aria-label="Semantic action token input"><code>{JSON.stringify(scenario.tokens.semantic.action, null, 2)}</code></pre>
                </>}
                <TokenTrace scenario={scenario} />
              </div>

              <div className={styles.result}>
                {!compact && <div className={styles.command}><code>primitree build</code><span>exit {scenario.build.exitCode}</span></div>}
                <div className={styles.resultHeading}>
                  {blocked ? <CircleXIcon size={20} /> : <CircleCheckIcon size={20} />}
                  <span key={blocked ? 'stopped' : 'passed'}>{blocked ? 'Build stopped' : 'Build passed'}</span>
                  {compact && <span className={styles.exitCode}>exit {scenario.build.exitCode}</span>}
                </div>
                {blocked && finding ? (
                  <>
                    <div className={styles.finding}>
                      <span>{finding.ruleId}</span>
                      <code>{finding.path.join('.')}</code>
                      <p>{finding.message}</p>
                    </div>
                    {!compact && <p className={styles.consequence}>No generated files were written.</p>}
                  </>
                ) : (
                  <>
                    <div className={styles.outputTitle}>{compact ? 'Generated CSS excerpt' : 'generated/css/tokens.css'}</div>
                    <pre className={styles.cssOutput} tabIndex={0} aria-label="Generated CSS excerpt"><code>{visibleCss}</code></pre>
                    {!compact && <p className={styles.consequence}>The emitted CSS keeps the semantic reference.</p>}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <details className={styles.inspect}>
        <DisclosureSummary>{compact ? 'Inspect source and full output' : 'Inspect configuration and full output'}</DisclosureSummary>
        <div className={styles.inspectBody}>
          <p>The two runs use the same configuration. Only <code>semantic.action.$value</code> changes.</p>
          <div className={styles.inspectFile}>
            <span>primitree.config.ts</span>
            <pre tabIndex={0} aria-label="Full Primitree configuration"><code>{PRIMITREE_DEMO.configSource}</code></pre>
          </div>
          <div className={styles.inspectFile}>
            <span>tokens.json · {labels[selectedId]}</span>
            <pre tabIndex={0} aria-label="Full token input"><code>{selected.tokensSource}</code></pre>
          </div>
          <div className={styles.inspectFile}>
            <span>primitree check --format json · exit {selected.check.exitCode}</span>
            <pre tabIndex={0} aria-label="Recorded Primitree check result"><code>{JSON.stringify(selected.checkReport, null, 2)}</code></pre>
          </div>
          <div className={styles.inspectFile}>
            <span>primitree build · exit {selected.build.exitCode}</span>
            <pre tabIndex={0} aria-label="Recorded Primitree build output"><code>{selected.build.stdout || selected.build.stderr}</code></pre>
          </div>
          {selected.css && <div className={styles.inspectFile}><span>generated/css/tokens.css · complete file</span><pre tabIndex={0} aria-label="Complete generated CSS"><code>{selected.css}</code></pre></div>}
        </div>
      </details>

      <p key={selectedId} className={styles.liveStatus} role="status" aria-live="polite" aria-atomic="true">
        {labels[selectedId]}: {failed ? 'Build stopped. PT1003: semantic.action must use a reference. No generated files were written.' : 'Build passed. Generated CSS preserves the reference to color.cyan.'}
      </p>
      <footer className={styles.footer}>
        <p>{compact ? 'Two recorded CLI runs; the browser only switches results.' : 'Output recorded from the real CLI. The browser switches between those two results.'}</p>
        {!compact && <span>Primitree {PRIMITREE_DEMO.provenance.version}</span>}
      </footer>
    </section>
  )
}

export default PrimitreeGuardrailDemo

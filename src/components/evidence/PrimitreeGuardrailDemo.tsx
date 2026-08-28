'use client'

import { useId, useState } from 'react'
import { PRIMITREE_DEMO } from '@/lib/primitree-demo'
import { getPrimitreeCssExcerpt } from '@/lib/primitree-demo-display'
import { ArrowRightIcon, ChevronDownIcon, CircleCheckIcon, CircleXIcon } from '@/components/ui/Icon'
import styles from './PrimitreeGuardrailDemo.module.css'

type ScenarioId = (typeof PRIMITREE_DEMO.scenarios)[number]['id']
const labels: Record<ScenarioId, string> = { literal: 'Literal color', reference: 'Base reference' }
const literal = PRIMITREE_DEMO.scenarios[0]
const sourceColor = literal.tokens.color.cyan.$value.hex
const layers = PRIMITREE_DEMO.config.sources.brand.architecture.layers

interface PrimitreeGuardrailDemoProps {
  className?: string
  compact?: boolean
}

export function PrimitreeGuardrailDemo({ className = '', compact = false }: PrimitreeGuardrailDemoProps) {
  const id = useId()
  const [selectedId, setSelectedId] = useState<ScenarioId>('literal')
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
            onClick={() => setSelectedId(scenario.id)}
          >
            {labels[scenario.id]}
          </button>
        ))}
      </div>

      <div className={styles.panels} id={`${id}-result`}>
        {PRIMITREE_DEMO.scenarios.map((scenario) => {
          const active = scenario.id === selectedId
          const blocked = scenario.build.exitCode !== 0
          const finding = scenario.checkReport.findings[0]
          const cssExcerpt = getPrimitreeCssExcerpt(scenario.css)
          const visibleCss = compact
            ? cssExcerpt?.split('\n').find((line) => line.trim().startsWith('--semantic-action:'))?.trim() ?? cssExcerpt
            : cssExcerpt
          const tokenValue = scenario.tokens.semantic.action.$value
          return (
            <div className={styles.panel} key={scenario.id} data-active={active} data-blocked={blocked} inert={!active} aria-hidden={!active}>
              <div className={styles.source}>
                <div className={styles.sourceTitle}><span>Source token</span><span>tokens.json</span></div>
                <code className={styles.tokenPath}>semantic.action</code>
                {compact ? (
                  <dl className={styles.tokenValue}>
                    <div>
                      <dt>Value preview</dt>
                      <dd className={styles.valuePreview}>
                        {typeof tokenValue !== 'string' && <span className={styles.valueSwatch} aria-hidden="true" style={{ backgroundColor: tokenValue.hex }} />}
                        <code>{typeof tokenValue === 'string' ? tokenValue : tokenValue.hex}</code>
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <pre className={styles.tokenCode} tabIndex={0} aria-label="Semantic action token input"><code>{JSON.stringify(scenario.tokens.semantic.action, null, 2)}</code></pre>
                )}
                <div className={styles.baseToken}>
                  <span aria-hidden="true" style={{ backgroundColor: sourceColor }} />
                  <code>color.cyan</code>
                  <span>{sourceColor}</span>
                </div>
              </div>

              <div className={styles.result}>
                {!compact && <div className={styles.command}><code>primitree build</code><span>exit {scenario.build.exitCode}</span></div>}
                <div className={styles.resultHeading}>
                  {blocked ? <CircleXIcon size={20} /> : <CircleCheckIcon size={20} />}
                  <span>{blocked ? 'Build stopped' : 'Build passed'}</span>
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
        <summary>{compact ? 'Inspect source and full output' : 'Inspect configuration and full output'}<ChevronDownIcon size={16} /></summary>
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

      <p className={styles.liveStatus} role="status" aria-live="polite" aria-atomic="true">
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

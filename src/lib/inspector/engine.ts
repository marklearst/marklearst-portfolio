import { buildCssIndex } from './css-index'
import { describe } from './describe'
import { animateDock, stopDockMotion } from './dock-motion'
import { BREAK_PATH, cssVar, editedGraph, editsCss, freeze, tokenGraph, type GraphEdits, type TokenGraph } from './graph'
import { createElementInspector, type ElementInspector } from './inspect-element'
import { rebrand, type BrandReport } from './rebrand'
import type { CheckSummary, ContextSelection, Inspection } from './types'
import { traceTokens, type TokenTrace } from './trace'

export interface Stranded {
  /** The literal the broken token holds. */
  held: string
  /** What the token it used to reference resolves to now. */
  now: string
}

/** Everything the inspector computes. Loaded on first use, so the page ships without it. */
export interface Engine {
  animateDock: typeof animateDock
  stopDockMotion: typeof stopDockMotion
  readonly broken: boolean
  /**
   * Breaks or restores the rule. Breaking freezes the token at the color it
   * resolves to now, so a rebrand after this leaves it behind.
   */
  setBroken(broken: boolean): void
  /** Retunes the accent to a hue through the site's color rule. The default hue restores the built color. */
  setBrand(hue: number): BrandReport
  /**
   * While a rule is broken: the color its token holds, and the color it would have followed to.
   * Null while the two agree, which is every moment until what it used to reference changes.
   */
  stranded(selection: ContextSelection): Stranded | null
  /** Reads the page's stylesheets now, so the first inspection doesn't have to. Safe to call when idle. */
  prepare(): void
  /** A plain name for an element, known before its tokens are read. */
  label(element: Element): string
  check(): CheckSummary
  inspect(element: Element, selection: ContextSelection): Inspection
  usersOf(path: string, selection: ContextSelection, scope: Element): Element[]
  /** A token's chain on its own, for a finding that points at a token instead of an element. */
  chain: TokenGraph['chain']
  /** The same chain in the graph as built, whatever the visitor has changed. */
  builtChain: TokenGraph['chain']
  trace(path: string, selection: ContextSelection): TokenTrace
}

export function createEngine(excluded: (element: Element) => boolean): Engine {
  let edits: GraphEdits = {}
  // Built on demand: a hue being dragged changes the page many times before anyone reads the graph.
  const graph = () => editedGraph(edits)
  let inspector: ElementInspector | undefined
  let indexed = ''
  let style: HTMLStyleElement | undefined

  /** Names the stylesheets in force. The inspector's own sheet only sets variables, so it is left out. */
  function sheets() {
    let signature = ''
    for (const sheet of document.styleSheets) {
      const owner = sheet.ownerNode
      if (owner === style) continue
      signature += `${sheet.href ?? (owner instanceof HTMLStyleElement ? owner.textContent?.length : '')};`
    }
    return signature
  }

  function elements() {
    // A route can bring new stylesheets, and an index built before them would miss their rules.
    // Most routes bring none, and then the index stands.
    const signature = sheets()
    if (!inspector || signature !== indexed) {
      indexed = signature
      inspector = createElementInspector(buildCssIndex(), excluded)
    }
    return inspector
  }

  /** Puts the edited graph in force: in the inspector's answers and on the page. */
  function apply(next: GraphEdits) {
    edits = next
    const css = editsCss(edits)
    if (!css) {
      style?.remove()
      return
    }
    style ??= Object.assign(document.createElement('style'), { id: 'primitree-edits' })
    style.textContent = css
    if (!style.isConnected) document.head.append(style)
  }

  return {
    animateDock,
    stopDockMotion,
    get broken() {
      return Boolean(edits.frozen)
    },
    setBroken(broken) {
      apply({ ...edits, frozen: broken ? freeze(graph()) : null })
    },
    setBrand(hue) {
      const { literals, report } = rebrand(hue, document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
      apply({ ...edits, literals })
      return report
    },
    stranded(selection) {
      if (!edits.frozen) return null
      const held = graph().chain(BREAK_PATH, selection)!.value.text
      const now = editedGraph({ literals: edits.literals }).chain(BREAK_PATH, selection)!.value.text
      return held === now ? null : { held, now }
    },
    prepare() {
      elements()
    },
    label: (element) => describe(element).label,
    check: () => graph().check(),
    inspect: (element, selection) => elements().inspect(element, graph(), selection),
    usersOf: (path, selection, scope) => elements().usersOf(path, graph(), selection, scope),
    chain: (path, selection) => graph().chain(path, selection),
    builtChain: (path, selection) => tokenGraph().chain(path, selection),
    trace: (path, selection) => traceTokens(graph(), tokenGraph(), path, selection, cssVar),
  }
}

import { cssVar, DEFAULT_SELECTION, TOKEN_PATHS, tokenGraph } from '@/lib/inspector/graph'
import { traceTokens } from '@/lib/inspector/trace'
import TokenGraph from './TokenGraph'

const FOCUS = 'semantic.color.accent.primary'

export default function SiteTokenGraph({ linkable = false }: { linkable?: boolean }) {
  const graph = tokenGraph()
  const initial = {
    dark: traceTokens(graph, graph, FOCUS, { ...DEFAULT_SELECTION, theme: 'dark' }, cssVar),
    light: traceTokens(graph, graph, FOCUS, { ...DEFAULT_SELECTION, theme: 'light' }, cssVar),
  }
  const accent = (theme: 'dark' | 'light') => {
    const chain = graph.chain(FOCUS, { ...DEFAULT_SELECTION, theme })
    if (!chain) throw new Error(`The accent must resolve in ${theme}.`)
    return chain.value
  }
  return <TokenGraph initial={initial} paths={TOKEN_PATHS} accent={{ dark: accent('dark'), light: accent('light') }} linkable={linkable} />
}

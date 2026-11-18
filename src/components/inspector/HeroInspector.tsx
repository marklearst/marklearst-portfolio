import { DEFAULT_SELECTION, tokenGraph } from '@/lib/inspector/graph'
import { InspectorBody, InspectorBrandPreview, InspectorControls, InspectorDock, InspectorSlot, InspectorStatus } from './InspectorDock'

const ACCENT = 'component.button.accent.background'

export default function HeroInspector() {
  const graph = tokenGraph()
  const preview = (theme: 'dark' | 'light') => {
    const selection = { ...DEFAULT_SELECTION, theme }
    const chain = graph.chain(ACCENT, selection)
    const foreground = graph.chain('component.button.accent.text', selection)
    if (!chain || !foreground) throw new Error('The hero accent must resolve in every theme.')
    return { chain, foreground: foreground.value.text }
  }

  return (
    <InspectorSlot>
      <InspectorDock placement='inline'>
        <InspectorBody>
          <InspectorBrandPreview built={{ dark: preview('dark'), light: preview('light') }} />
        </InspectorBody>
        <InspectorStatus />
        <InspectorControls ruleInPreview />
      </InspectorDock>
    </InspectorSlot>
  )
}

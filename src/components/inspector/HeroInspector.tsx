import { contrast } from '@/lib/inspector/brand'
import { DEFAULT_SELECTION, tokenGraph } from '@/lib/inspector/graph'
import type { Preview } from './inspector-controller'
import { InspectorBody, InspectorControls, InspectorDock, InspectorSlot, InspectorStatus } from './InspectorDock'

// What the dock shows before anyone inspects: the tokens behind the hero's
// heading, which the page outlines. Resolved on the server from the same graph
// the build checked, so the first paint already holds real chains, and they are
// the ones inspecting that heading will show.
const PREVIEW = {
  label: 'Heading 1',
  properties: [
    { id: 'color', label: 'Text', path: 'semantic.color.ink.primary', on: 'semantic.color.surface.canvas' },
    { id: 'font-size', label: 'Type size', path: 'semantic.type.display.size' },
  ],
}

/** WCAG AA for large text, which a heading this size is. */
const LARGE_TEXT_FLOOR = 3

export default function HeroInspector() {
  const graph = tokenGraph()
  const resolve = (path: string) => {
    const chain = graph.chain(path, DEFAULT_SELECTION)
    if (!chain) throw new Error(`The hero preview names ${path}, which is not a token.`)
    return chain
  }
  const preview: Preview = {
    label: PREVIEW.label,
    properties: PREVIEW.properties.map(({ on, ...property }) => {
      const chain = resolve(property.path)
      return {
        ...property,
        chain,
        contrast: on ? { ratio: contrast(chain.value.text, resolve(on).value.text), floor: LARGE_TEXT_FLOOR } : undefined,
      }
    }),
  }

  return (
    <InspectorSlot caption='The colors, type, and motion on this site come from one token graph, and Primitree checks it on every build. Inspect anything to trace a value to its source.'>
      <InspectorDock placement='inline'>
        <InspectorStatus />
        <InspectorBody preview={preview} />
        <InspectorControls />
      </InspectorDock>
    </InspectorSlot>
  )
}

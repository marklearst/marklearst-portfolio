import { cssVar, DEFAULT_SELECTION, tokenGraph } from '@/lib/inspector/graph'
import type { Bezier } from '@/lib/motion-curve'
import MotionBench, { type MotionProfile } from './MotionBench'

const roles = [
  { id: 'hover', name: 'Hover', description: 'The time a button takes to settle under the pointer.', token: 'component.button.motion', easing: 'semantic.easing.enter' },
  { id: 'reveal', name: 'Reveal', description: 'A new detail becoming visible.', token: 'component.inspector.motion', easing: 'semantic.easing.enter' },
  { id: 'handoff', name: 'Handoff', description: 'An object moving between places.', token: 'component.dock.motion', easing: 'semantic.easing.move' },
] as const

export default function SiteMotionBench() {
  const graph = tokenGraph()
  const profiles: MotionProfile[] = roles.map((role) => {
    const durationVariable = cssVar(role.token)
    const easingVariable = cssVar(role.easing)
    if (!durationVariable || !easingVariable) throw new Error('The motion bench must use generated CSS variables.')
    const contexts = Object.fromEntries(['default', 'slow', 'reduced'].map((motion) => {
      const selection = { ...DEFAULT_SELECTION, motion }
      const chain = graph.chain(role.token, selection)
      const ease = graph.resolve(role.easing, selection)
      const duration = graph.resolve(role.token, selection) as { value: number; unit: string }
      if (!chain || !Array.isArray(ease) || ease.length !== 4) throw new Error('The motion bench must resolve a duration and cubic Bezier.')
      return [motion, { milliseconds: duration.value * (duration.unit === 's' ? 1000 : 1), curve: ease as unknown as Bezier, chain: chain.steps.map((step) => step.path) }]
    })) as MotionProfile['contexts']
    return { ...role, durationVariable: durationVariable as `--${string}`, easingVariable: easingVariable as `--${string}`, contexts }
  })
  return <MotionBench profiles={profiles} />
}

import type { ResolvedChain } from '@/lib/inspector/types'
import type { InspectorController, InspectorState } from './inspector-controller'

interface Timing {
  reveal: number
  causal: number
  easing: string
  linear: string
}

interface Presentation {
  node: string
  link: string
  specimen: string
  timing(): Timing
}

function chains(state: InspectorState): ResolvedChain[] {
  return [
    state.brandPreview?.chain,
    ...state.selection?.properties.flatMap((property) => property.chains) ?? [],
    state.brokenChain,
    state.severedChain,
  ].filter((chain): chain is ResolvedChain => Boolean(chain))
}

function changedSources(before: InspectorState, after: InspectorState): Set<string> {
  const previous = new Map(chains(before).map((chain) => [chain.steps[0]?.path, chain.value.css]))
  const sources = new Set<string>()
  for (const chain of chains(after)) {
    if (chain.value.kind !== 'color' || chain.value.literal || chain.steps.some((step) => step.finding)) continue
    if (previous.get(chain.steps[0]?.path) === chain.value.css) continue
    const source = chain.steps.at(-1)
    if (source?.layer === 'base') sources.add(source.path)
  }
  return sources
}

export function createChainPropagation(getHost: () => HTMLElement | null, presentation: Presentation) {
  let active: { rows: HTMLElement[][]; animations: Animation[]; nodes: HTMLElement[] } | undefined

  const cancel = () => {
    const run = active
    active = undefined
    run?.animations.forEach((animation) => animation.cancel())
    run?.nodes.forEach((node) => node.remove())
  }

  const play = (paths: ReadonlySet<string>) => {
    const host = getHost()
    if (!paths.size || !host?.isConnected || host.closest('[inert]') || typeof host.animate !== 'function') {
      cancel()
      return
    }
    const lists = new Set<HTMLOListElement>()
    for (const token of host.querySelectorAll<HTMLElement>('[data-token-row]')) {
      if (paths.has(token.dataset.dockFocus?.slice('token:'.length) ?? '')) {
        const list = token.closest('ol')
        if (list) lists.add(list)
      }
    }
    const rows = [...lists]
      .filter((list) => list.getClientRects().length && !list.querySelector('[data-broken]'))
      .map((list) => [...list.querySelectorAll<HTMLElement>('[data-token-row]')].map((token) => token.closest('li')!).reverse())
      .filter((chain) => chain.length)
    const current = active
    if (current && rows.length === current.rows.length && rows.every((chain, i) => chain.length === current.rows[i].length && chain.every((row, j) => row === current.rows[i][j]))) return
    cancel()
    const timing = presentation.timing()
    if (!rows.length || timing.reveal <= 0 || timing.causal <= 0) return

    const distances = rows.map((chain) => chain.map((row, i) => i + 1 < chain.length ? row.offsetTop - chain[i + 1].offsetTop : 0))
    const run = { rows, animations: [] as Animation[], nodes: [] as HTMLElement[] }
    active = run
    const animate = (element: HTMLElement, frames: Keyframe[], duration: number, delay: number, curve = timing.easing) => {
      const animation = element.animate(frames, { duration, delay, easing: curve, fill: 'both' })
      run.animations.push(animation)
    }
    try {
      rows.forEach((chain, c) => {
        chain[0].closest('ol')?.setAttribute('data-propagation-read', '')
        chain.forEach((row, i) => {
          const delay = i * timing.causal
          const node = document.createElement('span')
          node.className = presentation.node
          node.setAttribute('aria-hidden', 'true')
          row.append(node)
          run.nodes.push(node)
          animate(node, [
            { opacity: 0, transform: 'scale(1)' },
            { opacity: 1, transform: 'scale(1.6)', offset: 0.3 },
            { opacity: 0, transform: 'scale(1)' },
          ], timing.reveal, delay)
          const label = row.querySelector<HTMLElement>('[data-token-row] > code')
          if (label) animate(label, [
            { transform: 'translateX(0)' },
            { transform: 'translateX(var(--space-2))', offset: 0.3 },
            { transform: 'translateX(0)' },
          ], timing.reveal, delay)
          if (distances[c][i] > 0) {
            const link = document.createElement('span')
            link.className = presentation.link
            link.setAttribute('aria-hidden', 'true')
            link.style.height = `${distances[c][i]}px`
            row.append(link)
            run.nodes.push(link)
            animate(link, [
              { opacity: 1, transform: 'translateY(-100%) scaleY(0)' },
              { opacity: 1, transform: 'translateY(-100%) scaleY(1)', offset: timing.causal / (timing.causal + timing.reveal) },
              { opacity: 0, transform: 'translateY(-100%) scaleY(1)' },
            ], timing.causal + timing.reveal, delay, timing.linear)
          }
        })
      })
      const specimen = host.querySelector<HTMLElement>(presentation.specimen)
      const consumer = rows.find((chain) => chain.at(-1)?.querySelector<HTMLElement>('[data-token-row]')?.dataset.dockFocus === 'token:component.button.accent.background')
      if (specimen && consumer) animate(specimen, [
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(calc(var(--space-2) * -1)) scale(0.98)', offset: 0.3 },
        { transform: 'translateY(0) scale(1)' },
      ], timing.reveal, (consumer.length - 1) * timing.causal)
    } catch {
      cancel()
    }
    const finish = () => { if (active === run) cancel() }
    void Promise.all(run.animations.map((animation) => animation.finished)).then(finish, finish)
  }

  return { play, cancel }
}

export function observeChainPropagation(
  getHost: () => HTMLElement | null,
  controller: Pick<InspectorController, 'getState' | 'subscribe'>,
  presentation: Presentation,
) {
  const propagation = createChainPropagation(getHost, presentation)
  let previous = controller.getState()
  let frame = 0
  const cancel = () => {
    cancelAnimationFrame(frame)
    frame = 0
    propagation.cancel()
  }
  const unsubscribe = controller.subscribe(() => {
    const state = controller.getState()
    if (state.keyboard || state.motion === 'reduced' || state.motion !== previous.motion || state.theme !== previous.theme || (state.broken && !previous.broken) || state.inspecting !== previous.inspecting || state.floating !== previous.floating || state.selectionId !== previous.selectionId) {
      cancel()
      previous = state
      return
    }
    if (state.brand.hex === previous.brand.hex && !(previous.broken && !state.broken)) return
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      const current = controller.getState()
      const changed = current.brand.hex !== previous.brand.hex || (previous.broken && !current.broken)
      const paths = changed ? changedSources(previous, current) : new Set<string>()
      previous = current
      propagation.play(paths)
    })
  })
  return () => {
    unsubscribe()
    cancel()
  }
}

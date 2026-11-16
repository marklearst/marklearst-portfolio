import { contrastRatio, surfaceBehind, toHex, toRgba } from './color'
import { declarationsFor, type IndexedDeclaration, type IndexedRule, varsIn } from './css-index'
import { describe } from './describe'
import { cssVar, tokenForVar, typeOf, varsFor, type TokenGraph } from './graph'
import type { ContextSelection, Inspection, PropertyReport, ResolvedChain } from './types'

// How an element's tokens are found.
//
// The stylesheet proposes: every rule that matches the element and reads a
// custom property is a candidate. The browser decides: each candidate property
// is set to a sentinel on the element for an instant, and the computed style
// shows which painted properties move. That keeps the cascade, specificity,
// layers, media queries, and inheritance the browser's own answer, so the
// inspector can't drift from what is on screen.

type Styled = HTMLElement | SVGElement
type Family = 'paint' | 'type' | 'motion'

interface Group {
  id: string
  label: string
  props: readonly string[]
  /** Declarations that can set this group, by property name. */
  declared: RegExp
  inherited: boolean
  family: Family
}

const GROUPS: readonly Group[] = [
  { id: 'text', label: 'Text', props: ['color'], declared: /^color$/, inherited: true, family: 'paint' },
  { id: 'background', label: 'Background', props: ['background-color'], declared: /^background(-color)?$/, inherited: false, family: 'paint' },
  {
    id: 'border',
    label: 'Border',
    props: ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'],
    declared: /^border/,
    inherited: false,
    family: 'paint',
  },
  { id: 'edge', label: 'Edge', props: ['box-shadow'], declared: /^box-shadow$/, inherited: false, family: 'paint' },
  { id: 'size', label: 'Type size', props: ['font-size'], declared: /^font(-size)?$/, inherited: true, family: 'type' },
  { id: 'typeface', label: 'Typeface', props: ['font-family'], declared: /^font(-family)?$/, inherited: true, family: 'type' },
  { id: 'duration', label: 'Motion', props: ['transition-duration', 'animation-duration'], declared: /^(transition|animation)/, inherited: false, family: 'motion' },
  { id: 'easing', label: 'Easing', props: ['transition-timing-function', 'animation-timing-function'], declared: /^(transition|animation)/, inherited: false, family: 'motion' },
]

const PROPS: Record<Family, readonly string[]> = {
  paint: GROUPS.filter((group) => group.family === 'paint').flatMap((group) => group.props),
  type: GROUPS.filter((group) => group.family === 'type').flatMap((group) => group.props),
  motion: GROUPS.filter((group) => group.family === 'motion').flatMap((group) => group.props),
}

const SENTINEL: Record<string, { value: string; family: Family }> = {
  color: { value: 'rgb(1 2 3)', family: 'paint' },
  dimension: { value: '123.456px', family: 'type' },
  number: { value: '7.77', family: 'type' },
  fontFamily: { value: '"pt-probe"', family: 'type' },
  duration: { value: '12345ms', family: 'motion' },
  cubicBezier: { value: 'cubic-bezier(0.111, 0.222, 0.333, 0.444)', family: 'motion' },
}

/** The type of a custom property that is not a token, read from its current value. */
function inferType(value: string): string | null {
  if (/^[\d.]+m?s$/.test(value)) return 'duration'
  if (/^(cubic-bezier|linear|ease|steps)/.test(value)) return 'cubicBezier'
  if (CSS.supports('color', value)) return 'color'
  if (CSS.supports('font-size', value)) return 'dimension'
  return null
}

function sentinelFor(name: string, current: string) {
  const alias = tokenForVar(name)
  const type = alias ? typeOf(alias.token) : inferType(current)
  if (!type || !SENTINEL[type]) return null
  // An adapter that multiplies by 1em stands in for a length, so its probe is one too.
  if (type === 'number' && alias?.css?.includes('1em')) return { value: '0.777em', family: 'type' as const }
  return SENTINEL[type]
}

const read = (element: Element, props: readonly string[]) => {
  const style = getComputedStyle(element)
  return props.map((prop) => style.getPropertyValue(prop))
}

/** Turns transitions off on the elements while `work` runs, so a probed value is read at once. */
function frozen<Result>(elements: readonly Styled[], work: () => Result): Result {
  const saved = elements.map((element) => [
    element.style.getPropertyValue('transition'),
    element.style.getPropertyPriority('transition'),
  ])
  for (const element of elements) element.style.setProperty('transition', 'none', 'important')
  try {
    return work()
  } finally {
    elements.forEach((element, i) => {
      void getComputedStyle(element).color // Settle the restored values before transitions come back.
      if (saved[i][0]) element.style.setProperty('transition', saved[i][0], saved[i][1])
      else element.style.removeProperty('transition')
      if (element.getAttribute('style') === '') element.removeAttribute('style')
    })
  }
}

/** Sets a custom property on `host` for one read and reports which of `props` moved on `observed`. */
function probe(host: Styled, name: string, value: string, observed: Element, props: readonly string[], before: readonly string[]) {
  const previous = host.style.getPropertyValue(name)
  host.style.setProperty(name, value)
  const after = read(observed, props)
  if (previous) host.style.setProperty(name, previous)
  else host.style.removeProperty(name)
  return props.filter((_, i) => before[i] !== after[i])
}

interface Entry {
  name: string
  host: Styled
  declaration: IndexedDeclaration | undefined
}

export interface ElementInspector {
  inspect(element: Element, graph: TokenGraph, selection: ContextSelection): Inspection
  /** Every element in `scope` painted through `path`, nearest dependents first. */
  usersOf(path: string, graph: TokenGraph, selection: ContextSelection, scope: Element): Element[]
}

export function createElementInspector(index: readonly IndexedRule[], excluded: (element: Element) => boolean): ElementInspector {
  const declarationCache = new WeakMap<Element, IndexedDeclaration[]>()
  const declarations = (element: Element) => {
    let found = declarationCache.get(element)
    if (!found) declarationCache.set(element, (found = declarationsFor(element, index)))
    return found
  }
  /** The custom properties an element's own rules read that could feed one family of properties. */
  function candidates(element: Styled, family: Family) {
    const style = getComputedStyle(element)
    const out: { name: string; value: string }[] = []
    for (const name of new Set(declarations(element).flatMap((declaration) => declaration.vars))) {
      const current = style.getPropertyValue(name).trim()
      if (!current) continue // Unset: a fallback is doing the work, and it gets its own probe.
      const sentinel = sentinelFor(name, current)
      if (sentinel?.family === family) out.push({ name, value: sentinel.value })
    }
    return out
  }

  /** Follows a custom property that is not a token back to the tokens it was set from. */
  function trace(name: string, from: Styled, observed: Element, group: Group, depth = 0): Entry[] {
    if (tokenForVar(name) || depth > 3) return []
    for (let host: Element | null = from; host; host = host.parentElement) {
      const definition = declarations(host).find((declaration) => declaration.property === name)
      if (!definition) continue
      const styled = host as Styled
      const before = read(observed, group.props)
      const style = getComputedStyle(styled)
      return definition.vars.flatMap((inner): Entry[] => {
        const sentinel = sentinelFor(inner, style.getPropertyValue(inner).trim())
        if (!sentinel || !probe(styled, inner, sentinel.value, observed, group.props, before).length) return []
        return tokenForVar(inner) ? [{ name: inner, host: styled, declaration: definition }] : trace(inner, styled, observed, group, depth + 1)
      })
    }
    return []
  }

  function entriesOn(host: Styled, observed: Styled, groups: readonly Group[], family: Family, into: Map<string, Entry[]>) {
    const vars = candidates(host, family)
    if (!vars.length) return
    const props = PROPS[family]
    const run = () => {
      const before = read(observed, props)
      for (const { name, value } of vars) {
        const moved = probe(host, name, value, observed, props, before)
        for (const group of groups) {
          if (!group.props.some((prop) => moved.includes(prop))) continue
          const declaration = declarations(host).find((candidate) => candidate.vars.includes(name) && group.declared.test(candidate.property))
          const found = tokenForVar(name) ? [{ name, host, declaration }] : trace(name, host, observed, group)
          if (found.length) into.set(group.id, [...(into.get(group.id) ?? []), ...found])
        }
      }
    }
    if (family === 'motion') run()
    else frozen(host === observed ? [host] : [host, observed], run)
  }

  function entries(element: Styled) {
    const found = new Map<string, Entry[]>()
    for (const family of ['paint', 'type', 'motion'] as const) {
      entriesOn(element, element, GROUPS.filter((group) => group.family === family), family, found)
    }
    // An inherited property is declared on an ancestor. Climb while the value is unchanged.
    for (const group of GROUPS) {
      if (!group.inherited || found.has(group.id)) continue
      const own = read(element, group.props).join()
      for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
        if (read(ancestor, group.props).join() !== own) break
        entriesOn(ancestor as Styled, element, [group], group.family, found)
        if (found.has(group.id)) break
      }
    }
    return found
  }

  /** The function a token sits inside when the declaration does more than read it, such as `color-mix(…)`. */
  function expressionFor(entry: Entry): string | null {
    const adapter = tokenForVar(entry.name)
    const value = entry.declaration?.value ?? ''
    const at = value.indexOf(`var(${entry.name}`)
    const open: number[] = []
    for (let i = 0; i < at; i += 1) {
      if (value[i] === '(') open.push(i)
      else if (value[i] === ')') open.pop()
    }
    // The outermost function around the token that is not itself a var() fallback.
    const outer = open.find((paren) => !/var$/.test(value.slice(0, paren)) && /[\w-]$/.test(value.slice(0, paren)))
    if (outer !== undefined) {
      const start = value.slice(0, outer).search(/[\w-]+$/)
      let depth = 0
      for (let i = outer; i < value.length; i += 1) {
        if (value[i] === '(') depth += 1
        else if (value[i] === ')' && (depth -= 1) === 0) return value.slice(start, i + 1)
      }
    }
    return adapter?.css ? adapter.css.replace('{var}', `var(${cssVar(adapter.token)})`) : null
  }

  function rawValue(group: Group, element: Styled): string | null {
    const style = getComputedStyle(element)
    if (group.id === 'background') {
      const color = toRgba(style.backgroundColor)
      if (!color || color.a === 0) return null
      return color.a < 1 ? `${toHex(color)} at ${Math.round(color.a * 100)}%` : toHex(color)
    }
    if (group.id === 'edge') return style.boxShadow === 'none' ? null : style.boxShadow
    if (group.id === 'border') {
      const side = ['top', 'right', 'bottom', 'left'].find(
        (name) => style.getPropertyValue(`border-${name}-style`) !== 'none' && Number.parseFloat(style.getPropertyValue(`border-${name}-width`)) > 0,
      )
      const color = side ? style.getPropertyValue(`border-${side}-color`) : ''
      const rgba = color && color !== style.color ? toRgba(color) : null
      return rgba && rgba.a > 0 ? toHex(rgba) : null
    }
    if (group.id === 'duration') {
      const durations = [...new Set(style.transitionDuration.split(',').map((part) => part.trim()))].filter((part) => Number.parseFloat(part) > 0)
      return durations.length ? durations.map((part) => `${Math.round(Number.parseFloat(part) * 1000)}ms`).join(', ') : null
    }
    if (group.id === 'size' && element.textContent?.trim()) return style.fontSize
    return null
  }

  function inspect(element: Element, graph: TokenGraph, selection: ContextSelection): Inspection {
    const styled = element as Styled
    const found = entries(styled)
    const style = getComputedStyle(styled)
    const isIcon = element.localName === 'svg'
    const hasText = Boolean(element.textContent?.trim())
    const properties: PropertyReport[] = []
    for (const group of GROUPS) {
      const groupEntries = [...new Map((found.get(group.id) ?? []).map((entry) => [entry.name, entry])).values()]
      // Text properties mean nothing on an element that holds no text.
      if ((group.family === 'type' || group.id === 'text') && !hasText && !isIcon) continue
      if (group.family === 'type' && isIcon) continue
      if (group.id === 'border' && !rawBorderVisible(style)) continue
      const chains = groupEntries.flatMap((entry): ResolvedChain[] => {
        const chain = graph.chain(tokenForVar(entry.name)!.token, selection)
        return chain ? [chain] : []
      })
      const raw = chains.length ? null : rawValue(group, styled)
      if (!chains.length && !raw) continue
      let contrast = null
      if (group.id === 'text') {
        const color = toRgba(style.color)
        const size = Number.parseFloat(style.fontSize)
        const large = isIcon || size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700)
        if (color) contrast = { ratio: contrastRatio(color, surfaceBehind(element)), floor: large ? 3 : 4.5 }
      }
      properties.push({
        id: group.id,
        label: group.id === 'text' && isIcon ? 'Color' : group.label,
        chains,
        expression: groupEntries.length === 1 ? expressionFor(groupEntries[0]) : null,
        raw,
        contrast,
      })
    }
    return { ...describe(element), properties }
  }

  function usersOf(path: string, graph: TokenGraph, selection: ContextSelection, scope: Element): Element[] {
    const hops = new Map<string, number>()
    for (const dependent of graph.dependents(path, selection)) {
      for (const name of varsFor(dependent.path)) hops.set(name, dependent.hops)
    }
    const type = typeOf(path)
    const sentinel = type ? SENTINEL[type] : undefined
    if (!hops.size || !sentinel) return []
    const props = PROPS[sentinel.family]

    const found = new Map<Element, Set<string>>()
    const add = (element: Element, names: readonly string[]) => {
      if (excluded(element) || !element.getClientRects().length) return
      found.set(element, new Set([...(found.get(element) ?? []), ...names]))
    }
    for (const rule of index) {
      const names = [...rule.vars].filter((name) => hops.has(name))
      if (!names.length) continue
      try {
        for (const element of scope.querySelectorAll(rule.selector)) add(element, names)
      } catch {
        // A selector this browser can't parse selects nothing.
      }
    }
    for (const element of scope.querySelectorAll('[style*="var(--"]')) {
      const names = varsIn(element.getAttribute('style') ?? '').filter((name) => hops.has(name))
      if (names.length) add(element, names)
    }

    // Probe one depth of the tree at a time, so an element is never judged by a sentinel set on its ancestor.
    const depthOf = (element: Element) => {
      let depth = 0
      for (let node = element.parentElement; node; node = node.parentElement) depth += 1
      return depth
    }
    const levels = new Map<number, Styled[]>()
    for (const element of found.keys()) {
      const depth = depthOf(element)
      levels.set(depth, [...(levels.get(depth) ?? []), element as Styled])
    }
    const users: Element[] = []
    for (const level of levels.values()) {
      const run = () => {
        const before = level.map((element) => read(element, props).join())
        const previous = level.map((element) => [...found.get(element)!].map((name) => [name, element.style.getPropertyValue(name)] as const))
        level.forEach((element) => found.get(element)!.forEach((name) => element.style.setProperty(name, sentinelFor(name, sentinel.value)?.value ?? sentinel.value)))
        level.forEach((element, i) => {
          if (read(element, props).join() !== before[i]) users.push(element)
        })
        level.forEach((element, i) => {
          for (const [name, value] of previous[i]) {
            if (value) element.style.setProperty(name, value)
            else element.style.removeProperty(name)
          }
        })
      }
      if (sentinel.family === 'motion') run()
      else frozen(level, run)
    }
    const nearest = (element: Element) => Math.min(...[...found.get(element)!].map((name) => hops.get(name)!))
    return users.sort((a, b) => nearest(a) - nearest(b) || (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
  }

  return { inspect, usersOf }
}

function rawBorderVisible(style: CSSStyleDeclaration): boolean {
  return ['top', 'right', 'bottom', 'left'].some(
    (side) => style.getPropertyValue(`border-${side}-style`) !== 'none' && Number.parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0,
  )
}

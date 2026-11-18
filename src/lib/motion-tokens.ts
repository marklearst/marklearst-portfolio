// Motion tokens as the page resolves them right now. Scripted animation reads
// them here instead of repeating a number, so a retune or the reduced motion
// context reaches CSS and JavaScript alike.

function read(name: string): string {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** A duration token in milliseconds. Zero under reduced motion. */
export function durationMs(name: `--${string}`): number {
  const value = read(name)
  const amount = Number.parseFloat(value)
  if (!Number.isFinite(amount)) return 0
  return value.endsWith('ms') ? amount : amount * 1000
}

/** An easing token as a CSS timing function. */
export function easing(name: `--${string}` = '--semantic-easing-enter'): string {
  return read(name) || 'ease-out'
}

/** Motion accepts a Bezier tuple, while CSS consumes the timing-function string. */
export function motionEase(name: `--${string}` = '--semantic-easing-enter'): [number, number, number, number] {
  const value = read(name)
  const match = /^cubic-bezier\(([^)]+)\)$/.exec(value)
  const points = match?.[1].split(',').map(Number)
  if (!points || points.length !== 4 || !points.every(Number.isFinite)) throw new Error(`${name} must resolve to a cubic Bezier.`)
  return [points[0], points[1], points[2], points[3]]
}

/** A number token, such as how far a spring passes its target. */
export function numberToken(name: `--${string}`): number {
  const amount = Number.parseFloat(read(name))
  return Number.isFinite(amount) ? amount : 0
}

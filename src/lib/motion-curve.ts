export type Bezier = readonly [number, number, number, number]

const coordinate = (t: number, a: number, b: number) =>
  3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3

/** CSS easing maps elapsed time on x to progress on y, not directly to the curve parameter. */
export function curveProgress(time: number, [x1, y1, x2, y2]: Bezier): number {
  if (time <= 0) return 0
  if (time >= 1) return 1
  let lower = 0
  let upper = 1
  for (let step = 0; step < 30; step++) {
    const middle = (lower + upper) / 2
    if (coordinate(middle, x1, x2) < time) lower = middle
    else upper = middle
  }
  return coordinate((lower + upper) / 2, y1, y2)
}

/** A normalized SVG plot: time increases rightward, progress upward. */
export function curvePath([x1, y1, x2, y2]: Bezier): string {
  return `M0 100 C${x1 * 100} ${100 - y1 * 100} ${x2 * 100} ${100 - y2 * 100} 100 0`
}

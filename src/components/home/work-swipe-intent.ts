/** Input tolerances stay constant when presentation motion is slowed or reduced. */
export function swipeDestination(index: number, count: number, width: number, offset: number, velocity: number, age: number) {
  const projected = offset + (age < 60 ? velocity * 140 : 0)
  const direction = Math.abs(projected) > width / 5 ? (projected < 0 ? 1 : -1) : 0
  return Math.max(0, Math.min(count - 1, index + direction))
}

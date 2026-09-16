/** Returns an rgba color for renderers that do not support CSS color-mix. */
export function colorWithAlpha(color: string, alpha: number): string {
  const value = color.trim()
  const hex = /^#([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.exec(value)
  let channels: number[]

  if (hex) {
    const digits = hex[1].length <= 4
      ? [...hex[1]].map((digit) => digit + digit).join('')
      : hex[1]
    channels = [0, 2, 4].map((offset) => Number.parseInt(digits.slice(offset, offset + 2), 16))
  } else {
    const rgb = /^rgba?\(([^)]+)\)$/i.exec(value)
    const parts = rgb?.[1].trim().split(/[\s,/]+/).slice(0, 3)
    if (!parts || parts.length !== 3) throw new Error(`Unsupported color: ${color}`)
    channels = parts.map((part) => {
      const numeric = Number.parseFloat(part)
      return part.endsWith('%') ? numeric * 255 / 100 : numeric
    })
  }

  if (!Number.isFinite(alpha) || channels.some((channel) => !Number.isFinite(channel))) {
    throw new Error(`Invalid color or alpha: ${color}`)
  }

  const [red, green, blue] = channels.map((channel) => Math.round(Math.max(0, Math.min(255, channel))))
  return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(1, alpha))})`
}

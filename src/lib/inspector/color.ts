export interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

const SRGB = /color\(srgb\s+([\d.e+-]+)\s+([\d.e+-]+)\s+([\d.e+-]+)(?:\s*\/\s*([\d.e+-]+))?\)/
const RGB = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/

let converter: HTMLElement | undefined
const cache = new Map<string, Rgba | null>()

function parse(value: string): Rgba | null {
  const srgb = SRGB.exec(value)
  if (srgb) return { r: Number(srgb[1]) * 255, g: Number(srgb[2]) * 255, b: Number(srgb[3]) * 255, a: srgb[4] === undefined ? 1 : Number(srgb[4]) }
  const rgb = RGB.exec(value)
  if (!rgb) return null
  const alpha = rgb[4] === undefined ? 1 : rgb[4].endsWith('%') ? Number.parseFloat(rgb[4]) / 100 : Number(rgb[4])
  return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]), a: alpha }
}

/**
 * Any CSS color as sRGB. Computed colors arrive in whatever space they were
 * authored or mixed in (`color(srgb …)`, `oklab(…)`), so anything this can't
 * read directly goes through the browser's relative color conversion.
 */
export function toRgba(value: string): Rgba | null {
  const key = value.trim()
  const known = cache.get(key)
  if (known !== undefined) return known
  let result = parse(key)
  if (!result && typeof document !== 'undefined') {
    converter ??= document.documentElement.appendChild(Object.assign(document.createElement('i'), { hidden: true }))
    converter.style.color = ''
    converter.style.color = `color(from ${key} srgb r g b / alpha)`
    result = converter.style.color ? parse(getComputedStyle(converter).color) : null
  }
  cache.set(key, result)
  return result
}

const over = (top: Rgba, bottom: Rgba): Rgba => ({
  r: top.r * top.a + bottom.r * (1 - top.a),
  g: top.g * top.a + bottom.g * (1 - top.a),
  b: top.b * top.a + bottom.b * (1 - top.a),
  a: 1,
})

function luminance({ r, g, b }: Rgba): number {
  const [red, green, blue] = [r, g, b].map((channel) => {
    const c = channel / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

/** WCAG 2 contrast ratio of text over the surface behind it. */
export function contrastRatio(text: Rgba, surface: Rgba): number {
  const [light, dark] = [luminance(over(text, surface)), luminance(surface)].sort((a, b) => b - a)
  return (light + 0.05) / (dark + 0.05)
}

/** The opaque color painted behind an element: its nearest painted backgrounds, composited onto the page. */
export function surfaceBehind(element: Element): Rgba {
  const layers: Rgba[] = []
  for (let node: Element | null = element; node; node = node.parentElement) {
    const color = toRgba(getComputedStyle(node).backgroundColor)
    if (color && color.a > 0) {
      layers.push(color)
      if (color.a >= 1) break
    }
  }
  return layers.reduceRight((below, layer) => over(layer, below), { r: 255, g: 255, b: 255, a: 1 })
}

export function toHex({ r, g, b }: Rgba): string {
  return `#${[r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('').toUpperCase()}`
}

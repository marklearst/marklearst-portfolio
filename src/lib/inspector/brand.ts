// The site's color rule for its accent. One number goes in, a hue from 0 to
// 359, along with what the color has to hold: enough contrast under its label,
// enough against each surface it is seen on. Of every tone at that hue that
// holds all of it, the rule takes the one with the most color. When the
// requirements can all be held, what it returns holds them, whatever hue is
// asked for. When they can't, it returns the nearest miss.

export interface Tone {
  hex: string
  /** sRGB components from 0 to 1, as DTCG stores them. */
  components: [number, number, number]
}

/** One thing a tone has to hold: at least `floor` to 1 against the color `against`. */
export interface Requirement {
  against: string
  floor: number
}

const MAX_CHROMA = 0.22
const clamp = (value: number) => Math.min(1, Math.max(0, value))

function oklchToLinear(lightness: number, chroma: number, hue: number): [number, number, number] {
  const radians = (hue * Math.PI) / 180
  const a = chroma * Math.cos(radians)
  const b = chroma * Math.sin(radians)
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

const inGamut = (rgb: readonly number[]) => rgb.every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4)

/** The most chroma sRGB can hold at this lightness and hue, up to the rule's ceiling. */
function fitChroma(lightness: number, hue: number): number {
  if (inGamut(oklchToLinear(lightness, MAX_CHROMA, hue))) return MAX_CHROMA
  let low = 0
  let high = MAX_CHROMA
  for (let i = 0; i < 22; i += 1) {
    const middle = (low + high) / 2
    if (inGamut(oklchToLinear(lightness, middle, hue))) low = middle
    else high = middle
  }
  return low
}

const encode = (channel: number) => (channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055)
const decode = (channel: number) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)

function channels(hex: string): [number, number, number] {
  const digits = hex.replace('#', '')
  return [0, 2, 4].map((i) => Number.parseInt(digits.slice(i, i + 2), 16) / 255) as [number, number, number]
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map(decode)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast between two sRGB colors. */
export function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

function toneAt(lightness: number, chroma: number, hue: number): Tone {
  const components = oklchToLinear(lightness, chroma, hue).map((channel) => clamp(encode(clamp(channel))))
  const hex = `#${components.map((channel) => Math.round(channel * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`
  return { hex, components: channels(hex).map((channel) => Number(channel.toFixed(4))) as [number, number, number] }
}

/** Chroma has to grow by more than this to count as more color. Smaller differences are rounding. */
const MORE_COLOR = 1e-4

/**
 * The accent for a hue. Lightness is walked from dark to light, and each step is a
 * tone at the most chroma sRGB holds there. The rule keeps the tone with the most
 * chroma among those that hold every requirement. When several tie, it keeps the
 * one that sits nearest its floors, so no contrast is spent that nothing asked for.
 *
 * Requirements can pull apart: a light label wants a dark tone, and a dark page
 * wants a light one. When no tone holds them all, the rule returns the tone
 * that comes closest on its worst requirement, so the miss is as small as it can be.
 */
export function accentFor(hue: number, requirements: readonly Requirement[]): Tone {
  let best: Tone | undefined
  let most = -1
  let spare = Infinity
  let closest: Tone | undefined
  let margin = -1
  for (let step = 300; step <= 970; step += 1) {
    const lightness = step / 1000
    const chroma = fitChroma(lightness, hue)
    const tone = toneAt(lightness, chroma, hue)
    // How well the worst requirement is met: 1 is exactly at its floor.
    const worst = Math.min(...requirements.map(({ against, floor }) => contrast(tone.hex, against) / floor))
    if (worst > margin) {
      margin = worst
      closest = tone
    }
    if (worst < 1) continue
    if (chroma > most + MORE_COLOR || (chroma > most - MORE_COLOR && worst < spare)) {
      most = Math.max(most, chroma)
      spare = worst
      best = tone
    }
  }
  return (best ?? closest)!
}

/** The OKLCH hue of an sRGB color, in degrees. */
export function hueOf(hex: string): number {
  const [r, g, b] = channels(hex).map(decode)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return ((Math.atan2(bAxis, a) * 180) / Math.PI + 360) % 360
}

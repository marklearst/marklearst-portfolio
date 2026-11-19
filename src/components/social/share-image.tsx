import type { CSSProperties } from 'react'
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import decompress from 'wawoff2/decompress'
import { toHex, toRgba } from '@/lib/inspector/color'
import { tokenValues, type TokenPath } from '@/tokens/generated/tokens'
import { FINAL_TITLE, HERO_TITLES, RESTING_SPLIT } from '@/components/home/hero-titles'
import { imageSize } from '@/lib/social-metadata'

export { imageSize }

// Decode the existing webfonts in server memory. Only the finished PNG is served.
async function readArtwork() {
  const [regular, medium, wordmark] = await Promise.all([
    readFile(join(process.cwd(), 'public/fonts/wotfard/wotfard-regular-webfont.woff2')),
    readFile(join(process.cwd(), 'public/fonts/wotfard/wotfard-medium-webfont.woff2')),
    readFile(join(process.cwd(), 'src/components/social/wordmark.png')),
  ])
  // The decoder returns a view into a reusable WASM buffer. Copy each face
  // before decoding the next, so their glyph tables stay independent.
  return {
    fonts: [
      { name: 'Wotfard', weight: 400 as const, data: (await decompress(regular)).slice().buffer },
      { name: 'Wotfard', weight: 500 as const, data: (await decompress(medium)).slice().buffer },
    ],
    wordmark: `data:image/png;base64,${wordmark.toString('base64')}`,
  }
}
let artwork: ReturnType<typeof readArtwork> | undefined

// ImageResponse renders outside the browser. Give it the resolved dark-theme colors.
function color(path: Extract<TokenPath, `semantic.color.${string}`>) {
  const rgba = toRgba(tokenValues[path])
  if (!rgba) throw new Error(`Unrenderable color at ${path}`)
  return toHex(rgba)
}

// Satori takes image pixels. The site's type scale is authored in rem.
function fontSize(path: Extract<TokenPath, `font.size.${string}`>) {
  return parseFloat(tokenValues[path]) * 16
}

const ink = color('semantic.color.ink.primary')
const onAccent = color('semantic.color.ink.onAccent')
const accent = color('semantic.color.accent.primary')
const gutter = parseFloat(tokenValues['space.12'])
const sheetWidth = imageSize.width - 2 * gutter
const sheetHeight = 392
const tracking = `${tokenValues['semantic.type.specimen.tracking']}em`
const leading = Number(tokenValues['font.leading.100'])
const headlineSize = fontSize('font.size.800')
const rowHeight = 160
// Center the ink from F's cap to g's descender, as opposed to the line boxes.
// Wotfard Medium uses 2048 units per em and hhea ascender/descender 2017/-501.
const capHeight = headlineSize * 1434 / 2048
const descent = headlineSize * 442 / 2048
const baseline = (sheetHeight - rowHeight + capHeight - descent) / 2
const lineBoxBaseline = (sheetHeight - 2 * rowHeight) / 2 + headlineSize * (leading + (2017 - 501) / 2048) / 2
const guides = [baseline - capHeight, baseline, baseline + rowHeight - capHeight, baseline + rowHeight]

type ShareCard = {
  title?: string
  caption: string
  section?: string
}

function Lettering({ title, outline, split }: { title?: string; outline: boolean; split: number }) {
  const letters: CSSProperties = outline
    // Satori omits the glyph path entirely for transparent text. The red fill
    // leaves the outer stroke visible and masks the guides inside each letter.
    ? { color: accent, WebkitTextStroke: `5px ${onAccent}` }
    : { color: ink }
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'absolute',
      top: title ? 0 : baseline - lineBoxBaseline, left: outline ? -split : 0, width: sheetWidth, height: sheetHeight,
      paddingLeft: gutter, paddingRight: gutter, fontWeight: Number(tokenValues['font.weight.medium']),
    }}>
      {title ? (
        <div style={{ fontSize: fontSize(title.length < 14 ? 'font.size.800' : 'font.size.700'), letterSpacing: tracking, lineHeight: leading, textWrap: 'balance', ...letters }}>{title}</div>
      ) : HERO_TITLES[FINAL_TITLE].map((word, i) => (
        <div key={word} style={{ fontSize: headlineSize, letterSpacing: tracking, height: rowHeight, lineHeight: leading, marginLeft: i * 142, ...letters }}>{word}</div>
      ))}
    </div>
  )
}

export async function shareImage({ title, caption, section }: ShareCard) {
  const { fonts, wordmark } = await (artwork ??= readArtwork())
  const split = Math.round(sheetWidth * (title ? 0.4 : RESTING_SPLIT / 100))
  return new ImageResponse(
    <div style={{
      display: 'flex', flexDirection: 'column', padding: `0 ${gutter}px`,
      width: '100%', height: '100%', background: color('semantic.color.surface.canvas'), color: ink, fontFamily: tokenValues['semantic.font.body'][0],
    }}>
      <div style={{ display: 'flex', height: 112, alignItems: 'center', justifyContent: 'space-between' }}>
        <img alt='' src={wordmark} width={265.5} height={57} />
        {section && <span style={{ fontSize: fontSize('font.size.400'), color: color('semantic.color.ink.secondary') }}>{section}</span>}
      </div>
      <div style={{
        display: 'flex', position: 'relative', overflow: 'hidden', width: sheetWidth, height: sheetHeight,
        borderRadius: tokenValues['radius.4'], background: color('semantic.color.surface.raised'),
      }}>
        <Lettering title={title} outline={false} split={split} />
        <div style={{
          display: 'flex', position: 'absolute', left: split, top: 0, width: sheetWidth - split, height: sheetHeight,
          overflow: 'hidden', background: accent,
        }}>
          {!title && guides.map(y => (
            <div key={y} style={{ position: 'absolute', top: y, left: 0, width: '100%', height: 1, background: onAccent, opacity: 0.62 }} />
          ))}
          <Lettering title={title} outline split={split} />
        </div>
        {!title && <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute',
          left: split - 16, top: (guides[1] + guides[2]) / 2 - 16, width: 32, height: 32,
          borderRadius: tokenValues['radius.2'], background: accent,
        }}>
          <svg width='18' height='24' viewBox='0 0 12 16' fill='none' stroke={onAccent} strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M4.5 4 1.5 8l3 4M7.5 4l3 4-3 4' />
          </svg>
        </div>}
      </div>
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', fontSize: 2 * fontSize('font.size.200'), lineHeight: Number(tokenValues['font.leading.200']), color: color('semantic.color.ink.secondary') }}>
        {caption}
      </div>
    </div>,
    { ...imageSize, fonts },
  )
}

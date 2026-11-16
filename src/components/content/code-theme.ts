import type { CSSProperties } from 'react'

// Syntax colors are semantic tokens, so code blocks follow the theme and the inspector can read them.
const ink = 'var(--color-ink-primary)'
const secondary = 'var(--color-ink-secondary)'
const muted = 'var(--color-ink-muted)'
const accent = 'var(--color-accent-text)'

export const codeTheme: Record<string, CSSProperties> = {
  'code[class*="language-"]': {
    color: ink,
    background: 'transparent',
    fontFamily: 'var(--font-mono)',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.6',
    fontSize: '16px',
    tabSize: 4,
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: ink,
    background: 'transparent',
    fontFamily: 'var(--font-mono)',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.6',
    fontSize: '16px',
    tabSize: 4,
    hyphens: 'none',
    padding: '0',
    margin: '0',
    overflow: 'auto',
  },
  comment: {
    color: muted,
    fontStyle: 'italic',
  },
  prolog: {
    color: muted,
  },
  doctype: {
    color: muted,
  },
  cdata: {
    color: muted,
  },
  punctuation: {
    color: 'color-mix(in srgb, var(--color-ink-primary) 70.2%, transparent)',
  },
  '.namespace': {
    opacity: '.7',
  },
  property: {
    color: ink,
  },
  tag: {
    color: accent,
  },
  constant: {
    color: muted,
  },
  symbol: {
    color: muted,
  },
  deleted: {
    color: accent,
  },
  boolean: {
    color: muted,
  },
  number: {
    color: muted,
  },
  selector: {
    color: secondary,
  },
  'attr-name': {
    color: secondary,
  },
  string: {
    color: secondary,
  },
  char: {
    color: secondary,
  },
  builtin: {
    color: ink,
  },
  inserted: {
    color: secondary,
  },
  operator: {
    color: accent,
  },
  entity: {
    color: secondary,
    cursor: 'help',
  },
  url: {
    color: ink,
  },
  '.language-css .token.string': {
    color: secondary,
  },
  '.style .token.string': {
    color: secondary,
  },
  variable: {
    color: ink,
  },
  atrule: {
    color: secondary,
  },
  'attr-value': {
    color: secondary,
  },
  function: {
    color: secondary,
  },
  'class-name': {
    color: ink,
  },
  keyword: {
    color: accent,
  },
  regex: {
    color: accent,
  },
  important: {
    color: accent,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
}

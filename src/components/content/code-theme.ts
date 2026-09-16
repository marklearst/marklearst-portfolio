import type { CSSProperties } from 'react'
import { MONOKAI } from '@/lib/monokai-colors'

// Restrained syntax colors follow the portfolio token source.
export const codeTheme: Record<string, CSSProperties> = {
  'code[class*="language-"]': {
    color: MONOKAI.foreground,
    background: 'transparent',
    fontFamily: '"MonoLisa", "SF Mono", Consolas, monospace',
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
    color: MONOKAI.foreground,
    background: 'transparent',
    fontFamily: '"MonoLisa", "SF Mono", Consolas, monospace',
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
    color: MONOKAI.purple,
    fontStyle: 'italic',
  },
  prolog: {
    color: MONOKAI.purple,
  },
  doctype: {
    color: MONOKAI.purple,
  },
  cdata: {
    color: MONOKAI.purple,
  },
  punctuation: {
    color: `${MONOKAI.foreground}b3`,
  },
  '.namespace': {
    opacity: '.7',
  },
  property: {
    color: MONOKAI.cyan,
  },
  tag: {
    color: MONOKAI.pink,
  },
  constant: {
    color: MONOKAI.purple,
  },
  symbol: {
    color: MONOKAI.purple,
  },
  deleted: {
    color: MONOKAI.pink,
  },
  boolean: {
    color: MONOKAI.purple,
  },
  number: {
    color: MONOKAI.purple,
  },
  selector: {
    color: MONOKAI.green,
  },
  'attr-name': {
    color: MONOKAI.green,
  },
  string: {
    color: MONOKAI.yellow,
  },
  char: {
    color: MONOKAI.yellow,
  },
  builtin: {
    color: MONOKAI.cyan,
  },
  inserted: {
    color: MONOKAI.green,
  },
  operator: {
    color: MONOKAI.pink,
  },
  entity: {
    color: MONOKAI.yellow,
    cursor: 'help',
  },
  url: {
    color: MONOKAI.cyan,
  },
  '.language-css .token.string': {
    color: MONOKAI.green,
  },
  '.style .token.string': {
    color: MONOKAI.green,
  },
  variable: {
    color: MONOKAI.foreground,
  },
  atrule: {
    color: MONOKAI.yellow,
  },
  'attr-value': {
    color: MONOKAI.yellow,
  },
  function: {
    color: MONOKAI.green,
  },
  'class-name': {
    color: MONOKAI.cyan,
  },
  keyword: {
    color: MONOKAI.pink,
  },
  regex: {
    color: MONOKAI.orange,
  },
  important: {
    color: MONOKAI.orange,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
}

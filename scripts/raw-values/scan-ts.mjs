// Scans TypeScript and TSX with the TypeScript compiler's syntax tree, so a
// string is one node however many lines it spans, a template literal's
// ${expressions} are never read as text, and every literal goes through
// exactly one of these paths:
//
// - Style entries: an object property whose key is a CSS property, such as
//   { padding: '80px' }, { lineHeight: 0.9 }, or { ['padding']: 12 },
//   classified like that property. A bare number means px, as in React,
//   except on unitless properties.
// - Style assignments: el.style.padding = '12px' and
//   style.setProperty('--gap', '12px') classify like the property they set.
// - Motion: duration and delay numbers and easing strings in objects, as
//   passed to Element.animate(); a number passed to animate() as its options;
//   setTimeout and setInterval delays; and a numeric constant whose name ends
//   in duration, delay, timeout, or ms.
// - JSX color attributes: fill, stroke, color, and the SVG stop, flood, and
//   lighting colors.
// - Every other string: Tailwind classes, then literal colors, literal var()
//   fallbacks, and easing functions in what's left. Object keys that are
//   strings, as in clsx({ 'text-sm': active }), count their classes.
//
// Skipped: other JSX attributes (href, d, alt, aria-*), object values under
// keys that are never styles (href, src, id...), module paths, and string
// types. Values computed at runtime, imported constants, and the result of a
// ternary aren't literals; the strings inside a ternary still go through the
// last path.
//
// A comment containing "raw:" exempts every node that starts on its line, and
// everything inside those nodes. A comment that stands alone on its line
// exempts the next line the same way, so a comment above a property, an
// attribute, a JSX element, or a statement covers all of it.
import ts from 'typescript'
import { classifyDeclaration, classifyText, isDecisionProperty, merge } from './classify.mjs'
import { classifyClassList } from './tailwind.mjs'

const UNITLESS = new Set(['line-height', 'font-weight', 'z-index'])
const COLOR_ATTRIBUTES = new Set(['fill', 'stroke', 'color', 'stopColor', 'floodColor', 'lightingColor'])
const CLASS_ATTRIBUTES = new Set(['className', 'class'])
const NEVER_STYLE_KEYS = new Set(['href', 'src', 'id', 'url', 'path', 'key', 'alt', 'title', 'name', 'slug', 'to', 'd', 'label', 'description', 'summary', 'text', 'content', 'value', 'type', 'role', 'rel', 'target'])
const TIMERS = new Set(['setTimeout', 'setInterval'])
// fadeDuration, retryDelay, timeoutMs, FADE_MS: the timing word has to be its own word, so "items" isn't a duration.
const TIMING_NAME = /(?:^|[a-z0-9_])(?:[Dd]uration|[Dd]elay|[Tt]imeout|Ms)$|_(?:DURATION|DELAY|TIMEOUT|MS)$|^(?:DURATION|DELAY|TIMEOUT|MS|ms)$/
const kebab = (key) => (key.startsWith('--') ? key : key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`))

/** Strip the wrappers that don't change a literal: parentheses, `as const`, `!`, `satisfies`. */
function unwrap(node) {
  while (node && (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isSatisfiesExpression(node) || ts.isNonNullExpression(node))) {
    node = node.expression
  }
  return node
}

const isStringish = (node) => ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)

/** The name of an object property, including ['padding'] and `padding` as computed keys. */
function keyOf(name) {
  if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name) || ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name) || ts.isNumericLiteral(name)) return name.text
  if (ts.isComputedPropertyName(name)) {
    const inner = unwrap(name.expression)
    if (ts.isStringLiteral(inner) || ts.isNoSubstitutionTemplateLiteral(inner)) return inner.text
  }
  return null
}

/** The literal text of a string or template, with each ${expression} as an opaque token reference. */
function staticText(node) {
  node = unwrap(node)
  if (!node) return null
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isTemplateExpression(node)) return node.head.text + node.templateSpans.map((span) => ` var(--expression) ${span.literal.text}`).join('')
  return null
}

function numericValue(node) {
  node = unwrap(node)
  if (!node) return null
  if (ts.isNumericLiteral(node)) return Number(node.text.replace(/_/g, ''))
  if (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(unwrap(node.operand))) {
    const n = Number(unwrap(node.operand).text.replace(/_/g, ''))
    return node.operator === ts.SyntaxKind.MinusToken ? -n : node.operator === ts.SyntaxKind.PlusToken ? n : null
  }
  return null
}

/** The value a style entry sets, as CSS text, or null when it isn't a literal. */
function styleValue(node, prop) {
  const text = staticText(node)
  if (text !== null) return text
  const n = numericValue(node)
  if (n === null) return null
  return UNITLESS.has(prop) || n === 0 ? String(n) : `${n}px`
}

/** The JSX attribute a string feeds, through cn(), ternaries, arrays, and templates. */
function jsxAttributeOf(node) {
  for (let cur = node.parent; cur; cur = cur.parent) {
    if (ts.isJsxAttribute(cur)) return cur.name.getText()
    if (ts.isJsxExpression(cur) || ts.isParenthesizedExpression(cur) || ts.isConditionalExpression(cur) || ts.isBinaryExpression(cur)
      || ts.isCallExpression(cur) || ts.isArrayLiteralExpression(cur) || ts.isTemplateSpan(cur) || ts.isTemplateExpression(cur)
      || ts.isAsExpression(cur) || ts.isSatisfiesExpression(cur) || ts.isNonNullExpression(cur)) continue
    return null
  }
  return null
}

/** The object key a string is the value of, through the same wrappers. */
function objectKeyOf(node) {
  for (let cur = node.parent; cur; cur = cur.parent) {
    if (ts.isPropertyAssignment(cur)) return keyOf(cur.name)
    if (ts.isParenthesizedExpression(cur) || ts.isConditionalExpression(cur) || ts.isBinaryExpression(cur) || ts.isAsExpression(cur) || ts.isSatisfiesExpression(cur) || ts.isNonNullExpression(cur)) continue
    return null
  }
  return null
}

/** Strings that are never design values: module paths and string types. */
function isSkippedString(node) {
  const parent = node.parent
  return ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent) || ts.isExternalModuleReference(parent) || ts.isLiteralTypeNode(parent)
    || ts.isImportTypeNode(parent) || (ts.isCallExpression(parent) && parent.expression.kind === ts.SyntaxKind.ImportKeyword)
    || (ts.isElementAccessExpression(parent) && parent.argumentExpression === node)
}

/** Lines whose nodes a raw: comment exempts. */
function exemptLines(sf, text) {
  const seen = new Set()
  const comments = []
  const consider = (range) => {
    if (seen.has(range.pos)) return
    seen.add(range.pos)
    if (/\braw:/.test(text.slice(range.pos, range.end))) comments.push(range)
  }
  const visit = (node) => {
    for (const range of ts.getLeadingCommentRanges(text, node.pos) ?? []) consider(range)
    for (const range of ts.getTrailingCommentRanges(text, node.end) ?? []) consider(range)
    if (ts.isJsxExpression(node) && !node.expression) {
      for (const m of text.slice(node.pos, node.end).matchAll(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g)) consider({ pos: node.pos + m.index, end: node.pos + m.index + m[0].length })
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  const lineAt = (pos) => sf.getLineAndCharacterOfPosition(pos).line + 1
  const lines = new Set()
  for (const { pos, end } of comments) {
    for (let line = lineAt(pos); line <= lineAt(end); line++) lines.add(line)
    const before = text.slice(text.lastIndexOf('\n', pos - 1) + 1, pos)
    if (/^\s*\{?\s*$/.test(before)) lines.add(lineAt(end) + 1)
  }
  return lines
}

/** Scan one TS or TSX source. */
export function scanTs(source, fileName = 'input.tsx') {
  const kind = fileName.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.TSX
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, kind)
  const lineAt = (pos) => sf.getLineAndCharacterOfPosition(pos).line + 1
  const sourceLines = source.split('\n')
  const exempt = exemptLines(sf, source)
  const consumed = new Set()
  const hits = []

  const isExempt = (node) => {
    for (let cur = node; cur && !ts.isSourceFile(cur); cur = cur.parent) {
      if (exempt.has(lineAt(cur.getStart(sf)))) return true
    }
    return false
  }

  const push = (counts, node) => {
    if (!Object.keys(counts).length || isExempt(node)) return
    const line = lineAt(node.getStart(sf))
    const text = sourceLines[line - 1].trim().slice(0, 140)
    for (const [category, n] of Object.entries(counts)) for (let i = 0; i < n; i++) hits.push({ category, line, text })
  }

  // A style entry, a class field, a style assignment, or setProperty: classify the value like its property.
  const styleEntry = (key, init) => {
    if (key === null || init === undefined || !isDecisionProperty(kebab(key))) return false
    const prop = kebab(key)
    const value = styleValue(init, prop)
    if (value === null) return false
    push(classifyDeclaration(prop, value), init)
    consumed.add(unwrap(init))
    return true
  }

  const visit = (node) => {
    if ((ts.isPropertyAssignment(node) || ts.isPropertyDeclaration(node)) && node.initializer) {
      const key = keyOf(node.name)
      const init = node.initializer
      if (!styleEntry(key, init) && (key === 'duration' || key === 'delay')) {
        const n = numericValue(init)
        if (n !== null && n !== 0) push({ duration: 1 }, init)
      } else if (key === 'easing') {
        const text = staticText(init)
        if (text !== null) {
          push(classifyDeclaration('transition-timing-function', text), init)
          consumed.add(unwrap(init))
        }
      }
      // clsx({ 'text-sm': active }): a string key is a class list.
      if (ts.isStringLiteral(node.name) || ts.isNoSubstitutionTemplateLiteral(node.name)) {
        push(classifyClassList(node.name.text).hits, node.name)
        consumed.add(node.name)
      }
    }

    if (ts.isCallExpression(node)) {
      const callee = ts.isIdentifier(node.expression) ? node.expression.text : ts.isPropertyAccessExpression(node.expression) ? node.expression.name.text : null
      const [first, second] = node.arguments
      if (callee && (TIMERS.has(callee) || callee === 'animate') && second) {
        const n = numericValue(second)
        if (n !== null && n !== 0) push({ duration: 1 }, second)
      }
      if (callee === 'setProperty' && first && second) styleEntry(staticText(first), second)
    }

    // el.style.padding = '12px'
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(node.left)) {
      styleEntry(node.left.name.text, node.right)
    }

    // const FADE_MS = 180
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && TIMING_NAME.test(node.name.text) && node.initializer) {
      const n = numericValue(node.initializer)
      if (n !== null && n !== 0) push({ duration: 1 }, node.initializer)
    }

    if (isStringish(node) && !consumed.has(node) && !isSkippedString(node)) {
      const text = staticText(node)
      const attribute = jsxAttributeOf(node)
      const key = attribute ? null : objectKeyOf(node)
      if (attribute && COLOR_ATTRIBUTES.has(attribute)) {
        push(classifyDeclaration(kebab(attribute), text), node)
      } else if (attribute ? CLASS_ATTRIBUTES.has(attribute) : !(key && NEVER_STYLE_KEYS.has(key))) {
        const { hits: classes, rest } = classifyClassList(text)
        push(merge(classes, classifyText(rest)), node)
      }
    }

    // A template's ${expressions} are code, visited on their own.
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return hits
}

/** A declaration that reads at least one custom property. */
export interface IndexedDeclaration {
  property: string
  value: string
  vars: readonly string[]
}

export interface IndexedRule {
  selector: string
  declarations: readonly IndexedDeclaration[]
  vars: ReadonlySet<string>
}

const VAR_NAME = /var\(\s*(--[\w-]+)/g

export function varsIn(value: string): string[] {
  return [...new Set([...value.matchAll(VAR_NAME)].map((match) => match[1]))]
}

/** Splits `a: 1; b: url(x;y)` into declarations without breaking on a semicolon inside brackets or quotes. */
function declarationsOf(cssText: string): IndexedDeclaration[] {
  const out: IndexedDeclaration[] = []
  let depth = 0
  let quote = ''
  let start = 0
  const push = (end: number) => {
    const text = cssText.slice(start, end)
    const colon = text.indexOf(':')
    if (colon > 0 && text.includes('var(')) {
      const value = text.slice(colon + 1).replace(/\s*!important\s*$/, '').trim()
      const vars = varsIn(value)
      if (vars.length) out.push({ property: text.slice(0, colon).trim(), value, vars })
    }
    start = end + 1
  }
  for (let i = 0; i < cssText.length; i += 1) {
    const char = cssText[i]
    if (quote) {
      if (char === quote && cssText[i - 1] !== '\\') quote = ''
    } else if (char === '"' || char === "'") quote = char
    else if (char === '(') depth += 1
    else if (char === ')') depth -= 1
    else if (char === ';' && depth === 0) push(i)
  }
  push(cssText.length)
  return out
}

/** A nested rule's selector, written out against its parent. */
function absoluteSelector(selector: string, parent: string | null): string {
  if (!parent) return selector
  return selector
    .split(',')
    .map((part) => (part.includes('&') ? part.replaceAll('&', `:is(${parent})`) : `:is(${parent}) ${part.trim()}`))
    .join(',')
}

/**
 * Every style rule in the document that reads a custom property. Conditions
 * (media, supports, layers) are not evaluated here: the index only proposes
 * candidates, and the browser's own cascade decides which one paints.
 */
export function buildCssIndex(root: Document = document): IndexedRule[] {
  const index: IndexedRule[] = []
  const walk = (rules: CSSRuleList, parent: string | null) => {
    for (const rule of rules) {
      if (rule instanceof CSSStyleRule) {
        const selector = absoluteSelector(rule.selectorText, parent)
        if (rule.style.cssText.includes('var(')) {
          const declarations = declarationsOf(rule.style.cssText)
          if (declarations.length) {
            index.push({ selector, declarations, vars: new Set(declarations.flatMap((declaration) => declaration.vars)) })
          }
        }
        if (rule.cssRules.length) walk(rule.cssRules, selector)
      } else if ('cssRules' in rule && !(rule instanceof CSSKeyframesRule)) {
        walk((rule as CSSGroupingRule).cssRules, parent)
      }
    }
  }
  for (const sheet of root.styleSheets) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue // A stylesheet from another origin can't be read.
    }
    walk(rules, null)
  }
  return index
}

/** The var-reading declarations of every rule that matches the element, plus its inline style. */
export function declarationsFor(element: Element, index: readonly IndexedRule[]): IndexedDeclaration[] {
  const out: IndexedDeclaration[] = []
  for (const rule of index) {
    let matches = false
    try {
      matches = element.matches(rule.selector)
    } catch {
      // A selector this browser can't parse matches nothing.
    }
    if (matches) out.push(...rule.declarations)
  }
  const inline = element.getAttribute('style')
  if (inline?.includes('var(')) out.push(...declarationsOf(inline))
  return out
}

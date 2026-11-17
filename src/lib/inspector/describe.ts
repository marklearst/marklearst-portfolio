// CSS Modules name a class `Hero-module__hash__name` in development and
// `hash_name` in a production build. Only the first carries the file's name.
const DEV_CLASS = /^(.+)-module__[\w-]+__(.+)$/
const BUILT_CLASS = /^[\w-]{6}_([A-Za-z][\w-]*)$/

/** Tags whose name already says what the element is. */
const NAMED: Record<string, string> = {
  p: 'Paragraph',
  a: 'Link',
  button: 'Button',
  img: 'Image',
  svg: 'Icon',
  li: 'List item',
  code: 'Code',
  pre: 'Code block',
  blockquote: 'Quote',
  figcaption: 'Caption',
  th: 'Table heading',
  td: 'Table cell',
  dt: 'Term',
  dd: 'Detail',
  summary: 'Disclosure',
  label: 'Label',
  input: 'Field',
  time: 'Date',
  kbd: 'Key',
}

/** Containers, which their class describes better than their tag does. */
const GENERIC: Record<string, string> = {
  div: 'Block',
  span: 'Text',
  section: 'Section',
  article: 'Article',
  header: 'Header',
  footer: 'Footer',
  nav: 'Navigation',
  main: 'Main',
  figure: 'Figure',
  ul: 'List',
  ol: 'List',
  dl: 'List',
  table: 'Table',
  details: 'Disclosure',
}

function sentence(local: string): string {
  const words = local.replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').toLowerCase().trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function moduleClass(element: Element): { module: string | null; local: string } | null {
  for (const name of element.classList) {
    const dev = DEV_CLASS.exec(name)
    if (dev) return { module: dev[1], local: dev[2] }
    const built = BUILT_CLASS.exec(name)
    if (built) return { module: null, local: built[1] }
  }
  return null
}

/** A plain name for an element, and the stylesheet rule that styles it when the class says so. */
export function describe(element: Element): { label: string; source: string | null } {
  const tag = element.localName
  const owner = moduleClass(element)
  const source = owner ? `${owner.module ? `${owner.module}.module.css ` : ''}.${owner.local}` : null
  const explicit = element.getAttribute('data-inspect')
  if (explicit) return { label: explicit, source }
  if (tag === 'section' || tag === 'article') {
    const ids = element.getAttribute('aria-labelledby')?.split(/\s+/) ?? []
    const label = element.getAttribute('aria-label') || ids.map(id => element.ownerDocument.getElementById(id)?.textContent?.trim()).filter(Boolean).join(' ')
    if (label) return { label, source }
  }
  if (/^h[1-6]$/.test(tag)) return { label: `Heading ${tag[1]}`, source }
  if (NAMED[tag]) return { label: NAMED[tag], source }
  return { label: owner ? sentence(owner.local) : (GENERIC[tag] ?? sentence(tag)), source }
}

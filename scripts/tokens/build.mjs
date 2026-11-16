#!/usr/bin/env node
// Builds the site's tokens with Primitree.
//
//   node scripts/tokens/build.mjs          write the generated files
//   node scripts/tokens/build.mjs --check  fail when a generated file is missing or stale
//
// Reads the DTCG sources and Resolver in src/tokens and the rules in
// primitree.config.ts. Every context goes into one graph: a context's override
// file becomes a conditional value on the token it reroutes, so one policy run
// covers the dark and light themes and both motion settings.
//
// Exit 1 on a policy finding or stale output. Exit 2 on a source or config error.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { registerHooks } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  applyResolver,
  createDTCGGraphFragment,
  cssVarName,
  emitCss,
  emitTypescript,
  flattenTokens,
  isReferenceValue,
  listContexts,
  listPermutations,
  typedCssValue,
  validateResolverContexts,
} from '@primitree/dtcg'
import { composeGraph, createGraphFragment, createSourceView, resolveView } from '@primitree/core'
import { createPolicy, evaluatePolicy } from '@primitree/core/policy'

const ROOT = process.cwd()
const TOKENS_DIR = 'src/tokens'
const SOURCE = 'site'
const OUT = {
  css: 'src/styles/generated/tokens.css',
  theme: 'src/styles/generated/theme.css',
  ts: 'src/tokens/generated/tokens.ts',
  document: 'src/tokens/generated/site.tokens.json',
  graph: 'src/tokens/generated/graph.json',
}

class SourceError extends Error {}

const readJson = async (file) => {
  try {
    return JSON.parse(await readFile(path.join(ROOT, file), 'utf8'))
  } catch (error) {
    throw new SourceError(`${file}: ${error.message}`)
  }
}
const unwrap = (result, what) => {
  if (!result.ok) throw new SourceError(`${what}: ${result.diagnostics[0].message}`)
  return result.value
}
const pointer = (tokenPath) => `/${tokenPath.split('.').join('/')}`
const tokenId = (tokenPath) => `source:${SOURCE}/token:${tokenPath}`
const refTarget = (value) => value.slice(1, -1)

// Every file the Resolver names, in the order it names them.
function resolverFiles(resolver) {
  const names = []
  const add = (sources) => {
    for (const source of sources ?? []) if (!names.includes(source.$ref)) names.push(source.$ref)
  }
  for (const set of Object.values(resolver.sets ?? {})) add(set.sources)
  for (const modifier of Object.values(resolver.modifiers ?? {})) {
    for (const sources of Object.values(modifier.contexts ?? {})) add(sources)
  }
  return names
}

async function loadPolicy() {
  // Loaded the way the Primitree CLI loads it: as TypeScript, whatever the package's module type.
  const moduleUrl = pathToFileURL(path.join(ROOT, 'primitree.config.ts'))
  const hooks = registerHooks({
    load: (url, context, nextLoad) =>
      nextLoad(url, url === moduleUrl.href ? { ...context, format: 'module-typescript' } : context),
  })
  let config
  try {
    config = (await import(moduleUrl.href)).default
  } catch (error) {
    throw new SourceError(`primitree.config.ts: ${error.message}`)
  } finally {
    hooks.deregister()
  }
  const source = config?.sources?.[SOURCE]
  if (!source) throw new SourceError(`primitree.config.ts has no source named "${SOURCE}".`)
  const input = {
    id: 'marklearst',
    viewId: SOURCE,
    layers: source.architecture.layers.map((layer) => ({ ...layer, references: layer.references ?? [] })),
    ownership: source.ownership ?? {},
  }
  return { input, policy: unwrap(createPolicy(input), 'primitree.config.ts') }
}

// One graph for every context. The default context gives each token its base
// value. Each override file adds a value that applies under its condition.
function buildFragment(files, resolver, defaultDocument) {
  const base = unwrap(
    createDTCGGraphFragment(defaultDocument, { source: SOURCE, uri: TOKENS_DIR }),
    'Default context',
  )
  const order = (resolver.resolutionOrder ?? []).map((entry) => entry.$ref)
  const owner = new Map()
  for (const set of Object.values(resolver.sets ?? {})) {
    for (const { $ref } of set.sources ?? []) {
      for (const { path: tokenPath } of flattenTokens(files[$ref])) owner.set(tokenPath, $ref)
    }
  }

  const tokens = new Map(
    base.tokens.map((token) => {
      const tokenPath = token.path.join('.')
      const provenance = [{ uri: `${TOKENS_DIR}/${owner.get(tokenPath)}`, pointer: pointer(tokenPath) }]
      return [
        tokenPath,
        {
          id: token.id,
          sourceId: token.sourceId,
          name: token.name,
          path: [...token.path],
          type: token.type,
          values: token.values.map((authored) => ({
            value: authored.value,
            conditions: {},
            priority: 0,
            provenance,
          })),
          provenance,
        },
      ]
    }),
  )

  for (const [axis, modifier] of Object.entries(resolver.modifiers ?? {})) {
    // A later axis in the Resolver wins a tie, the same way a later source overrides an earlier one.
    const priority = order.indexOf(`#/modifiers/${axis}`)
    for (const [context, sources] of Object.entries(modifier.contexts ?? {})) {
      for (const { $ref } of sources) {
        for (const { path: tokenPath, token: authored } of flattenTokens(files[$ref])) {
          const target = tokens.get(tokenPath)
          if (!target) {
            throw new SourceError(
              `${$ref}: ${tokenPath} has no default value. A context can reroute a token, not add one.`,
            )
          }
          const raw = authored.$value
          if (isReferenceValue(raw) && !tokens.has(refTarget(raw))) {
            throw new SourceError(`${$ref}: ${tokenPath} references ${raw}, which does not exist.`)
          }
          target.values.push({
            value: isReferenceValue(raw)
              ? { kind: 'reference', target: tokenId(refTarget(raw)) }
              : { kind: 'literal', value: raw },
            conditions: { [axis]: context },
            priority,
            provenance: [{ uri: `${TOKENS_DIR}/${$ref}`, pointer: pointer(tokenPath) }],
          })
        }
      }
    }
  }

  return {
    source: { id: base.source.id, type: base.source.type, precedence: 0, provenance: [{ uri: TOKENS_DIR }] },
    groups: [],
    tokens: [...tokens.values()],
  }
}

function adapterEntries(group) {
  return Object.entries(group ?? {}).map(([name, entry]) => {
    const { token, css } = typeof entry === 'string' ? { token: entry } : entry
    return { name, token, css }
  })
}

// The site's own names, written as aliases of Primitree's variables.
function emitTheme(adapter, types) {
  const declaration = ({ name, token, css }) => {
    if (!types.has(token)) throw new SourceError(`css-adapter.json: ${name} points at ${token}, which does not exist.`)
    const reference = `var(${cssVarName(token)})`
    return `  ${name}: ${css ? css.replace('{var}', reference) : reference};`
  }
  const tailwind = adapterEntries(adapter.tailwind)
  const all = [...tailwind, ...adapterEntries(adapter.root)]
  return [
    '/* Generated by scripts/tokens/build.mjs from src/tokens/css-adapter.json. Do not edit. */',
    '',
    '/* Tailwind reads only the site palette, so no utility can paint an ungoverned color. */',
    '@theme inline {',
    '  --color-*: initial;',
    ...tailwind.map(declaration),
    '}',
    '',
    '/* The same names for CSS Modules, set where the tokens are set. */',
    ':root {',
    ...all.map(declaration),
    '}',
    '',
  ].join('\n')
}

// Primitree writes a context under a data attribute. Until it can also write
// one under a media query, the site repeats the override for visitors whose
// page has not run the script that sets the attribute.
function emitSystemFallbacks(adapter, files, resolver, types) {
  const blocks = []
  for (const [axis, contexts] of Object.entries(adapter.followSystem ?? {})) {
    for (const [context, query] of Object.entries(contexts)) {
      const sources = resolver.modifiers?.[axis]?.contexts?.[context]
      if (!sources) throw new SourceError(`css-adapter.json: the Resolver has no ${axis} context named ${context}.`)
      const lines = sources.flatMap(({ $ref }) =>
        flattenTokens(files[$ref]).map(({ path: tokenPath, token }) => {
          const value = isReferenceValue(token.$value)
            ? `var(${cssVarName(refTarget(token.$value))})`
            : typedCssValue(token.$value, types.get(tokenPath))
          return `    ${cssVarName(tokenPath)}: ${value};`
        }),
      )
      blocks.push(`@media ${query} {\n  :root:not([data-${axis}]) {\n${lines.join('\n')}\n  }\n}`)
    }
  }
  return blocks.length ? `\n/* Site adapter: follow the system setting before the attribute is set. */\n\n${blocks.join('\n\n')}\n` : ''
}

async function build() {
  const resolver = await readJson(`${TOKENS_DIR}/tokens.resolver.json`)
  const adapter = await readJson(`${TOKENS_DIR}/css-adapter.json`)
  const files = {}
  for (const name of resolverFiles(resolver)) files[name] = await readJson(`${TOKENS_DIR}/${name}`)

  for (const validation of validateResolverContexts(files, resolver)) {
    const label = Object.entries(validation.contexts).map(([axis, context]) => `${axis}=${context}`).join(', ')
    if (!validation.ok) throw new SourceError(`Context ${label}: ${validation.error}`)
    if (validation.untypedTokenPaths.length) {
      throw new SourceError(`Context ${label}: no type for ${validation.untypedTokenPaths.join(', ')}.`)
    }
  }

  const { input: policyInput, policy } = await loadPolicy()
  const defaultDocument = applyResolver(files, resolver)
  const fragmentInput = buildFragment(files, resolver, defaultDocument)
  const fragment = unwrap(createGraphFragment(fragmentInput), 'Token graph')
  const graph = unwrap(composeGraph([fragment]), 'Token graph')
  const view = unwrap(createSourceView(graph, { id: SOURCE }), 'Token graph')
  const permutations = listPermutations(resolver)
  for (const selection of permutations) {
    const label = Object.entries(selection).map(([axis, context]) => `${axis}=${context}`).join(', ')
    unwrap(resolveView(graph, view, selection), `Context ${label}`)
  }
  const report = unwrap(evaluatePolicy({ graph, view }, policy), 'Policy')

  const types = new Map(fragmentInput.tokens.map((token) => [token.path.join('.'), token.type]))
  const contexts = Object.fromEntries(
    Object.entries(listContexts(resolver)).map(([axis, options]) => [
      axis,
      { default: resolver.modifiers[axis].default ?? options[0], options },
    ]),
  )
  const aliases = Object.fromEntries(
    [...adapterEntries(adapter.tailwind), ...adapterEntries(adapter.root)].map(({ name, token, css }) => [
      name,
      css ? { token, css } : { token },
    ]),
  )
  const check = {
    command: 'primitree check',
    tokens: graph.tokens.length,
    references: graph.references.length,
    layers: policy.layers.length,
    contexts: permutations.length,
    findings: report.findings.map(({ ruleId, path: tokenPath, message, layerId, disposition }) => ({
      ruleId,
      path: tokenPath.join('.'),
      message,
      layerId,
      disposition,
    })),
    summary: report.summary,
    exit: report.summary.active > 0 ? 1 : 0,
  }
  // The version of the Primitree that ran, read from the package this script resolved.
  const corePackage = path.join(path.dirname(fileURLToPath(import.meta.resolve('@primitree/core'))), '../package.json')
  const primitree = JSON.parse(await readFile(corePackage, 'utf8')).version

  const banner = 'Generated by Primitree from src/tokens. Do not edit.'
  const outputs = {
    [OUT.css]: emitCss(files, resolver, { banner }) + emitSystemFallbacks(adapter, files, resolver, types),
    [OUT.theme]: emitTheme(adapter, types),
    [OUT.ts]: emitTypescript(files, resolver),
    [OUT.document]: `${JSON.stringify(defaultDocument, null, 2)}\n`,
    [OUT.graph]: `${JSON.stringify(
      {
        schemaVersion: 1,
        primitree,
        policy: policyInput,
        contexts,
        cssVars: Object.fromEntries([...types.keys()].map((tokenPath) => [tokenPath, cssVarName(tokenPath)])),
        aliases,
        check,
        fragment: fragmentInput,
      },
      null,
      1,
    )}\n`,
  }
  return { outputs, check }
}

async function main() {
  const args = process.argv.slice(2)
  if (args.some((arg) => arg !== '--check')) throw new SourceError('Usage: node scripts/tokens/build.mjs [--check]')
  const { outputs, check } = await build()

  for (const finding of check.findings) {
    console.error(`${finding.ruleId} ${finding.path}: ${finding.message}${finding.disposition === 'baseline' ? ' (baseline)' : ''}`)
  }
  const summary = `${check.tokens} tokens, ${check.layers} layers, ${check.contexts} contexts, ${check.summary.active} ${check.summary.active === 1 ? 'finding' : 'findings'}`

  if (args.includes('--check')) {
    const stale = []
    for (const [file, contents] of Object.entries(outputs)) {
      let existing
      try {
        existing = await readFile(path.join(ROOT, file), 'utf8')
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
      if (existing !== contents) stale.push(file)
    }
    if (stale.length) {
      console.error(`Generated token output is missing or stale:\n${stale.map((file) => `- ${file}`).join('\n')}\nRun pnpm tokens:build to update it.`)
      process.exitCode = 1
    }
  } else {
    for (const [file, contents] of Object.entries(outputs)) {
      await mkdir(path.dirname(path.join(ROOT, file)), { recursive: true })
      await writeFile(path.join(ROOT, file), contents)
    }
  }

  if (check.exit !== 0) {
    console.error(`Check failed: ${summary}.`)
    process.exitCode = 1
  } else if (!process.exitCode) {
    console.log(`Check passed: ${summary}.${args.includes('--check') ? ' Generated output is current.' : ''}`)
  }
}

try {
  await main()
} catch (error) {
  if (!(error instanceof SourceError)) throw error
  console.error(error.message)
  process.exitCode = 2
}

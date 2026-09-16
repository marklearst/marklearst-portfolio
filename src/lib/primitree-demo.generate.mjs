import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const expectedCommit = 'd0c599960434b68e7b1b72439780ebcac37c0b0f'
const fixturePath = new URL('./primitree-demo.ts', import.meta.url)

const config = {
  schemaVersion: 1,
  sources: {
    brand: {
      type: 'dtcg',
      file: './tokens.json',
      architecture: {
        layers: [
          { id: 'base', roots: ['color'], values: 'literal' },
          { id: 'meaning', roots: ['semantic'], values: 'reference', references: ['base'] },
        ],
      },
      ownership: { default: ['design-systems'] },
      outputs: { directory: './generated', formats: ['css'] },
    },
  },
}

const color = { colorSpace: 'srgb', components: [0.2, 0.8, 1], hex: '#33CCFF' }
const configSource = `export default ${JSON.stringify(config, null, 2)}\n`

function run(cliPath, args, directory) {
  const result = spawnSync(process.execPath, [cliPath, ...args], { cwd: directory, encoding: 'utf8' })
  if (result.error) throw result.error
  assert.equal(result.signal, null, 'CLI process must exit normally')
  return {
    exitCode: result.status,
    stdout: result.stdout.replaceAll(directory, '<fixture>'),
    stderr: result.stderr.replaceAll(directory, '<fixture>'),
  }
}

async function listFiles(directory, relative = '') {
  const found = []
  for (const entry of await readdir(path.join(directory, relative), { withFileTypes: true })) {
    const name = path.posix.join(relative, entry.name)
    if (entry.isDirectory()) found.push(...await listFiles(directory, name))
    else found.push(name)
  }
  return found.sort()
}

/** Executes the real CLI in disposable directories; source checkout is read-only. */
export async function generatePrimitreeDemo(cliPath) {
  const scenarios = []
  for (const [id, value] of [['literal', color], ['reference', '{color.cyan}']]) {
    const created = await mkdtemp(path.join(tmpdir(), 'portfolio-primitree-'))
    // macOS reports the canonical /private path in CLI output.
    const directory = await import('node:fs/promises').then((fs) => fs.realpath(created))
    try {
      const tokens = {
        color: { cyan: { $type: 'color', $value: color } },
        semantic: { action: { $type: 'color', $value: value } },
      }
      const tokensSource = `${JSON.stringify(tokens, null, 2)}\n`
      await writeFile(path.join(directory, 'primitree.config.ts'), configSource)
      await writeFile(path.join(directory, 'tokens.json'), tokensSource)
      const check = run(cliPath, ['check', '--format', 'json'], directory)
      const build = run(cliPath, ['build'], directory)
      const checkReport = JSON.parse(check.stdout)
      const generatedPath = path.join(directory, 'generated')
      const files = await listFiles(generatedPath).catch((error) => {
        if (error.code === 'ENOENT') return []
        throw error
      })
      const css = files.includes('css/tokens.css')
        ? await readFile(path.join(generatedPath, 'css/tokens.css'), 'utf8')
        : null
      scenarios.push({ id, tokens, tokensSource, check, checkReport, build, files, css })
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  }
  return { config, configSource, scenarios }
}

async function verifyBuildSources(root) {
  const git = (...args) => spawnSync('git', args, { cwd: root, encoding: 'utf8' }).stdout.trim()
  assert.equal(git('rev-parse', 'HEAD'), expectedCommit, 'Use the documented source commit')
  assert.equal(git('status', '--porcelain', '--', 'packages/cli/src', 'packages/core/src', 'packages/dtcg/src'), '', 'Source paths must be clean')
  const hashes = {}
  for (const [pkg, entry] of [['cli', 'index'], ['core', 'index'], ['core', 'policy'], ['dtcg', 'index']]) {
    const mapPath = path.join(root, 'packages', pkg, 'dist', `${entry}.js.map`)
    const sourceMap = JSON.parse(await readFile(mapPath, 'utf8'))
    for (let index = 0; index < sourceMap.sources.length; index++) {
      const sourcePath = path.resolve(path.dirname(mapPath), sourceMap.sources[index])
      assert.equal(await readFile(sourcePath, 'utf8'), sourceMap.sourcesContent[index], `Built source differs: ${sourcePath}`)
    }
    const built = await readFile(path.join(root, 'packages', pkg, 'dist', `${entry}.js`))
    hashes[`@primitree/${pkg}/${entry}`] = createHash('sha256').update(built).digest('hex')
  }
  return hashes
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.argv[2]
  if (!root) throw new Error('Pass the Primitree checkout path. This script never installs or builds dependencies.')
  const cliPath = path.resolve(root, 'packages/cli/dist/index.js')
  const hashes = await verifyBuildSources(path.resolve(root))
  const result = await generatePrimitreeDemo(cliPath)
  const manifest = JSON.parse(await readFile(path.join(root, 'packages/cli/package.json'), 'utf8'))
  const fixture = {
    provenance: {
      repository: 'https://github.com/marklearst/primitree',
      commit: expectedCommit,
      package: '@primitree/cli',
      version: manifest.version,
      node: process.version,
      commands: ['primitree check --format json', 'primitree build'],
      outputNormalization: 'Temporary fixture directory replaced with <fixture>. All other CLI output preserved.',
      builtFileSha256: hashes,
    },
    ...result,
  }
  await writeFile(fixturePath, `/** Recorded output from the real Primitree CLI. Regenerate with primitree-demo.generate.mjs. */\nexport const PRIMITREE_DEMO = ${JSON.stringify(fixture, null, 2)} as const\n`)
  console.log(`Recorded ${result.scenarios.length} scenarios in ${fileURLToPath(fixturePath)}`)
}

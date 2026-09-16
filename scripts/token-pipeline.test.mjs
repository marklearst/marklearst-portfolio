import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));

async function fixture(t, alias = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-tokens-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'src/tokens'), { recursive: true });
  const files = {
    base: {
      color: { base: { ink: { $type: 'color', $value: { r: 12, g: 24, b: 36 } } } },
      space: { small: { $type: 'dimension', $value: { value: 4, unit: 'px' } } },
    },
    alias: {
      color: { ink: { $type: 'color', $value: { dark: '{color.base.ink}', light: { r: 240, g: 242, b: 244 } } } },
      ...alias,
    },
    component: { component: { card: { ink: { $type: 'color', $value: '{color.ink}' } } } },
  };
  for (const [name, contents] of Object.entries(files)) {
    await writeFile(path.join(root, `src/tokens/${name}.json`), JSON.stringify(contents));
  }
  return root;
}

function run(root, script, ...args) {
  return spawnSync(process.execPath, [path.join(scriptsDir, script), ...args], {
    cwd: root,
    encoding: 'utf8',
  });
}

test('validation works without an editor-specific schema', async (t) => {
  const root = await fixture(t);
  const result = run(root, 'validate-tokens.mjs');
  assert.equal(result.status, 0, result.stderr);
});

test('validation rejects a missing reference in the light mode', async (t) => {
  const root = await fixture(t, {
    color: { ink: { $type: 'color', $value: { dark: '{color.base.ink}', light: '{color.missing}' } } },
  });
  const result = run(root, 'validate-tokens.mjs');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Missing token reference.*color\.missing/);
});

test('validation reports circular references', async (t) => {
  const root = await fixture(t, {
    color: {
      ink: { $type: 'color', $value: '{color.loop}' },
      loop: { $type: 'color', $value: '{color.ink}' },
    },
  });
  const result = run(root, 'validate-tokens.mjs');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Circular token reference/);
});

test('validation rejects references whose resolved value has the wrong type', async (t) => {
  const root = await fixture(t, {
    text: { body: { $type: 'dimension', $value: '{color.base.ink}' } },
  });
  const result = run(root, 'validate-tokens.mjs');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /text\.body.*dimension/);
});

test('validation rejects an invalid mode value instead of falling back to dark', async (t) => {
  const root = await fixture(t, {
    color: { ink: { $type: 'color', $value: { dark: '{color.base.ink}', light: null } } },
  });
  const result = run(root, 'validate-tokens.mjs');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /color\.ink.*light.*color/);
});

test('build emits both modes and stable output in the generated styles directory', async (t) => {
  const root = await fixture(t);
  const result = run(root, 'build-tokens-sd.mjs');
  assert.equal(result.status, 0, result.stderr);
  const outputDir = path.join(root, 'src/styles/generated');
  const dark = await readFile(path.join(outputDir, 'tokens.css'), 'utf8');
  const light = await readFile(path.join(outputDir, 'tokens.light.css'), 'utf8');
  const theme = await readFile(path.join(outputDir, 'theme.css'), 'utf8');
  assert.match(dark, /--token-color-ink: 12 24 36;/);
  assert.match(light, /:root\[data-theme='light'\]/);
  assert.match(light, /--token-component-card-ink: 240 242 244;/);
  assert.match(theme, /--color-ink: rgb\(var\(--token-color-ink\)\);/);
  assert.doesNotMatch(dark, /Generated on/);
  const check = run(root, 'build-tokens-sd.mjs', '--check');
  assert.equal(check.status, 0, check.stderr);
  assert.equal(await readFile(path.join(outputDir, 'tokens.css'), 'utf8'), dark);
});

test('check reports stale generated files without overwriting them', async (t) => {
  const root = await fixture(t);
  const outputDir = path.join(root, 'src/styles/generated');
  await mkdir(outputDir, { recursive: true });
  const filePath = path.join(outputDir, 'tokens.css');
  await writeFile(filePath, '/* stale output */\n');
  const result = run(root, 'build-tokens-sd.mjs', '--check');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /tokens\.css/);
  assert.match(result.stderr, /tokens\.light\.css/);
  assert.equal(await readFile(filePath, 'utf8'), '/* stale output */\n');
  await assert.rejects(readFile(path.join(outputDir, 'tokens.light.css')), { code: 'ENOENT' });
});

for (const { name, keys, outputName } of [
  { name: 'token', keys: ['small-gap', 'small_gap'], outputName: '--token-space-small-gap' },
  { name: 'theme', keys: ['FOOBar', 'Foobar'], outputName: '--spacing-foobar' },
]) {
  test(`build rejects ${name} output name collisions before writing CSS`, async (t) => {
    const root = await fixture(t, {
      space: Object.fromEntries(keys.map((key, index) => [key, {
        $type: 'dimension', $value: { value: index + 1, unit: 'px' },
      }])),
    });
    const result = run(root, 'build-tokens-sd.mjs');
    assert.notEqual(result.status, 0);
    assert.ok(result.stderr.includes(outputName), result.stderr);
    for (const key of keys) assert.ok(result.stderr.includes(`space.${key}`), result.stderr);
    await assert.rejects(readFile(path.join(root, 'src/styles/generated/tokens.css')), { code: 'ENOENT' });
  });
}

for (const { name, value } of [
  { name: 'malformed shadow color', value: { color: 'rgb(,,,)', blur: '8px' } },
  { name: 'negative shadow blur', value: { color: 'rgba(0, 0, 0, 0.45)', blur: '-8px' } },
]) {
  test(`validation rejects ${name}`, async (t) => {
    const root = await fixture(t, {
      shadow: { card: { $type: 'shadow', $value: { offsetX: '0px', offsetY: '4px', spread: '0px', ...value } } },
    });
    const result = run(root, 'validate-tokens.mjs');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /shadow\.card.*shadow/);
  });
}

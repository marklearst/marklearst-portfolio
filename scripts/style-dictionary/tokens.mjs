import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Ajv from 'ajv';

export const tokenSources = ['base.json', 'alias.json', 'component.json'];
export const tokenModes = ['dark', 'light'];
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const hasValue = (value) => isObject(value) && Object.hasOwn(value, '$value');
const isReference = (value) => typeof value === 'string' &&
  ((value.startsWith('{') && value.endsWith('}')) || value.startsWith('#/'));

function resolveValue(value, root, mode, stack = []) {
  if (isReference(value)) {
    const parts = value.startsWith('{') ? value.slice(1, -1).split('.') : value.slice(2).split('/');
    const key = parts.join('.');
    if (stack.includes(key)) {
      throw new Error(`Circular token reference: ${[...stack, key].join(' -> ')}`);
    }
    let node = root;
    for (const part of parts) {
      node = isObject(node) && Object.hasOwn(node, part) ? node[part] : undefined;
    }
    if (!hasValue(node)) throw new Error(`Missing token reference: ${value}`);
    return resolveValue(node.$value, root, mode, [...stack, key]);
  }
  if (Array.isArray(value)) return value.map((entry) => resolveValue(entry, root, mode, stack));
  if (isObject(value)) {
    const keys = Object.keys(value);
    if (keys.length && keys.every((key) => [...tokenModes, 'default'].includes(key))) {
      const selectedKey = [mode, 'default', 'dark'].find((key) => Object.hasOwn(value, key)) ?? keys[0];
      return resolveValue(value[selectedKey], root, mode, stack);
    }
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolveValue(entry, root, mode, stack)]));
  }
  return value;
}

export function resolveTokenTree(node, root, mode) {
  if (!isObject(node)) return node;
  if (hasValue(node)) return { ...node, $value: resolveValue(node.$value, root, mode) };
  return Object.fromEntries(Object.entries(node).map(([key, entry]) => [key, resolveTokenTree(entry, root, mode)]));
}

function mergeGroups(target, source, prefix = []) {
  for (const [key, value] of Object.entries(source)) {
    const tokenPath = [...prefix, key];
    if (!Object.hasOwn(target, key)) {
      target[key] = structuredClone(value);
    } else if (!hasValue(target[key]) && !hasValue(value)) {
      mergeGroups(target[key], value, tokenPath);
    } else {
      throw new Error(`Duplicate token definition: ${tokenPath.join('.')}`);
    }
  }
}

const schema = JSON.parse(await readFile(new URL('./token-schema.json', import.meta.url), 'utf8'));
const ajv = new Ajv({ allErrors: true });
const validateSource = ajv.compile(schema);
const valueValidators = Object.fromEntries(schema.$defs.token.properties.$type.enum.map((type) => [
  type,
  ajv.compile({ $ref: `${schema.$id}#/$defs/${type}` }),
]));

function validateValues(node, mode, prefix = []) {
  if (hasValue(node)) {
    const validate = valueValidators[node.$type];
    if (!validate(node.$value)) {
      throw new Error(`${prefix.join('.')} (${mode}): invalid ${node.$type} value: ${ajv.errorsText(validate.errors)}`);
    }
    return;
  }
  for (const [key, value] of Object.entries(node)) validateValues(value, mode, [...prefix, key]);
}

export async function loadValidatedTokens(root = process.cwd()) {
  const tokens = {};
  for (const file of tokenSources) {
    const source = JSON.parse(await readFile(path.join(root, 'src/tokens', file), 'utf8'));
    if (!validateSource(source)) {
      throw new Error(`${file}: ${ajv.errorsText(validateSource.errors)}`);
    }
    mergeGroups(tokens, source);
  }
  for (const mode of tokenModes) validateValues(resolveTokenTree(tokens, tokens, mode), mode);
  return tokens;
}

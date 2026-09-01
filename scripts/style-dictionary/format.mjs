import { isColor } from "./filter.mjs";

const themeNamespaces = {
  color: "color",
  font: "font",
  space: "spacing",
  radius: "radius",
  shadow: "shadow",
  text: "text",
  tracking: "tracking",
  leading: "leading",
};

const toKebab = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();

const themeVariableName = (token) => {
  if (!token.path || token.path.length <= 1 || !Object.hasOwn(themeNamespaces, token.path[0])) return null;
  const namespace = themeNamespaces[token.path[0]];
  return `--${namespace}-${token.path.slice(1).map(toKebab).join("-")}`;
};

export const assertUniqueCssVariableNames = (dictionary) => {
  for (const getName of [(token) => `--${token.name}`, themeVariableName]) {
    const sources = new Map();
    for (const token of dictionary.allTokens) {
      const name = getName(token);
      if (!name) continue;
      const source = token.path.join(".");
      if (sources.has(name)) {
        throw new Error(`CSS variable name collision: ${name} from ${sources.get(name)} and ${source}`);
      }
      sources.set(name, source);
    }
  }
};

export const tailwindThemeCss = ({ dictionary, options }) => {
  const prefix = options?.prefix ?? "token";

  const entries = dictionary.allTokens
    .filter((token) => themeVariableName(token))
    .map((token) => {
      const themeVar = themeVariableName(token);
      const tokenName = token.name.startsWith(`${prefix}-`) ? token.name : `${prefix}-${token.name}`;
      const tokenVar = `--${tokenName}`;
      const value = isColor(token) ? `rgb(var(${tokenVar}))` : `var(${tokenVar})`;
      return { name: themeVar, value };
    });

  const sorted = entries.sort((a, b) => a.name.localeCompare(b.name));
  const lines = [
    "/* Generated from src/tokens/*.json via Style Dictionary. */",
    "@theme inline {",
    ...sorted.map(({ name, value }) => `  ${name}: ${value};`),
    "}",
    "",
  ];

  return lines.join("\n");
};

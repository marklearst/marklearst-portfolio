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

export const tailwindThemeCss = ({ dictionary, options }) => {
  const prefix = options?.prefix ?? "token";

  const entries = dictionary.allTokens
    .filter((token) => token.path?.length > 1 && token.path[0] in themeNamespaces)
    .map((token) => {
      const namespace = themeNamespaces[token.path[0]];
      const nameSuffix = token.path.slice(1).map(toKebab).join("-");
      const themeVar = `--${namespace}-${nameSuffix}`;
      const tokenName = token.name.startsWith(`${prefix}-`) ? token.name : `${prefix}-${token.name}`;
      const tokenVar = `--${tokenName}`;
      const value = isColor(token) ? `rgb(var(${tokenVar}))` : `var(${tokenVar})`;
      return { name: themeVar, value };
    });

  const deduped = new Map();
  for (const entry of entries) {
    deduped.set(entry.name, entry.value);
  }

  const sorted = [...deduped.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const lines = [
    "/* Generated from src/tokens/*.json via Style Dictionary. */",
    "@theme inline {",
    ...sorted.map(([name, value]) => `  ${name}: ${value};`),
    "}",
    "",
  ];

  return lines.join("\n");
};

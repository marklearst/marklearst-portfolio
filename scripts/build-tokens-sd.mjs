import StyleDictionary from "style-dictionary";
import { isColor, isDimension } from "./style-dictionary/filter.mjs";
import { rgbChannels, dimensionValue } from "./style-dictionary/transform.mjs";
import { tailwindThemeCss } from "./style-dictionary/format.mjs";

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);

const modeKeys = new Set(
  (process.env.VC_MODES ?? "dark,light")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);

const getActiveMode = () => process.env.VC_MODE || "dark";

const isRefString = (value) =>
  typeof value === "string" &&
  ((value.startsWith("{") && value.endsWith("}")) || value.startsWith("#/"));

const parseRefPath = (value) => {
  if (value.startsWith("{")) {
    return value.slice(1, -1).split(".");
  }
  if (value.startsWith("#/")) {
    return value.slice(2).split("/");
  }
  return [];
};

const getTokenNode = (root, refPath) => {
  let node = root;
  for (const part of refPath) {
    if (!isObject(node) || !(part in node)) {
      return null;
    }
    node = node[part];
  }
  return node;
};

const isModeObject = (value) => {
  if (!isObject(value)) {
    return false;
  }
  const keys = Object.keys(value);
  if (keys.length === 0) {
    return false;
  }
  return keys.every((key) => modeKeys.has(key));
};

const pickModeValue = (value) => {
  const mode = getActiveMode();
  if (Object.prototype.hasOwnProperty.call(value, mode)) {
    return value[mode];
  }
  if (Object.prototype.hasOwnProperty.call(value, "default")) {
    return value.default;
  }
  if (Object.prototype.hasOwnProperty.call(value, "dark")) {
    return value.dark;
  }
  const [firstKey] = Object.keys(value);
  return value[firstKey];
};

const resolveValue = (value, root, stack = []) => {
  if (isRefString(value)) {
    const refKey = value;
    if (stack.includes(refKey)) {
      throw new Error(`Circular token reference: ${[...stack, refKey].join(" -> ")}`);
    }
    const refNode = getTokenNode(root, parseRefPath(refKey));
    if (!refNode || !Object.prototype.hasOwnProperty.call(refNode, "$value")) {
      throw new Error(`Missing token reference: ${refKey}`);
    }
    return resolveValue(refNode.$value, root, [...stack, refKey]);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => resolveValue(entry, root, stack));
  }
  if (isModeObject(value)) {
    return resolveValue(pickModeValue(value), root, stack);
  }
  if (isObject(value)) {
    const next = {};
    for (const [key, entry] of Object.entries(value)) {
      next[key] = resolveValue(entry, root, stack);
    }
    return next;
  }
  return value;
};

const resolveRefs = (node, root) => {
  if (!isObject(node)) {
    return node;
  }
  if (Object.prototype.hasOwnProperty.call(node, "$value")) {
    return { ...node, $value: resolveValue(node.$value, root) };
  }
  const next = {};
  for (const [key, value] of Object.entries(node)) {
    next[key] = resolveRefs(value, root);
  }
  return next;
};

StyleDictionary.registerPreprocessor({
  name: "vc-ref",
  preprocessor: (tokens) => resolveRefs(tokens, tokens),
});

StyleDictionary.registerTransform({
  name: "color/rgb-channels",
  type: "value",
  filter: isColor,
  transform: rgbChannels,
});

StyleDictionary.registerTransform({
  name: "dimension/value",
  type: "value",
  filter: isDimension,
  transform: dimensionValue,
});

StyleDictionary.registerTransformGroup({
  name: "tailwind-css",
  transforms: [
    "attribute/cti",
    "name/kebab",
    "time/seconds",
    "html/icon",
    "dimension/value",
    "size/rem",
    "color/rgb-channels",
    "asset/url",
    "fontFamily/css",
    "cubicBezier/css",
    "strokeStyle/css/shorthand",
    "border/css/shorthand",
    "typography/css/shorthand",
    "transition/css/shorthand",
    "shadow/css/shorthand",
  ],
});

StyleDictionary.registerFormat({
  name: "tailwind/theme-css",
  format: tailwindThemeCss,
});

const tokenSources = [
  "src/tokens/base.json",
  "src/tokens/alias.json",
  "src/tokens/component.json",
];

const buildTokens = async ({ mode, selector, tokensDestination, includeTheme }) => {
  process.env.VC_MODE = mode;
  const files = [
    {
      destination: tokensDestination,
      format: "css/variables",
      options: {
        selector,
      },
    },
  ];
  if (includeTheme) {
    files.push({
      destination: "theme.css",
      format: "tailwind/theme-css",
      options: {
        prefix: "token",
      },
    });
  }
  const config = {
    source: tokenSources,
    platforms: {
      css: {
        transformGroup: "tailwind-css",
        preprocessors: ["vc-ref"],
        prefix: "token",
        buildPath: "src/app/",
        files,
      },
    },
  };
  const sd = new StyleDictionary(config);
  await sd.buildAllPlatforms();
};

await buildTokens({
  mode: "dark",
  selector: ":root",
  tokensDestination: "tokens.css",
  includeTheme: true,
});

await buildTokens({
  mode: "light",
  selector: ":root[data-theme='light']",
  tokensDestination: "tokens.light.css",
  includeTheme: false,
});

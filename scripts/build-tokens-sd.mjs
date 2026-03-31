import StyleDictionary from "style-dictionary";
import { isColor } from "./style-dictionary/filter.mjs";
import { rgbChannels } from "./style-dictionary/transform.mjs";
import { tailwindThemeCss } from "./style-dictionary/format.mjs";

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);

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

const resolveValue = (value, root, stack = []) => {
  if (isObject(value) && typeof value.$ref === "string") {
    const refKey = value.$ref;
    if (stack.includes(refKey)) {
      throw new Error(`Circular token reference: ${[...stack, refKey].join(" -> ")}`);
    }
    const refNode = getTokenNode(root, refKey.split("."));
    if (!refNode || !Object.prototype.hasOwnProperty.call(refNode, "$value")) {
      throw new Error(`Missing token reference: ${refKey}`);
    }
    return resolveValue(refNode.$value, root, [...stack, refKey]);
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

StyleDictionary.registerTransformGroup({
  name: "tailwind-css",
  transforms: [
    "attribute/cti",
    "name/kebab",
    "time/seconds",
    "html/icon",
    "size/rem",
    "color/rgb",
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

const config = {
  source: [
    "src/tokens/base.json",
    "src/tokens/alias.json",
    "src/tokens/component.json",
  ],
  platforms: {
    css: {
      transformGroup: "tailwind-css",
      preprocessors: ["vc-ref"],
      prefix: "token",
      buildPath: "src/app/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: {
            selector: ":root",
          },
        },
        {
          destination: "theme.css",
          format: "tailwind/theme-css",
          options: {
            prefix: "token",
          },
        },
      ],
    },
  },
};

const sd = new StyleDictionary(config);
await sd.buildAllPlatforms();

import StyleDictionary from "style-dictionary";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadValidatedTokens, resolveTokenTree } from "./style-dictionary/tokens.mjs";
import { isColor, isDimension } from "./style-dictionary/filter.mjs";
import { rgbChannels, dimensionValue } from "./style-dictionary/transform.mjs";
import { assertUniqueCssVariableNames, tailwindThemeCss } from "./style-dictionary/format.mjs";

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

const modes = [
  { mode: "dark", selector: ":root", destination: "tokens.css", includeTheme: true },
  { mode: "light", selector: ":root[data-theme='light']", destination: "tokens.light.css", includeTheme: false },
];

export async function formatTokenFiles() {
  const tokens = await loadValidatedTokens();
  const outputs = [];
  for (const { mode, selector, destination, includeTheme } of modes) {
    const files = [{
      destination,
      format: "css/variables",
      options: { selector, formatting: { fileHeaderTimestamp: false } },
    }];
    if (includeTheme) {
      files.push({ destination: "theme.css", format: "tailwind/theme-css", options: { prefix: "token" } });
    }
    const sd = new StyleDictionary({
      tokens: resolveTokenTree(tokens, tokens, mode),
      log: { verbosity: "silent" },
      platforms: {
        css: {
          transformGroup: "tailwind-css",
          prefix: "token",
          buildPath: "src/styles/generated/",
          files,
        },
      },
    });
    assertUniqueCssVariableNames(await sd.getPlatformTokens("css"));
    const formatted = await sd.formatAllPlatforms();
    outputs.push(...formatted.css);
  }
  return outputs;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--check")) throw new Error("Usage: node scripts/build-tokens-sd.mjs [--check]");
  const check = args.includes("--check");
  const files = await formatTokenFiles();
  if (check) {
    const stale = [];
    for (const { destination, output } of files) {
      let existing;
      try {
        existing = await readFile(destination, "utf8");
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      if (existing !== output) stale.push(destination);
    }
    if (stale.length) throw new Error(`Generated token CSS is missing or stale:\n${stale.map((file) => `- ${file}`).join("\n")}\nRun pnpm tokens:build to update it.`);
    console.log("Generated token CSS is current.");
    return;
  }
  for (const { destination, output } of files) {
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, output);
    console.log(`Generated ${destination}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

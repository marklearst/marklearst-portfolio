# Token source and generated CSS

The generator and validator share one source list in `scripts/style-dictionary/tokens.mjs`:

- `base.json` defines primitive colors, font families, spacing, radii, and type values.
- `alias.json` defines semantic aliases and dark/light values.
- `component.json` defines component aliases.

`next/` holds a one time migration of these tokens to Primitree's DTCG 2025.10 subset, with a resolver for the dark and light contexts. It drops the Monokai group, `font.serif`, `radius.pill`, and `component.card.shadow`, and moves the light values into the base layer. It is not a build input and nothing regenerates it, so keep editing the files above until Primitree takes over the build.

The local schema in `scripts/style-dictionary/token-schema.json` describes this repository's source format. Validation checks token shapes, duplicate definitions, references, and resolved value types in both modes. It does not certify DTCG or Primitree conformance.

Run `pnpm tokens:validate` to validate the source. Run `pnpm tokens:build` to regenerate `src/styles/generated/tokens.css`, `tokens.light.css`, and `theme.css`. Run `node scripts/build-tokens-sd.mjs --check` to detect missing or stale generated files without writing them.

Generated CSS must be changed through the source files. Fluid type calculations and interaction motion belong to the authored CSS adapters and are not emitted by this generator.

## Raw values

Components read design values from tokens. `pnpm tokens:raw` counts the values still written as literals, per file and category, and compares them with `scripts/raw-values.baseline.json`. The parsers live in `scripts/raw-values`: postcss and postcss-value-parser for CSS, and the TypeScript compiler for TS and TSX.

- **A file that gains a raw value fails.** Use a token, or keep the literal with a `raw:` comment that says why (see below).
- **A file that loses one also fails** until `pnpm tokens:raw --update` lowers the baseline. That locks the improvement in. `--update` refuses to raise any count, even when another count dropped in the same run.
- **The build runs it with `--growth-only`,** so a deploy fails on new raw values but not on a stale baseline.
- **`--reset` rebuilds the baseline from scratch.** It's only for changes to the scanner, and the baseline diff gets reviewed like code.
- `pnpm tokens:raw --list [category]` prints every hit.

### What counts

Each literal counts once, so `transition: opacity 180ms, transform 500ms` is two durations.

- **Color:** hex, every color function (`rgb()`, `oklch()`, `color()` and the rest) when no argument is a token, and named colors like `red` on color properties.
- **Spacing:** every length and percentage in padding, margin, gap, and scroll padding or margin, including inside `clamp()`, `calc()`, `min()`, and `max()`.
- **Type:** font sizes (lengths and keywords like `medium`), line heights, letter spacing, font weights (numbers and `normal`, `bold`, `bolder`, `lighter`), font families, and each of those inside the `font` shorthand.
- **Radius:** every length or percentage except a lone `50%`.
- **Shadow:** each `box-shadow` or `text-shadow` layer, and each `drop-shadow()` in a filter.
- **Motion:** each duration and easing in transitions and animations, `duration`, `delay`, and `easing` in objects passed to `animate()`, and `setTimeout` or `setInterval` delays.
- **Stacking:** `z-index` other than 0, 1, and -1.
- **Breakpoints:** lengths in `@media` and `@container` conditions and in Tailwind `min-[...]:` and `max-[...]:` variants.
- **Tailwind defaults:** palette colors (`text-white/60`), the type scale (`text-sm`), and the default radius, shadow, motion, tracking, leading, weight, and z-index utilities. Arbitrary values and properties count as the CSS they set: `p-[24px]` is spacing, `text-[#123456]` is color, `[padding:18px]` is spacing.
- **Fallbacks:** a literal inside `var()`, like `var(--ink, #f3eee8)`. Every variable it guards is always defined, so it only hides drift.

### Where it looks

- **CSS:** declarations, `@apply`, and `@media` or `@container` conditions in every stylesheet under `src`.
- **TS and TSX:** an object property named for a CSS property counts like that property, so `{ padding: '80px' }` is spacing and `{ borderRadius: '50%' }` isn't. A bare number means px, as in React, except on `line-height`, `font-weight`, and `z-index`. JSX `fill`, `stroke`, and `color` count as colors. Every other string counts its Tailwind classes, then any literal colors, fallbacks, and easing functions left over. A string is one value however many lines it spans.
- **MDX:** class attributes only.

### What stays out on purpose

- **Geometry:** sizes, offsets, hairline borders, `50%` circles, chart coordinates, SVG geometry attributes, and Tailwind arbitrary values on layout utilities like `w-[...]` and `grid-cols-[...]`.
- **Tailwind's numeric spacing** (`p-4`, `gap-1.5`, `space-y-2`). It resolves through the `--spacing` token, so changing the token moves it.
- **Resets to the font's own default:** `line-height: normal` and `letter-spacing: normal`.
- **Values that come from code,** like `${MONOKAI.pink}` in a template, an imported constant, or a ternary's result. They aren't literals where they're used. The strings inside a ternary still count their classes, colors, and fallbacks, but not their spacing or type, since there's no property to read them against.
- **Colors derived from a token,** like `rgb(var(--token-color-canvas))`.
- **Content:** demo data and engines in `src/lib`, color examples in MDX writing and code samples, and named colors in plain TS strings, where "orange" is a word.
- **Other files:** generated output (`src/styles/generated`, `src/tokens`), font faces, type declarations, and tests.
- **JSX attributes that aren't styles,** like `href`, `d`, `alt`, and `aria-*`.

### Exemptions

A comment containing `raw:` keeps a literal and says why. It covers the code on its own line, or the code on the next line when the comment stands alone: `/* raw: */` in CSS, `// raw:` in TypeScript, and `{/* raw: */}` in JSX and MDX. In TypeScript, a comment above a property, an attribute, a JSX element, or a statement covers everything inside it.

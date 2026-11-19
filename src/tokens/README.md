# Token source

The site's tokens are DTCG 2025.10 files with a Resolver. Primitree reads them, checks them, and writes everything the site consumes.

## Sources

| File | Layer | Holds |
|---|---|---|
| `base.tokens.json` | base | Literal values: the neutral ramp, accent and signal colors, font families, sizes, weights, leading, tracking, spacing, radii, layers, durations, easings, spring bounce |
| `semantic.tokens.json` | meaning | References to base, named for the job: surfaces, ink, border, accent, status, type roles, motion |
| `component.tokens.json` | component | References to meaning, for the button, the inspector, and its dock |
| `theme.light.tokens.json` | meaning | The light theme's reroutes |
| `motion.reduced.tokens.json` | meaning | The reduced motion reroutes: every duration to `duration.instant` |
| `motion.slow.tokens.json` | meaning | The slow motion reroutes: longer timings for inspection, including a 720 ms hover |
| `tokens.resolver.json` | | One set (the three layers) and two axes: `theme` (dark, light) and `motion` (default, reduced, slow) |
| `css-adapter.json` | | The names the site's CSS already used, pointed at Primitree's variables |

A context reroutes references in the meaning layer and nothing else. Base values never change, and a context can't add a token.

## Color

Three surfaces, three inks, one border, the signals, and one accent.

The accent is one hue. `color.brand.500` is chosen. `color.brand.300` and `color.brand.700` are solved from its hue by the rule in `src/lib/inspector/brand.ts`: of every tone at that hue that holds the contrast it needs, the one with the most color. To change the accent, pick the new 500 and run the rule for the other two:

```sh
pnpm tokens:accent '#DB1834'
```

It prints both tones as DTCG values to paste into `base.tokens.json`, with the contrast each one holds.

| Meaning token | Used for | Has to hold |
|---|---|---|
| `semantic.color.accent.primary` | Fills, outlines, icons, marks | 3:1 against every surface, and 4.5:1 under its label |
| `semantic.color.accent.text` | The accent when it is text | 4.5:1 against every surface |
| `semantic.color.ink.onAccent` | Text and icons on the accent | 4.5:1 on the accent |

`scripts/tokens/contrast.test.mjs` is the gate. It reads the sources in both themes and fails the build's tests when text drops under 4.5:1 on a surface, a mark under 3:1, or a label under 4.5:1 on its fill.

A token's `$description` says what the token is for. It never holds a link: the token files are public, and `scripts/tokens/sources.test.mjs` fails if one does.

## Rules

`primitree.config.ts` at the repository root holds the policy:

- **base** owns `color`, `font`, `space`, `radius`, `layer`, `duration`, `easing`, and `spring`. Literals only.
- **meaning** owns `semantic`. References only, and only to base.
- **component** owns `component`. References only, and only to meaning.

A literal in the meaning layer is PT1003. A component token that skips the meaning layer is PT1004. Either one fails the build.

## Build

`pnpm tokens:build` runs `scripts/tokens/build.mjs`. It applies the Resolver, composes one Primitree graph for every context (a context's override becomes a conditional value on the token it reroutes), evaluates the policy once over that graph, and writes:

| Output | For |
|---|---|
| `src/styles/generated/tokens.css` | Primitree's CSS: defaults on `:root`, `[data-theme='light']`, `[data-motion='reduced']`, `[data-motion='slow']`, and media query fallbacks for system light appearance and reduced motion |
| `src/styles/generated/theme.css` | The adapter names, as a Tailwind theme and as plain custom properties |
| `src/tokens/generated/tokens.ts` | Primitree's TypeScript: `TokenPath`, `tokenVars`, `tokenValues` |
| `src/tokens/generated/site.tokens.json` | The default context as one document, which `primitree check` and `primitree inspect` read |
| `src/tokens/generated/graph.json` | The graph, policy, and adapter names the inspector loads in the browser |

Generated files change only through the sources. `pnpm tokens:check` fails when one is missing or stale, then runs `primitree check`.

```sh
pnpm tokens:build
pnpm tokens:check
pnpm tokens:inspect component.button.primary.background
```

Two site adapters cover what Primitree doesn't emit yet. Both are small, and both are upstream issues:

- **A media query for a context.** Primitree writes a context under a data attribute. `layout.tsx` sets `data-motion` before first paint, and `tokens.css` repeats the reduced motion overrides under `prefers-reduced-motion` for a page that hasn't run that script.
- **A Resolver in the config form.** `primitree check` reads one document, so the build writes the default context to `generated/site.tokens.json` for it. The build script checks every context itself with the same policy.

Letter spacing is stored as a number, a multiple of the font size, because DTCG dimensions take px or rem. The adapter multiplies it by `1em`.

The footer exposes System, Light and Dark. The layout applies the saved choice or system preference before body paint; the controller follows later preference changes and resolves active inspection evidence again. System removes the stored override. `css-adapter.json` supplies independent theme and motion media query fallbacks when their data attributes are absent, so an explicit context always wins.

## The inspector reads this

`src/lib/inspector` loads `graph.json` and runs `@primitree/core` in the browser: the same graph and the same policy. Break a rule swaps one meaning token's reference for the literal it resolved to and evaluates the policy again, so the finding a visitor sees is the one the build would report.

While the rule is broken, the dock shows the token that was cut loose and lets a visitor move its hue. The new color comes from the same rule that solved the built tones, asked to hold the same contrast, so any hue passes. Everything the broken token paints stays the old color, which is the cost of the broken rule made visible. Restoring the rule lets it all catch up.

To find an element's tokens, the inspector reads the stylesheets for rules that match the element and read a custom property, then sets each candidate to a sentinel for an instant and watches which painted properties move. The cascade stays the browser's own answer. A property no token reaches is reported as a raw value.

## Raw values

Components read design values from tokens. `pnpm tokens:raw` counts the values still written as literals, per file and category, and compares them with `scripts/raw-values.baseline.json`. It parses rather than pattern matches: postcss and postcss-value-parser for CSS, the TypeScript compiler for TS and TSX, and remark-mdx (the site's own MDX parser) for MDX. The scanner lives in `scripts/raw-values`, and this section is its contract: what counts, where it looks, what stays out on purpose, and how to keep a literal. A review finding is checked against this contract first; a case the contract rules out on purpose isn't a bug.

- **A file that gains a raw value fails.** Use a token, or keep the literal with a `raw:` comment that says why (see below).
- **A file that loses one also fails** until `pnpm tokens:raw --update` lowers the baseline. That locks the improvement in. `--update` refuses to raise any count, even when another count dropped in the same run.
- **The build runs it with `--growth-only`,** so a deploy fails on new raw values but not on a stale baseline.
- **`--reset` rebuilds the baseline from scratch.** It's only for changes to the scanner, and the baseline diff gets reviewed like code.
- `pnpm tokens:raw --list [category]` prints every hit.

### What counts

Each literal counts once, so `transition: opacity 180ms, transform 500ms` is two durations and a three layer `box-shadow` is three shadows.

- **Color:** hex, every color function (`rgb()`, `oklch()`, `color()`, and the rest) whose arguments hold no token, and named colors like `red` on color properties (`color`, `background`, `border`, `fill`, shadows, filters, gradients in `background-image`). Also inside `color-mix()` and `image-set()`.
- **Spacing:** every length and percentage in padding, margin, gap, and scroll padding or margin, including inside `clamp()`, `calc()`, `min()`, and `max()`. Any unit: `px`, `rem`, `em`, `%`, `vw`, `cqw`, `ch`, `lh`, and so on.
- **Type:** font sizes (any length or percentage, and keywords like `medium` and `larger`), line heights, letter spacing, font weights (numbers and `normal`, `bold`, `bolder`, `lighter`), and font families (any literal family, generic ones like `monospace` included). The `font` shorthand is read by its grammar: its weight, each literal in its size and line height (including unquoted multi word families like `Times New Roman` after the size), and its family count. A system font keyword like `menu` counts once.
- **Radius:** every length or percentage, except a value that is only `50%`.
- **Shadow:** each `box-shadow` or `text-shadow` layer with a literal length, and each `drop-shadow()` with one in a filter. A layer's literal color counts as a color too.
- **Motion:** each duration and easing (functions and the keywords `ease`, `linear`, and the rest) in transitions and animations; `duration`, `delay`, and `easing` in objects passed to `animate()`; a number passed to `animate()` as its options; `setTimeout` and `setInterval` delays; and a numeric constant whose name ends in the word `duration`, `delay`, `timeout`, or `ms` (`fadeDuration`, `FADE_MS`, `timeoutMs`).
- **Stacking:** `z-index` other than 0, 1, and -1.
- **Breakpoints:** lengths in `@media`, `@container`, and `@custom-media` conditions, and in Tailwind's `min-[...]:`, `max-[...]:`, `@min-[...]:`, and `[@media(...)]:` variants.
- **Custom properties** (`--panel-easing: ease-in-out`) have no CSS property to read against, so only the unambiguous decisions count: colors, durations, and easings. A length in a custom property doesn't.
- **Tailwind defaults:** palette colors (`text-white/60`, `border-x-red-500`, `shadow-black/5`, with any opacity modifier), the type scale (`text-sm`, with any line height modifier), and the default radius, shadow, motion, tracking, leading, weight, animation, and z-index utilities (`rounded-md`, `shadow`, `duration-300`, `ease-out`, `tracking-wide`, `leading-tight`, `font-medium`, `animate-spin`, `z-50`). A class is parsed before it's matched, so variants (`hover:`, `[&>p]:`, `*:`, `@sm:`), the important marker at either end, a negative prefix, and modifiers can't hide it.
- **Tailwind arbitrary values and properties** count as the CSS they set: `p-[24px]` and `scroll-mt-[24px]` are spacing, `text-[11px]` is a font size, `text-[#123456]` is a color, `text-[16px]/[22px]` is a font size and a line height, `font-[700]` is a weight, `font-[Arial]` is a family, `rounded-[8px]` is a radius, `shadow-[0_4px_8px_rgba(0,0,0,.2)]` is a shadow and a color, `ease-[cubic-bezier(...)]` is an easing, `animate-[spin_1s_linear_infinite]` is a duration and an easing, `z-[60]` is a z-index, and `[padding:18px]` or `[--my-var:#fff]` set the property they name. Type hints (`text-[length:12px]`) are honored.
- **Fallbacks:** a literal inside `var()`, like `var(--ink, #f3eee8)`, at any depth (`var(--ink, var(--base, #fff))` counts once; `rgb(var(--channels, 255 0 0))` counts once). Every variable it guards is always defined, so it only hides drift.

### Where it looks

- **CSS:** declarations, `@apply`, and `@media` or `@container` conditions in every stylesheet under `src`.
- **TS and TSX:** an object property or class field named for a CSS property counts like that property, including computed keys (`{ ['padding']: 12 }`), so `{ padding: '80px' }` is spacing and `{ borderRadius: '50%' }` isn't. A bare number means px, as in React, except on `line-height`, `font-weight`, and `z-index`. `el.style.padding = '12px'` and `style.setProperty('padding', '12px')` count the same way. JSX `fill`, `stroke`, `color`, `stopColor`, `floodColor`, and `lightingColor` count as colors. Every other string counts its Tailwind classes, wherever it lives (a `className`, a variable, `cn()` arguments, the keys of a `clsx()` object, a ternary's branches), then any literal colors, fallbacks, and easing functions left over. A string is one value however many lines it spans, and a template's `${expressions}` are code, never text. Parentheses, `as const`, `satisfies`, and `!` don't change a literal, and arithmetic on literals (`60 * 1000`, `8 * 2`) is one.
- **MDX:** everything that is JavaScript counts exactly as it would in TSX, because the site's own parser separates it from the writing: JSX attributes (`className`, `style`, `fill`), spread attributes (`{...{ style: { padding: 12 } }}`), expressions (`{cond && <p className="text-lg" />}`), and import or export blocks. Prose, inline code, fenced code at any indentation, frontmatter, and a `code={`...`}` prop are content.

### What stays out on purpose

- **Geometry:** sizes, offsets, hairline borders, `50%` circles, chart coordinates, SVG geometry attributes (`d`, `r`, `strokeWidth`), and Tailwind arbitrary values on layout utilities like `w-[...]`, `grid-cols-[...]`, `border-[2px]`, and `ring-[3px]`.
- **Tailwind's numeric spacing** (`p-4`, `gap-1.5`, `space-y-2`, `leading-7`, `text-sm/7`). It resolves through the `--spacing` token, so changing the token moves it.
- **Resets to the font's own default:** `line-height: normal` and `letter-spacing: normal`.
- **Values that come from code:** `${MONOKAI.pink}` in a template, an imported constant, an identifier, or the result of a ternary. They aren't literals where they're used. The strings inside a ternary still count their classes, colors, and fallbacks, but not their spacing or type, since there's no property to read them against.
- **Colors derived from a token:** `rgb(var(--token-color-canvas))`, `hsl(var(--h) 50% 50%)`.
- **Content:** demo data and engines in `src/lib`, MDX prose and code, named colors in plain TS strings (where "orange" is a word), and object values under keys that are never styles (`href`, `src`, `id`, `label`, `title`, and the like).
- **Other files:** generated output (`src/styles/generated`, `src/tokens`), font faces, type declarations, and tests.
- **JSX attributes that aren't styles:** `href`, `d`, `alt`, `aria-*`, `data-*`.
- **CSS written inside strings:** a `css` tagged template or an `insertRule()` string isn't parsed as CSS; its strings count colors, fallbacks, and easings only. The site has none.

### Exemptions

A comment containing `raw:` keeps a literal and says why. It covers the code that starts on its line, or on the next line when the comment stands alone on its own line (a blank line in between breaks the link, so a comment left behind by a deleted declaration exempts nothing), and everything inside what it covers. So in CSS it covers a declaration, an `@apply`, or a whole rule or `@media` block with every declaration inside; in TypeScript a property, an attribute, a JSX element and its children, or a whole statement; in MDX a JSX element and its children, an expression, or an export block. One placement is narrower: a comment that opens a block (`.a { /* raw: */`) covers only the block's own condition, such as an `@media` breakpoint, never the declarations inside. Put the comment on its own line above a declaration to cover it. The forms: `/* raw: */` in CSS, `// raw:` in TypeScript, `{/* raw: */}` in JSX and MDX.

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

Components read design values from tokens. `pnpm tokens:raw` counts the values still written as literals, per file and category, and compares them with `scripts/raw-values.baseline.json`.

- **A file that gains a raw value fails.** Use a token, or keep the literal with a comment containing `raw:` and the reason, on the same line or the line before. That works for declarations, `@media` and `@container` rules, and lines of TypeScript.
- **A file that loses one also fails** until `pnpm tokens:raw --update` lowers the baseline. That locks the improvement in. `--update` refuses to raise any count, even when another count dropped.
- **The build runs it with `--growth-only`,** so a deploy fails on new raw values but not on a stale baseline.
- **`--reset` rebuilds the baseline from scratch.** It's only for changes to the scanner itself, and the baseline diff gets reviewed like code.
- `pnpm tokens:raw --list [category]` prints every hit.

Only decisions count: color (hex, color functions, named colors), the type properties and font families, spacing, radius, motion, shadows (including `drop-shadow()`), z-index, and breakpoints. They count in CSS Modules, `@apply` utilities, inline styles and other style objects in TypeScript, and Tailwind classes anywhere in a string. Each literal counts once, so a declaration with three literals counts three. Literal fallbacks inside `var()` count too, since every variable they guard is always defined and a stale fallback only hides drift.

Some things stay out on purpose:

- **Geometry:** sizes, offsets, hairline borders, `50%` circles, chart coordinates, and arbitrary Tailwind values on layout utilities like `w-[...]` and `grid-cols-[...]`.
- **Tailwind's numeric spacing utilities** (`p-4`, `gap-1.5`, `space-y-2`). They resolve through the `--spacing` token, so changing the token moves them.
- **Demo data and engines in `src/lib`.** Their colors are content, like the color pair the a11y demo checks.
- **Color examples in MDX.** In the writing, they're token examples, not interface color.

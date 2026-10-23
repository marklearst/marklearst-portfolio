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

- **A file that gains a raw value fails.** Use a token, or keep the literal with a comment containing `raw:` and the reason, on the same line or the line before a CSS declaration.
- **A file that loses one also fails** until `pnpm tokens:raw --update` lowers the baseline. That locks the improvement in.
- **The build runs it with `--growth-only`,** so a deploy fails on new raw values but not on a stale baseline.
- `pnpm tokens:raw --list [category]` prints every hit.

Only decisions count: color, the type, spacing and radius scales, motion, elevation, stacking, and breakpoints. Geometry stays literal: sizes, offsets, hairline borders, circles, and chart coordinates. Literal fallbacks inside `var()` count too, since every variable they guard is always defined and a stale fallback only hides drift.

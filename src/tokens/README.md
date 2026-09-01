# Token source and generated CSS

The generator and validator share one source list in `scripts/style-dictionary/tokens.mjs`:

- `base.json` defines primitive colors, font families, spacing, radii, and type values.
- `alias.json` defines semantic aliases and dark/light values.
- `component.json` defines component aliases.

`modes.json` is a legacy reference snapshot. It is not a build input; edit light-mode values in `alias.json`.

The local schema in `scripts/style-dictionary/token-schema.json` describes this repository's source format. Validation checks token shapes, duplicate definitions, references, and resolved value types in both modes. It does not certify DTCG or Primitree conformance.

Run `pnpm tokens:validate` to validate the source. Run `pnpm tokens:build` to regenerate `src/styles/generated/tokens.css`, `tokens.light.css`, and `theme.css`. Run `node scripts/build-tokens-sd.mjs --check` to detect missing or stale generated files without writing them.

Generated CSS must be changed through the source files. Fluid type calculations and interaction motion belong to the authored CSS adapters and are not emitted by this generator.

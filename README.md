# Mark Learst Portfolio

Coder to the core, think like a designer.

Design systems, React component libraries, developer tools, and working interface examples. Case studies and articles are authored in MDX.

## Stack

- Next.js 16 App Router, React 19, and TypeScript
- CSS Modules for component styles, Tailwind CSS 4 for existing utilities
- Style Dictionary for generated token CSS
- Wotfard for reading and MonoLisa for code
- GlucoseIQ for the interactive glucose example

See [Architecture](./ARCHITECTURE.md) for ownership, component contracts, and the server/client boundary. See [Token source](./src/tokens/README.md) for generation and validation.

## Development

Use Node.js 24 or later and the pnpm version declared in `package.json`.

```sh
pnpm install
pnpm dev
```

Licensed Wotfard webfont binaries live in `public/fonts/wotfard/` and are excluded from Git. Local builds use the originals in place. Vercel builds fetch them from private Blob storage using `BLOB_READ_WRITE_TOKEN`. The build then checks for the original files; it does not convert or subset them. See the README in that directory for the filenames and the one-time upload.

## Verification

```sh
pnpm check
pnpm build
```

`check` runs ESLint, TypeScript, behavior tests, and generated-token drift detection. `build` also verifies the licensed fonts and token output before building every route.

The recorded Primitree demo has an optional fresh-CLI replay test. Without `PRIMITREE_DEMO_CLI`, that test is reported as skipped; the recorded-result tests still run.

## Content

- About: `src/content/about.mdx`
- Case studies: `src/content/case-studies/*.mdx`
- Articles: `src/content/artifacts/*.mdx`
- Loaders and registries: `src/lib/content/`
- Project catalog and display order: `src/data/projects.ts`
- MDX rendering: `src/components/mdx/`

Case studies use explicit `/work/<slug>` routes with a shared server composition. Articles use `/artifacts/[slug]` and their registered frontmatter slugs. See the architecture guide before adding a new entry so catalog and adjacent navigation stay aligned.

## Contact

- github@marklearst.com
- https://marklearst.com

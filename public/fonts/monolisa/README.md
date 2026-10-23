# MonoLisa webfonts

The portfolio uses licensed MonoLisa webfonts. The font binaries are not distributed
in this public repository.

Place the 26 original WOFF2 files from the MonoLisa webfont package in this
directory before building. Preserve the supplied names:
`{0..25}-MonoLisa-{normal,italic}.woff2`.

Each file is a variable font covering one unicode range, in normal or italic.
The files' weight axis runs from 100 to 1000; `src/styles/monolisa.css`
declares 100 to 900, and no style asks for more. The stylesheet declares all
26 files, and the browser downloads only the ranges a page uses. None are
preloaded.

Vercel builds start from a clone without the binaries. `pnpm build` first runs
`scripts/fetch-webfonts.mjs`, which downloads the missing files from private
Vercel Blob storage. That needs `BLOB_READ_WRITE_TOKEN` in the project's
environment. The files are stored with private access, so the token is the only
way to read them.

To seed or replace the stored files, run `pnpm fonts:upload` from a checkout
that has the originals, with the same token in `.env.local`. It uploads the
Wotfard files too.

After the fetch, `scripts/check-webfonts.mjs` confirms every file is present
and is an original WOFF2. A missing or wrong file stops the build rather than
letting code fall back to a system monospace font.

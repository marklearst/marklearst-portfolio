# Wotfard webfonts

The portfolio uses licensed Wotfard webfonts. The font binaries are not distributed
in this public repository.

Place the original WOFF2 files for Light, Regular, and Medium, including their
matching italics, in this directory before building. Preserve the supplied names:
`wotfard-{light,regular,medium}{italic,}-webfont.woff2`.

Only Regular and Medium are preloaded. Other faces load when used. Light is
registered at 300, matching the font metadata; the supplied stylesheet labels it
200. The files themselves are unchanged.

Vercel builds start from a clone without the binaries. `pnpm build` first runs
`scripts/fetch-webfonts.mjs`, which downloads the six files from private Vercel
Blob storage when they are missing. That needs `BLOB_READ_WRITE_TOKEN` in the
project's environment. The files are stored with private access, so the token
is the only way to read them.

To seed or replace the stored files, run `pnpm fonts:upload` from a checkout
that has the originals, with the same token set locally.

After the fetch, `scripts/check-webfonts.mjs` confirms every file is present
and is an original WOFF2. A missing or wrong file stops the build rather than
letting the site fall back to Arial.

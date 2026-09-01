# Wotfard webfonts

The portfolio uses licensed Wotfard webfonts. The font binaries are not distributed
in this public repository.

Place the original WOFF2 files for Light, Regular, and Medium, including their
matching italics, in this directory before building. Preserve the supplied names:
`wotfard-{light,regular,medium}{italic,}-webfont.woff2`.

Only Regular and Medium are preloaded. Other faces load when used. Light is
registered at 300, matching the font metadata; the supplied stylesheet labels it
200. The files themselves are unchanged.

For Vercel previews from a checkout containing the licensed files, run
`vercel build` and then `vercel deploy --prebuilt`. A build from a fresh clone
requires the licensed files to be provisioned first.
`pnpm build` checks for the font files and stops if any are missing, preventing
an accidental deployment that silently falls back to Arial.

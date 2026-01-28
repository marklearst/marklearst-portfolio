# Mark Learst Portfolio

Coder to the core, think like a designer.

This is my portfolio and a living build log. I am a senior frontend and design engineer who ships design systems, React UI architecture, and accessibility-first interfaces that hold up in production. I care about performance, motion with intent, and making the handoff between design and code feel invisible.

What you will find here:

- Case studies and artifacts written in MDX so the work stays close to the code.
- A Monokai-inspired visual system and terminal-style navigation.
- A command palette for fast navigation.

## Tech

- [Next.js](https://nextjs.org) 16 (App Router), [React](https://react.dev) 19, [TypeScript](https://www.typescriptlang.org)
- [Style Dictionary](https://github.com/amzn/style-dictionary), [Variables Design Standard](https://variable-design-standard.vercel.app), [FigmaVars Hooks](https://github.com/marklearst/figma-vars-hooks)
- [Tailwind CSS](https://tailwindcss.com) v4, [GSAP](https://greensock.com/gsap/), [Three.js](https://threejs.org)
- [Zustand](https://zustand-demo.pmnd.rs/), [Lenis](https://lenis.darkroom.engineering/)

## Content architecture

- About: `src/content/about.mdx`
- Artifacts: `src/content/artifacts/*.mdx`
- Case studies: `src/content/case-studies/*.mdx`
- Content loaders: `src/lib/content/*`
- MDX components: `src/components/mdx/*`

If you add a new case study, create the MDX file and register it in `src/lib/content/case-studies.tsx`.

## Routes

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ○ /artifacts
├ ● /artifacts/[slug]
│ ├ /artifacts/variable-design-standard-semver
│ └ /artifacts/terminal-navigation
├ ○ /privacy
├ ○ /work/a11y-companion
├ ○ /work/aurora-gm
├ ○ /work/diabetic-utils
├ ○ /work/figmavars-hooks
├ ○ /work/skydio
└ ○ /work/variable-design-standard
```

## Run locally

```bash
pnpm install
pnpm dev
```

## Contact

- github@marklearst.com
- https://marklearst.com

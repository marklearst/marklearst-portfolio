# Mark Learst Portfolio

Personal portfolio site built with Next.js showcasing my work as a senior frontend engineer. Features terminal-style navigation transitions, custom animations, and detailed case studies of projects I've built.

## Tech Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS v4
- GSAP for animations
- Three.js for 3D elements
- Zustand for state management
- Lenis for smooth scrolling
- Style Dictionary for token builds
- FigmaVars Hooks for variables integration

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Figma Variables (optional)

The app is wired to `@figma-vars/hooks` with a local fallback JSON so it can run without the Figma API. Update `src/data/figma-variables.json` with exported variables when ready.

To enable live Figma Variables locally, set these in `.env.local`:

```bash
NEXT_PUBLIC_FIGMA_TOKEN=your_personal_access_token
NEXT_PUBLIC_FIGMA_FILE_KEY=your_figma_file_key
```

In dev, a small overlay shows collection/variable counts and logs status to the console.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── work/              # Case study pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── brand/            # Branding components (logo, particles)
│   ├── dev/              # Dev-only overlays/debug tools
│   ├── providers/        # App-level context providers
│   ├── transitions/      # Terminal-style navigation transitions
│   └── ui/               # UI components (cursor, neural network, etc.)
├── data/                  # Local JSON assets (e.g., Figma variables fallback)
├── tokens/                # Design tokens (Variables Contract JSON)
├── lib/                   # Utilities and helpers
│   ├── terminal-*.ts     # Terminal animation utilities
│   └── monokai-colors.ts  # Color system
└── hooks/                 # Custom React hooks

scripts/
└── style-dictionary/       # Style Dictionary transforms/filters
```

## Key Features

Terminal-style navigation transitions that mimic command-line interactions when navigating between pages. Custom particle systems, neural network background, and cursor trail effects. All animations are optimized for performance with centralized timing controls.

The site includes detailed case studies for projects like Aurora Design System at GM, FigmaVars Hooks, a11y Companion, and others. Each case study includes code examples, technical details, and outcomes.

## Build

```bash
pnpm build
```

## Development Notes

The site uses a Monokai-inspired color scheme throughout. Terminal animations are controlled via centralized timing utilities in `src/lib/terminal-timing.ts`. All components are built with accessibility in mind, following WCAG guidelines.

Font loading uses MonoLisa for monospaced text and system fonts for body copy. The site is fully responsive and optimized for performance.

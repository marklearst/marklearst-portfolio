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

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── work/              # Case study pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── brand/            # Branding components (logo, particles)
│   ├── transitions/      # Terminal-style navigation transitions
│   └── ui/               # UI components (cursor, neural network, etc.)
├── lib/                   # Utilities and helpers
│   ├── terminal-*.ts     # Terminal animation utilities
│   └── monokai-colors.ts  # Color system
└── hooks/                 # Custom React hooks
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

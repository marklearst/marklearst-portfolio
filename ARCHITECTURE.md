# Architecture

The route layer composes features. Each feature owns its components, styles, and feature-specific hooks. Shared UI stays small and has no portfolio-content dependencies.

## Ownership

```text
src/
  app/                  Routes, metadata, the root layout, the 404 page, the manifest, and the agent endpoints (tokens.json, graph.json, llms.txt)
  components/
    shell/              Persistent header and shared footer
    navigation/         Primary/adjacent links, the header bar they share with actions, and navigation history
    home/               Hero with its X-ray, the a11y Companion band, selected work, testimonials
    inspector/          The token inspector: provider, dock parts, toggle, build line
    about/              About layout and contact presentation
    work/               Filterable project catalog
    case-study/         Server page composition, sections, and project links
    artifacts/          Article index cards and article presentation styles
    privacy/            Privacy presentation and contextual back link
    content/            Shared prose, server code highlighting, copy controls
    mdx/                Authored-content to React component mappings
    evidence/           Galleries and recorded project demonstrations
    glucose/            GlucoseIQ interactive example
    analytics/          Small client tracking and privacy controls
    brand/              Braced wordmark
    transitions/        Route feedback and input modality
    ui/                 Content-independent primitives: Button, Segmented, Slider, Slot, icons, disclosure summary
    dev/                Development-only Figma variable inspection
  content/              Authored MDX
  data/                 Serializable project catalog and source data
  hooks/                Hooks shared across multiple features
  lib/                  Content loading, calculations, and service functions, plus the spring that scripted motion rides
    inspector/          The inspector's engine: Primitree graph, stylesheet index, cascade probe, the color rule
  styles/               Global defaults, fonts, view transitions
    generated/          Primitree's CSS and the adapter theme; never edit by hand
  tokens/               DTCG token sources, the Resolver, and the CSS adapter
    generated/          Primitree's TypeScript, the default document, the inspector's graph
primitree.config.ts     The token policy: layers and ownership
scripts/                Font checks, the token build, the raw value ratchet, tests
```

Import the component you need directly. There is no application-wide barrel, generic feature registry, or wrapper for every HTML element. A small repeated layout rule is preferable to a shared component with unrelated responsibilities.

## Server and client responsibilities

Pages, narrative content, the hero, selected work, and footer render on the server. Interactive selectors, the wordmark, gallery, navigation state, copy controls, and analytics are client boundaries. Pass rendered server content through `children` when a client frame needs behavior around it.

`CodeBlock` highlights code on the server using the synchronous Prism entry. `CodeBlockFrame` owns clipboard state and impression tracking. Syntax grammars are not needed by the copy button.

The FigmaVars provider wraps its development inspector only. Production pages read generated CSS and do not mount that runtime provider.

`PageTransition` keeps one stable content wrapper and hands each route to the next with React's `<ViewTransition>`. The leaving page fades where it stands and the arriving one settles in. Its rules live in `globals.css`, read motion tokens, and run for pointer navigation only: keyboard and history moves, and the reduced motion context, swap the page at once. The header and the floating inspector dock carry their own transition names, so they hold still while the page changes.

## The inspector

`InspectorProvider` sits in the root layout and owns one `InspectorController` for the whole site, so inspect mode and the floating dock carry across routes. The controller is plain TypeScript: it holds the state, listens to the page, and moves the outlines. React renders the dock from that state through `useInspector(selector)`.

The dock is composed from parts, each reading the same controller:

```tsx
<InspectorDock placement='inline'>
  <InspectorStatus />
  <InspectorBody preview={preview} />
  <InspectorControls />
</InspectorDock>
```

The home page renders that composition on the server inside `InspectorSlot`, with the hero heading's chains resolved from the build's graph, so the first paint holds real token chains and ships no inspector code. The page marks that heading with `data-inspect-preview`, so it is also the first thing selected when inspecting starts. `FloatingInspector` renders the same parts in the layout while a visitor inspects away from that slot. It has a set height, so it never resizes as the selection changes, and it crosses to the other side of the screen when it would cover what has keyboard focus.

The engine in `src/lib/inspector` loads on first use. It runs `@primitree/core` on the build's graph, indexes the document's stylesheets for rules that read a custom property, and decides which token paints a property by setting each candidate to a sentinel and reading the computed style. `src/tokens/README.md` has the detail.

Keyboard: Tab moves through the page and selects each stop. Enter steps into the dock at the selection's first token. Escape steps back to the element, and from the page it stops inspecting. Focus is never left on a control that has gone.

## The X-ray

The hero's introduction renders twice from one function in `Hero.tsx`: as the page, and as a blueprint of itself that sits on top, cut off at a line. `HeroXRay` owns the line. Left of it is the page, right of it the blueprint: the name as an outline between its cap line, x height, and baseline, running text on its baselines, the spacing between parts as brackets, and the tokens each part reads.

- The blueprint copy is `aria-hidden` and `inert`, has no ids, links, or tracking, and never takes the pointer, so the real links under it still work. When one of them takes keyboard focus, the blueprint draws back so it can be seen.
- The line is the browser's range input stretched over the introduction. Only its thumb takes the pointer. Dragging, touch, and the arrow keys come from the platform.
- `--peel`, a registered custom property, is how far across the line sits. The stylesheet sets where it rests (`--rest`), the session's intro scans it across once, and it retreats to the edge while inspecting or while a rule is broken.
- The token paths the blueprint prints are in `hero-spec.ts`. `hero-spec.test.mjs` derives the custom properties each path stands for and fails if the rule it describes stops reading them. A gap is declared by value and by name in the same rule, in every block that sets one, and the test checks each pair, so a bracket's label can't drift from the space it measures.

## Breaking a rule

Break a rule makes one token hold a literal. On the page, everything that token paints comes unhooked: it tilts from a corner inside its outline (the motion is CSS in `globals.css`). In the dock, the verdict is spelled out a letter at a time, the literal's own characters drop away from the cut, and the token it was cut from hangs under the cut with a hue control, so a visitor can change the brand color and see that the broken token's elements do not follow.

The selection outline rides a spring (`src/lib/spring.ts`) instead of a CSS transition, because the pointer redirects it mid flight and it should keep its speed. The spring takes its duration from a motion token, so the reduced motion context stops it like everything else, and how far it passes its target from a number token (`semantic.spring.land`). A thrown dock lands on the same spring.

## Component contracts

- Fixed feature compositions keep their own content and state. Do not make every feature a configurable library component.
- Shared DOM wrappers retain native attributes and React 19 refs. Custom click handlers run before internal behavior and can cancel it with `preventDefault()`.
- Stateful demos keep inactive panels mounted so switching examples preserves local state. Their controls retain native button behavior and accessible selected/hidden states.
- Use JSX children for content, a small variant only for actual alternate presentations, and `className` for intentional styling overrides.
- Add controlled/uncontrolled state only when a consumer needs both. Avoid speculative prop surfaces and compound APIs for fixed layouts.
- `Button` takes a `variant` and a `size`, and `asChild` lends its styles and behavior to a link. `Segmented` is a radio group drawn as one control: `<Segmented>` owns the value, controlled (`value`, `onValueChange`) or on its own (`defaultValue`), and each `<SegmentedOption>` is a radio input, so arrow keys move between options. `Slider` is the browser's range input with a drawn track, takes `value` or `defaultValue` with `onValueChange`, and draws its children on the track as marks. Button reads component tokens, so the inspector can name what paints it.
- `PrimaryNav` takes actions as children and renders them after the links in the same bar, outside the nav landmark. The header passes the Inspect toggle that way, so navigation knows nothing about the inspector.
- New component CSS holds no literal color, type, spacing, radius, or motion value. The raw value ratchet starts a new file at zero.

## Content flow

A case-study route supplies a slug to `CaseStudyPage`. The loader resolves MDX/frontmatter, the MDX map renders authored blocks, and section extraction provides the table of contents. `CaseStudyLayout` supplies previous/next navigation from the same display order as the work catalog.

Content loaders return icon names as data. `CaseStudyContent` resolves those names to UI components. Data modules do not construct presentation elements.

The MDX maps share prose and code handling. Authored `CaseStudy*` element names remain supported at that mapping boundary, while reusable typography lives in `content/Prose`.

To add a case study:

1. Add its MDX and register it in `src/lib/content/case-studies.ts`.
2. Add the catalog entry in `src/data/projects.ts`.
3. Add a thin route using `CaseStudyPage` and `getCaseStudyMetadata`.
4. Run the adjacent-navigation tests and verify the page and its metadata.

To add an article, register its MDX in `src/lib/content/artifacts.ts`. The registry supplies static routes and chronological adjacent navigation.

## CSS and tokens

Component CSS Modules sit beside their owner. `globals.css` contains document defaults, fonts, focus, shared icon behavior, and the view transition rules. Header, timeline, and page geometry do not belong there. Shared reading styles live in `content/Prose.module.css`; route-specific article/table spacing stays with its feature.

Primitree builds the tokens. The sources are DTCG 2025.10 files in three layers (base, meaning, component) with a Resolver that adds two axes, `theme` and `motion`. `scripts/tokens/build.mjs` composes every context into one graph, evaluates the policy in `primitree.config.ts`, and writes the CSS, the TypeScript, and the graph the inspector reads. `pnpm tokens:check` rejects stale output and runs `primitree check`. `src/tokens/README.md` is the contract.

Components read the adapter names (`--color-ink-primary`, `--text-body`, `--duration-feedback`) or Primitree's own variables for component tokens and the spacing, radius, and layer scales. `src/tokens/css-adapter.json` maps each adapter name to its token, and the inspector reads the same map.

Motion is tokenized: four durations named for the job (feedback, reveal, handoff, causal) and four easings (enter, move, linear, and settle, which passes its target a little and comes back). Motion is a context with three settings, not a media query in each component. `layout.tsx` sets `data-motion` before first paint. In the reduced context every duration resolves to zero, and in the slow one every duration runs at a quarter of its speed, which is there so anyone can watch the site's motion closely. Scripted animation reads the live value through `src/lib/motion-tokens.ts`.

`pnpm tokens:raw` counts the design values components still write as literals, per file and category, against a ratcheting baseline in `scripts/raw-values.baseline.json`. A file can lose raw values but not gain them, and a new file starts at zero. It parses rather than pattern matches: postcss and postcss-value-parser for CSS, the TypeScript compiler for TS and TSX, and remark-mdx for MDX (`scripts/raw-values`).

What still bypasses the tokens:

- Geometry in older component CSS: padding, gap, margin, and radius literals. The spacing and radius scales exist and new components use them.
- Fixed white and black alphas and the remaining box shadows in older CSS Modules
- Hardcoded hex in the GlucoseIQ chart's SVG
- `src/lib/monokai-colors.ts`, which resolves hex values from Primitree's output for the Open Graph images. Those images also write literal colors inline, and the Monokai name is due to retire.

The light theme's tokens pass the policy, but nothing sets `data-theme` yet. The code above that assumes a dark page moves onto tokens first.

ESLint rejects route imports from components and UI imports from data/library modules. These checks support the ownership rules; review relative imports and new boundaries as part of code review too.

## Verification and release

Run `pnpm check` and `pnpm build`. For layout or client behavior changes, also check desktop/mobile rendering, pointer and keyboard paths, reduced motion, route history, and any changed demo or dialog against the previous preview.

Keep licensed font binaries out of the public repository. Builds require the separately supplied originals. Preview deployment and production promotion are separate actions.

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
    tokens/             The live token graph and shared token path presentation
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

The GlucoseIQ sample renders its initial report during the build. Only the visible report and trace are included in the initial client payload. The complete fixture is regenerated in the browser when a visitor changes the sample. Scenario changes load the real analysis library on demand, preserve the previous report while loading, and honor the latest selection. The chart slider is interactive immediately. Wotfard Medium is the single font preload because it paints the hero heading and navigation; other faces load when used.

Glucose chart paints read `component.glucose` roles. The cyan trace has a light theme tone; low, in range and high follow the fixed signal palette. These roles do not depend on the brand accent, so retuning the site preserves the meaning of its data. The inspector reports SVG stroke and fill tokens as paint properties. The chart owns its trace stroke on the SVG container and lets its data paths inherit it, making that trace available to Inspect without selecting a thin path.

`PageTransition` keeps one stable content wrapper. Pointer navigation gives the arriving, live page a CSS entrance driven by motion tokens; keyboard and history navigation arrive immediately, and the reduced motion context resolves its duration to zero. Shared project titles retain React's `<ViewTransition>` handoff. When a shared transition is already active during the commit, the page stays still so the title's destination does not move. Initial loads do not play a route entrance. Engines with View Transitions but without the selector for an active transition keep the page still.

The document root, header, and floating inspector are not named transition snapshots. Their controls remain live while shared project elements move above the page. `::view-transition` passes pointer events through. Snapshotting the header, even with its animation disabled, made its visible links unavailable during rapid route reversals. Page entrance rules belong to `PageTransition.module.css`; shared title rules remain in `globals.css`.

`TrackedLink` retains the router for route navigation. `TrackedFragmentLink` focuses and scrolls to its destination through `onNavigate`, while Next owns fragment history. Explicit scrolling also handles repeated clicks on the current fragment. A native fragment anchor created a history entry the router could not restore when returning from a case study. Selected work is a named region with `tabIndex={-1}`; its heading shows keyboard focus and the next Tab reaches All projects. Modified clicks keep the browser's usual behavior because they do not call `onNavigate`.

The homepage work browser remembers its last selected project in client module memory. Returning from a case study restores that preview without an entrance animation. Input handlers update the memory; rendering never writes it. A full reload resets the selection, and no browser storage or route history fields are changed.

One decorative surface moves between the project tabs. Its transform and clipping use measured tab bounds, its corners follow the tab's computed radius, and its timing reads Primitree's handoff and enter tokens. The actual labels and focus outlines stay still. Keyboard, rapid selection, Reduced, Inspect, resize, and context changes place it immediately. Focus changes refresh its shape; teardown invalidates pending completion before releasing styles and observers. The original selected background remains the server rendered fallback.

The same preview accepts a contained horizontal drag. Direction locks after a small movement; vertical scrolling and pinch zoom remain browser gestures. Neighboring server-rendered panels follow the pointer through transforms, while only the selected panel is exposed to assistive technology. Release distance and recent velocity decide one neighboring project, with resistance at the ends. Input tolerances are independent of motion preferences; the landing reads the Primitree handoff duration and easing through the Web Animations API. Reduced keeps direct manipulation and makes release immediate. Keyboard, selection, context changes, resize, capture loss, and unmount cancel motion and restore owned styles. A drag suppresses its own link click; a fresh pointer action starts with normal link behavior.

## The inspector

`InspectorProvider` sits in the root layout and owns one `InspectorController` for the whole site, so inspect mode and the floating dock carry across routes. The small initial controller owns the shared state, motion preferences, intro lifetime, and loading feedback. `InspectorRuntime` downloads on intent or an explicit action and owns selection, outlines, keyboard inspection, rule effects, and dock handoffs. Both use one store; React reads it through `useInspector(selector)`.

The floating panel is a separate client chunk. Routes without the inline demo or token graph do not include its full presentation in their initial JavaScript. Focus or pointer intent requests the runtime, which preloads the panel and engine together. Activation waits for them before handing over the inline dock, so its controls retain focus during loading. Escape cancels even while the runtime itself downloads, and a failed request returns the header control to a visible Retry action. Activation and owner counters prevent an obsolete download from reopening the panel or attaching to a disposed owner. Latest route, slot and hue requests carry through loading. Motion remains available without the runtime. Dock focus follows a stable control key rather than its position, since the floating placement has additional controls. The homepage still renders its real inline inspector immediately.

The dock is composed from parts, each reading the same controller:

```tsx
<InspectorDock placement='inline'>
  <InspectorStatus />
  <InspectorBody>
    <InspectorBrandPreview built={accent} />
  </InspectorBody>
  <InspectorControls />
</InspectorDock>
```

The home page renders that composition inside `InspectorSlot`, with the accent button's background and foreground resolved on the server from the build's graph for both themes. Its first paint contains a real token chain and contrast result. A native hue input retunes the accent before Inspect is opened. The controller coalesces color solving, CSS writes, and the preview snapshot into one frame; React reads that snapshot rather than querying a mutable engine during render. The page marks its heading with `data-inspect-preview`, so it is the first thing selected when inspecting starts. `FloatingInspector` renders the same parts in the layout while a visitor inspects away from that slot. It has a set height, so it never resizes as the selection changes, and it crosses to the other side of the screen when it would cover what has keyboard focus.

Appearance is a native System, Light, Dark radio group in the footer. System follows the OS; an explicit choice is stored under `ml:theme`, and returning to System removes it. A self contained head script applies the effective theme before body paint. The generated token CSS also follows a light OS when no theme attribute exists. Browser color scheme follows the same context; persistent `theme-color` tags retain the chosen palette across route changes. The controller handles OS and preference changes across tabs without downloading the inspection engine.

The initial homepage emits both built token chains and CSS selects the visible context before hydration. Once retuned, the live chain replaces that initial evidence. The graph also renders a static diagram per built context until the controller has read the effective preferences. The matching interactive diagram then takes over, without loading the engine for its initial trace under Default motion. Other contexts use the matching built theme while resolution is pending. An active engine resolves the accent report, severed reference and highlighted users again on theme changes, retaining or recovering token row focus. Theme swaps disable transitions briefly so controls do not interpolate through colors outside either palette.

The engine in `src/lib/inspector` loads on first use. It runs `@primitree/core` on the build's graph, indexes the document's stylesheets for rules that read a custom property, and decides which token paints a property by setting each candidate to a sentinel and reading the computed style. `src/tokens/README.md` has the detail.

Selected-element details and the broken-rule view load separately from the resting dock. The initial token chain, contrast, and hue input still render with the page. Intent warming and activation share one retryable detail-module request; Inspect waits for both the floating panel and the details before moving focus into either dock. Break a rule loads its details before mutating the graph, keeps its button focusable while busy, ignores duplicate pending requests, and exposes a retry if loading fails. Focus that entered the preview during loading moves to the surviving rule button before the body is replaced. A dock handoff retains its pending focus identity through a quick reversal before the floating panel mounts. Shared token rows accept the severed reference as composed content, so the initial preview does not pull that interaction into the first load.

The detail loader publishes its resolved component before activation updates the store. The first ready render uses that component directly, avoiding a second loading fallback that would collapse the inline body. The inline slot retains its token-based height on mobile as well as desktop. Findings live inside the scrollable report; the verdict, exit code, count, and controls stay outside it. Short viewports scroll the entire dock so its content remains reachable.

Keyboard: Tab moves through the page and selects each stop. Enter steps into the dock at the selection's first token. Escape steps back to the element, and from the page it stops inspecting. Focus is never left on a control that has gone.

## The X-ray

The hero's introduction renders twice from one function in `Hero.tsx`: as the page, and as a blueprint of itself that sits on top, cut off at a line. `HeroXRay` owns the line. Left of it is the page, right of it the blueprint: the name as an outline between its cap line, x height, and baseline, running text on its baselines, the spacing between parts as brackets, and the tokens each part reads.

- The blueprint copy is `aria-hidden` and `inert`, has no ids, links, or tracking, and never takes the pointer, so the real links under it still work. When one of them takes keyboard focus, the blueprint draws back so it can be seen.
- The line is the browser's range input stretched over the introduction. Only its thumb takes the pointer. Dragging, touch, and the arrow keys come from the platform.
- `--peel`, a registered custom property, is how far across the line sits. The stylesheet sets where it rests (`--rest`), the session's intro scans it across once, and it retreats to the edge while inspecting or while a rule is broken.
- The token paths the blueprint prints are in `hero-spec.ts`. `hero-spec.test.mjs` derives the custom properties each path stands for and fails if the rule it describes stops reading them. A gap is declared by value and by name in the same rule, in every block that sets one, and the test checks each pair, so a bracket's label can't drift from the space it measures.

## Breaking a rule

Break a rule makes one token hold a literal. On the page, everything that token paints comes unhooked: it tilts from a corner inside its outline (the motion is CSS in `globals.css`). In the dock, the verdict is spelled out a letter at a time, the literal's own characters drop away from the cut, and the token it was cut from hangs under the cut with a hue control, so a visitor can change the brand color and see that the broken token's elements do not follow.

Restoring a rule updates the real values immediately. If repair changes the held color, the dock's existing propagation signal travels from base through meaning to component and the specimen. The observer survives replacement of the broken body by reading its current host at playback. Unchanged repairs stay quiet; keyboard, Reduced, inspecting mode, selection, theme, and dock changes cancel playback.

The selection outline rides a spring (`src/lib/spring.ts`) instead of a CSS transition, because the pointer redirects it mid flight and it should keep its speed. The spring takes its duration from a motion token, so the reduced motion context stops it like everything else, and how far it passes its target from a number token (`semantic.spring.land`). A thrown dock lands on the same spring.

Dock handoffs use Motion's Mini entry through the lazy inspector engine. `dock-motion.ts` owns cancellation and returns transient inline styles to the dock after completion or interruption. `motion-tokens.ts` converts live duration tokens from milliseconds to seconds and CSS Bezier functions to Motion tuples. A zero duration bypasses the animation.

## The live token graph

`SiteTokenGraph` resolves an initial trace on the server. The same composition appears at `/system` and in the Primitree case study; the homepage inspector links to the full page. It uses the current site graph rather than a separate example document.

`traceTokens` follows a selected token's ancestors and transitive dependents in the active context. A broken reference retains its former edge from the built graph, so changing a base color visibly separates it from the held literal. Nodes show the actual resolved values and generated CSS variables. The client uses native selection and buttons with arrow navigation, measures DOM nodes for SVG connectors, and stacks the layers on narrow screens. Pointer selections draw the connectors with Mini; keyboard selections and reduced motion update immediately.

When a pointer changes a color, the graph compares settled resolved traces and follows changed values from base tokens through intact references. A short signal travels those existing connectors and the corresponding value rows move in dependency order. Values update immediately. Broken or unchanged branches stay still. One sequence can be active per graph; repeated changes with the same paths reuse it. Keyboard input, context or selection changes, resized connectors, errors, and unmount cancel it. Offscreen graphs skip new sequences, and Reduced resolves their timing to zero.

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

The system page's motion bench resolves three timing roles on the server with Primitree, including each duration's reference chain under Default, Slow, and Reduced. Playback reads those generated CSS variables through Motion mini. A native range control scrubs elapsed time; a bounded Bezier inversion maps that time to eased progress. Frame updates write to the sample, range, and plot refs without rendering React on every frame. New playback, scrubbing, resizing, role/context changes, and unmount cancel prior work; completion callbacks check the animation's identity. Reduced has no playback duration and shows the end state. The existing site motion controller owns the context, so this is one system setting shared with the inspector. `Slider` supports either a controlled `value` or native `defaultValue`, with both modes using the same input and visual treatment.

`pnpm tokens:raw` counts the design values components still write as literals, per file and category, against a ratcheting baseline in `scripts/raw-values.baseline.json`. A file can lose raw values but not gain them, and a new file starts at zero. It parses rather than pattern matches: postcss and postcss-value-parser for CSS, the TypeScript compiler for TS and TSX, and remark-mdx for MDX (`scripts/raw-values`).

What still bypasses the tokens:

- Geometry in older component CSS: padding, gap, margin, and radius literals. The spacing and radius scales exist and new components use them.
- Fixed white and black alphas and the remaining box shadows in older CSS Modules
- Hardcoded hex in the GlucoseIQ chart's SVG
- `src/lib/monokai-colors.ts`, which resolves hex values from Primitree's output for the Open Graph images. Those images also write literal colors inline, and the Monokai name is due to retire.

Both theme contexts pass token policy. The appearance control and bootstrap set `data-theme`; generated CSS supplies the OS fallback when that attribute is absent.

ESLint rejects route imports from components and UI imports from data/library modules. These checks support the ownership rules; review relative imports and new boundaries as part of code review too.

## Verification and release

Run `pnpm check` and `pnpm build`. For layout or client behavior changes, also check desktop/mobile rendering, pointer and keyboard paths, reduced motion, route history, and any changed demo or dialog against the previous preview.

With a development server already running, use `PORTFOLIO_BUILD_DIR=.next-verify pnpm build` so production verification does not replace the development server's generated files.

Keep licensed font binaries out of the public repository. Builds require the separately supplied originals. Preview deployment and production promotion are separate actions.

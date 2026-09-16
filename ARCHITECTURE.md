# Architecture

The route layer composes features. Each feature owns its components, styles, and feature-specific hooks. Shared UI stays small and has no portfolio-content dependencies.

## Ownership

```text
src/
  app/                  Routes, metadata, and the root layout
  components/
    shell/              Persistent header and shared footer
    navigation/         Primary/adjacent links and navigation history
    home/               Hero, working examples, selected work, testimonials
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
    ui/                 Content-independent icons and disclosure summary
    dev/                Development-only Figma variable inspection
  content/              Authored MDX
  data/                 Serializable project catalog and source data
  hooks/                Hooks shared across multiple features
  lib/                  Content loading, calculations, and service functions
  styles/               Global defaults, fonts, type/motion adapters
    generated/          Generated CSS; never edit by hand
  tokens/               Token sources and their generation contract
scripts/                Font checks, token generation, validation, tests
```

Import the component you need directly. There is no application-wide barrel, generic feature registry, or wrapper for every HTML element. A small repeated layout rule is preferable to a shared component with unrelated responsibilities.

## Server and client responsibilities

Pages, narrative content, the hero, selected work, and footer render on the server. Interactive selectors, the wordmark, gallery, navigation state, copy controls, and analytics are client boundaries. Pass rendered server content through `children` when a client frame needs behavior around it.

`CodeBlock` highlights code on the server using the synchronous Prism entry. `CodeBlockFrame` owns clipboard state and impression tracking. Syntax grammars are not needed by the copy button.

The FigmaVars provider wraps its development inspector only. Production pages read generated CSS and do not mount that runtime provider.

`PageTransition` retains one stable content wrapper. Pointer navigation animates only the committed page; keyboard navigation, history, hash navigation, and reduced motion remain immediate. The header stays outside that wrapper.

## Component contracts

- Fixed feature compositions keep their own content and state. Do not make every feature a configurable library component.
- Shared DOM wrappers retain native attributes and React 19 refs. Custom click handlers run before internal behavior and can cancel it with `preventDefault()`.
- Stateful demos keep inactive panels mounted so switching examples preserves local state. Their controls retain native button behavior and accessible selected/hidden states.
- Use JSX children for content, a small variant only for actual alternate presentations, and `className` for intentional styling overrides.
- Add controlled/uncontrolled state only when a consumer needs both. Avoid speculative prop surfaces and compound APIs for fixed layouts.

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

Component CSS Modules sit beside their owner. `globals.css` contains document defaults, fonts, focus and shared icon behavior. Header, timeline, and page geometry do not belong there. Shared reading styles live in `content/Prose.module.css`; route-specific article/table spacing stays with its feature.

Token JSON is the source of generated values. The generator and validator consume the same explicit source list, validate both supported modes and resolve references before emitting CSS. `pnpm tokens:check` compares output without overwriting it. `pnpm build` rejects stale output.

Fluid typography and motion are authored adapters over the token values. Geometry and all animation timings have not been converted to tokens. The local schema validates this repository's format; it is not a Primitree or DTCG certification.

ESLint rejects route imports from components and UI imports from data/library modules. These checks support the ownership rules; review relative imports and new boundaries as part of code review too.

## Verification and release

Run `pnpm check` and `pnpm build`. For layout or client behavior changes, also check desktop/mobile rendering, pointer and keyboard paths, reduced motion, route history, and any changed demo or dialog against the previous preview.

Keep licensed font binaries out of the public repository. Builds require the separately supplied originals. Preview deployment and production promotion are separate actions.

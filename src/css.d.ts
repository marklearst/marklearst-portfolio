// Next ships type declarations for '*.module.css' only, so a side-effect
// import of a plain stylesheet has no module to resolve (TS2882).
// TypeScript prefers the wildcard with the shortest match, so Next's
// '*.module.css' declaration still wins for CSS Modules.
declare module '*.css'

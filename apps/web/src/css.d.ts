/**
 * Ambient types for global CSS side-effect imports (`import "./globals.css"`).
 * Next only ships declarations for `*.module.css`; plain CSS needs this for
 * `noUncheckedSideEffectImports` / TS2882 in newer TypeScript language services.
 */
declare module "*.css";

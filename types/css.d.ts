// Ambient declaration for global stylesheet side-effect imports
// (e.g. `import "@app/styles/globals.css"`). Next.js only ships typings for
// CSS Modules (`*.module.css`), so a plain global `*.css` side-effect import
// otherwise triggers TS2882 ("no declaration for the side-effect import").
declare module "*.css";

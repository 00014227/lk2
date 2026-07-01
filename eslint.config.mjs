import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";
import perfectionist from "eslint-plugin-perfectionist";
import unusedImports from "eslint-plugin-unused-imports";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // ── Feature-Sliced Design layer boundaries ──────────────────────────────────
  // Scoped to src/ (the FSD root). The Next.js router in app/ is the composition
  // entry point and is intentionally not linted here.
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
      },
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        { type: "app", pattern: "src/app", mode: "folder" },
        { type: "views", pattern: "src/views/*", mode: "folder", capture: ["slice"] },
        { type: "widgets", pattern: "src/widgets/*", mode: "folder", capture: ["slice"] },
        { type: "features", pattern: "src/features/*", mode: "folder", capture: ["slice"] },
        { type: "entities", pattern: "src/entities/*", mode: "folder", capture: ["slice"] },
        { type: "shared", pattern: "src/shared/*", mode: "folder", capture: ["segment"] },
      ],
    },
    rules: {
      // A module may depend only on layers strictly below it (plus its own slice,
      // whose internal imports are not treated as cross-element dependencies).
      // Slices/entities are reachable only through their public API (index);
      // entities cross-import each other only through the @x notation.
      // Layer order: app > views > widgets > features > entities > shared.
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: [
            // app — composition root, may use everything below
            {
              from: { type: "app" },
              allow: {
                to: { type: ["app", "views", "widgets", "features", "entities", "shared"] },
              },
            },

            // views
            {
              from: { type: "views" },
              allow: {
                to: { type: ["widgets", "features", "entities"], internalPath: "index.{ts,tsx}" },
              },
            },
            { from: { type: "views" }, allow: { to: { type: "shared" } } },

            // widgets
            {
              from: { type: "widgets" },
              allow: { to: { type: ["features", "entities"], internalPath: "index.{ts,tsx}" } },
            },
            { from: { type: "widgets" }, allow: { to: { type: "shared" } } },

            // features
            {
              from: { type: "features" },
              allow: { to: { type: "entities", internalPath: "index.{ts,tsx}" } },
            },
            { from: { type: "features" }, allow: { to: { type: "shared" } } },

            // entities — cross-imports only via the @x public API
            {
              from: { type: "entities" },
              allow: { to: { type: "entities", internalPath: "@x/*.{ts,tsx}" } },
            },
            { from: { type: "entities" }, allow: { to: { type: "shared" } } },

            // shared
            { from: { type: "shared" }, allow: { to: { type: "shared" } } },
          ],
        },
      ],
    },
  },

  // ── Import sorting (FSD-aware) + unused-import cleanup ───────────────────────
  // perfectionist sorts imports into FSD layer groups; because the @-aliases look
  // like scoped packages, they are declared as internal via internalPattern and
  // matched to layer groups via customGroups. Applies to both the FSD src/ tree
  // and the root Next.js router in app/.
  {
    files: ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
    plugins: { perfectionist, "unused-imports": unusedImports },
    rules: {
      // Delegate unused detection to unused-imports (avoids double-reporting).
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      "perfectionist/sort-imports": [
        "warn",
        {
          type: "natural",
          order: "asc",
          newlinesBetween: 1,
          internalPattern: ["^@(app|views|widgets|features|entities|shared)/.*"],
          groups: [
            "builtin",
            "framework",
            "external",
            "app",
            "views",
            "widgets",
            "features",
            "entities",
            "shared",
            ["parent", "sibling", "index"],
            "type",
            "style",
            "side-effect",
            "unknown",
          ],
          customGroups: [
            { groupName: "framework", elementNamePattern: "^(react|react-dom|next)(/.*)?$" },
            { groupName: "app", elementNamePattern: "^@app/" },
            { groupName: "views", elementNamePattern: "^@views/" },
            { groupName: "widgets", elementNamePattern: "^@widgets/" },
            { groupName: "features", elementNamePattern: "^@features/" },
            { groupName: "entities", elementNamePattern: "^@entities/" },
            { groupName: "shared", elementNamePattern: "^@shared/" },
          ],
        },
      ],
    },
  },

  // eslint-config-prettier — MUST be last: turns off all formatting-related rules
  // so ESLint never fights Prettier.
  eslintConfigPrettier,
]);

export default eslintConfig;

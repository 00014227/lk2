# CLAUDE.md

Guidance for working in this repository. Read this first — it explains where things live and the rules the codebase enforces.

## Project

**TransAsia Logistics Portal** (`lk-front`) — a client-facing logistics portal for shipment visibility and tracking (fleet map, shipment table/detail, public tracking, delivery rating, chat). UI is in Russian (`<html lang="ru">`).

## Commands

| Command                | What it does                                                  |
| ---------------------- | ------------------------------------------------------------- |
| `npm run dev`          | Next.js dev server (http://localhost:3000)                    |
| `npm run build`        | Production build                                              |
| `npm start`            | Serve the production build                                    |
| `npm run lint`         | ESLint (report only)                                          |
| `npm run lint:fix`     | ESLint with `--fix` (auto-sorts imports, removes unused ones) |
| `npm run format`       | Prettier — format all files                                   |
| `npm run format:check` | Prettier — check formatting without writing                   |
| `npm run typecheck`    | `tsc --noEmit` — type-check the whole project                 |

Package manager is **npm**. There is **no test framework** configured.

## Stack

- **Next.js 16** (App Router) + **React 19**, with the **React Compiler** enabled (`reactCompiler: true` in `next.config.ts`).
- **TypeScript** in `strict` mode, `moduleResolution: "bundler"`.
- **Redux Toolkit** + `react-redux` for state.
- **axios** for HTTP.
- **Tailwind CSS v4** (no `tailwind.config` — theme lives in CSS, see Styling).
- **Radix UI** primitives + `class-variance-authority` + `clsx` + `tailwind-merge` for shadcn-style components; **lucide-react** icons.
- **Leaflet** / **react-leaflet** (+ gesture handling) for maps.
- **@dnd-kit** for drag-and-drop.
- **ESLint 9** flat config + **`eslint-plugin-boundaries`** (enforces the FSD layering below), **`eslint-plugin-perfectionist`** (import sorting) + **`eslint-plugin-unused-imports`**.
- **Prettier 3** for formatting + **`eslint-config-prettier`** (disables ESLint formatting rules) + **`prettier-plugin-tailwindcss`** (sorts Tailwind classes). See Formatting & imports.

## Formatting & imports

- **Prettier formats, ESLint checks logic.** Never hand-tune formatting that Prettier owns (indentation, quotes, line breaks) — run `npm run format`. `eslint-config-prettier` is loaded last in `eslint.config.mjs` so the two never conflict.
- **Config:** `.prettierrc.json` (`printWidth: 100`, double quotes/semicolons — matches existing code). `prettier-plugin-tailwindcss` needs `tailwindStylesheet` pointing at `src/app/styles/globals.css` (Tailwind v4 has no config file).
- **Imports are sorted automatically** by `perfectionist/sort-imports` into FSD-layer groups: `builtin → framework (react/next) → external → app → views → widgets → features → entities → shared → relative → type → style`, one blank line between groups. **Don't order imports by hand** — run `npm run lint:fix`. The `@`-aliases are declared `internal` + matched to layer groups via `customGroups` in `eslint.config.mjs`.
- **Tailwind classes are sorted** by the Prettier plugin — don't reorder `className` strings manually.
- **Unused imports/vars** are auto-removed by `unused-imports`; prefix intentionally-unused args/vars with `_` to keep them.
- **Pre-commit hook** (husky + lint-staged) runs `eslint --fix` + `prettier --write` on **staged** files automatically on `git commit` (config: `.husky/pre-commit` + the `lint-staged` block in `package.json`). Installed for everyone via the `prepare` script on `npm install`. Bypass in emergencies with `git commit --no-verify`. There is **no CI check** yet — the hook is local-only.
- **Editor:** `.vscode/settings.json` does format-on-save + ESLint auto-fix if you have the recommended extensions.

## Architecture — Feature-Sliced Design (FSD)

The app under `src/` follows FSD. Layers, from most composed to most reusable:

```
app  →  views  →  widgets  →  features  →  entities  →  shared
```

- **`views` is the FSD `pages` layer, renamed** — the names `pages`/`app` are reserved by Next.js.
- A module may import only from layers **strictly below** it, and each slice is reachable **only through its `index.ts` public API** — never reach into a slice's internal files.
- **Entities cross-import each other only through the `@x` public API** (see the dedicated section below).

These rules are **machine-enforced** by `eslint-plugin-boundaries` in `eslint.config.mjs`. Allowed dependencies:

| From       | May import                                                |
| ---------- | --------------------------------------------------------- |
| `app`      | everything below (composition root)                       |
| `views`    | `widgets`, `features`, `entities` (via `index`), `shared` |
| `widgets`  | `features`, `entities` (via `index`), `shared`            |
| `features` | `entities` (via `index`), `shared`                        |
| `entities` | other `entities` **only via `@x/*`**, `shared`            |
| `shared`   | `shared`                                                  |

### Path aliases (tsconfig)

`@app/*`, `@views/*`, `@widgets/*`, `@features/*`, `@entities/*`, `@shared/*`, and `@/*` (repo root).

### Relationship to the Next.js router

The Next.js router lives in the **repo-root `app/`** directory (not `src/app`) and is the routing composition root. Route files are thin — they just render a `@views/*` slice:

- `app/dashboard/page.tsx` → `export { default } from "@views/dashboard"`
- `app/dashboard/[id]/page.tsx` → renders `<ShipmentDetailView id={id} />` from `@views/shipment-detail`
- `app/page.tsx` → client redirect to `/dashboard` or `/login` based on auth state

The root `app/` router is intentionally **not** linted by the boundaries plugin (only `src/**` is).

## Where things live

- **`src/app`** — `providers/` (`AppProvider`, wraps the Redux `<Provider>`), `store/` (store config + typed hooks), `styles/globals.css`.
- **`src/views`** (6 slices) — full pages: `dashboard`, `shipment-detail` (route `/dashboard/[id]`), `login`, `setup-password`, `track` (public), `rating`.
- **`src/widgets`** (4) — `fleet-map`, `shipment-info`, `shipment-route-map`, `shipment-table`.
- **`src/features`** (7) — `auth`, `orders`, `track-shipment`, `create-shipment`, `rate-delivery`, `chat`, `notifications`.
- **`src/entities`** (5) — `shipment`, `vehicle`, `tracking`, `tariff`, `order-message`.
- **`src/shared`** — segments `api/` (axios client), `ui/` (~11 primitives: button, card, input, modal, sheet, badge, progress, star-rating, base-map, logo, auto-fit), `lib/` (`utils.ts`, `use-breakpoint.ts`, `geo/`, `store-hooks.ts`), `config/` (storage keys).

## Cross-imports (`@x` notation)

`@x` is **the sanctioned FSD mechanism** for one entity to reference another entity's types — it is **not** an antipattern (a direct import that bypasses a slice's public API is). It is the _only_ entity-to-entity import allowed by the boundaries rule in `eslint.config.mjs`.

Current cross-imports (all type-only, one-directional, no cycles):

- `src/entities/shipment/@x/tracking.ts` → re-exports type `Shipment`, consumed by `entities/tracking`.
- `src/entities/shipment/@x/vehicle.ts` → re-exports type `ShipmentStatus`, consumed by `entities/vehicle`.

**To add a new cross-import:** create `entities/<owner>/@x/<consumer>.ts` that re-exports what `<consumer>` needs, then import it as `@entities/<owner>/@x/<consumer>`.

Do **not** move domain types like `Shipment`/`ShipmentStatus` down into `shared` to "avoid" a cross-import — `shared` must stay free of business-domain knowledge, so that would be a bigger FSD violation than the `@x` import.

## State management

Store: `src/app/store/index.ts`. Registered reducers:

- `shipment`, `vehicle` — **entity slices**, hold the data (`items` + selectors).
- `orders` — a **feature slice** (`features/orders`), holds dashboard UI state (active tab, selection, loading/error).

Data flow: the `fetchMyOrders` thunk (`GET /orders/my`) dispatches `setShipments`/`setVehicles`, populating the entity slices. Always use the typed `useAppDispatch` / `useAppSelector` (exported from the store).

## API / backend

- axios client in `src/shared/api/client.ts`: `baseURL: "/api"`, a request interceptor attaches the JWT `Authorization: Bearer <token>` from `localStorage` (`TOKEN_KEY`, defined in `@shared/config`).
- `/api/*` is proxied to `process.env.BACKEND_URL` (defaults to `http://localhost:3000`) via `rewrites()` in `next.config.ts`.

## Styling / responsiveness

- Tailwind v4 with **no `tailwind.config`** — the theme is defined in `src/app/styles/globals.css` via `@theme inline`.
- **Fluid `clamp()` tokens** (`--spacing`, `--text-*`, `--radius`, `--container-app`) scale automatically from 320px → 4K, so existing utility classes (`p-6`, `text-sm`, `h-12`, `max-w-app`) resize on their own — **don't hand-tune sizes**. Use breakpoints only for _structural_ changes (stack→row, column count, show/hide).
- For JS breakpoint logic use the SSR-safe hook `src/shared/lib/use-breakpoint.ts` (`useBreakpoint`/`useIsMobile`/`useMediaQuery`), not `window.innerWidth`. Its `BREAKPOINTS` mirror Tailwind's (sm640/md768/lg1024/xl1280/2xl1536) — keep them in sync.
- Mobile-first: unprefixed classes target 320px, `sm:`/`lg:` build up.
- **Gotchas:** never write `*/` inside a CSS comment (Turbopack fails with "Unknown word"); flex/grid children with long text need `min-w-0` to avoid overflowing their track.

## Conventions

- Files are **kebab-case** (`login-form.tsx`, `use-table-filters.ts`).
- Slices use FSD segments: `ui/`, `model/`, `api/`, `lib/`, `config/` (not every slice uses all).
- Every slice has an `index.ts` barrel that defines its public API — import from the slice root, never from its internals.
- Add `"use client"` to interactive client components (views/layout default to server components).

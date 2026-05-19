# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm**. Test runner is **Vitest**. Formatter/linter is **Biome** (not Prettier/ESLint).

```bash
pnpm dev              # Vite dev server on :3000
pnpm build            # Production build (TanStack Start)
pnpm preview          # Preview production build
pnpm test             # Run vitest once (CI-style)
pnpm check            # Biome check (lint + format)
pnpm format           # Biome format only
pnpm lint             # Biome lint only
pnpm type             # TypeScript type check (no emit)
```

Single test: `pnpm vitest run path/to/file.test.ts` or `pnpm vitest run -t "test name"`.

### Database

Postgres is required. Local dev uses the Docker Compose stack; all `db:*` scripts load `.env.local` via `dotenv-cli`.

```bash
pnpm db:local:start   # start local postgres (compose.local.yaml)
pnpm db:local:stop    # stop local postgres
pnpm db:local:restart # restart local postgres
pnpm db:local:down    # tear down volumes (destructive)
pnpm db:generate      # prisma generate -> writes to prisma/generated/prisma & prisma/generated/prisma-idb
pnpm db:push          # push schema changes directly to the database (no migration files)
pnpm db:migrate       # prisma migrate dev (rarely used — see note below)
pnpm db:studio        # Prisma Studio
pnpm db:seed          # run prisma/seed.ts
```

Image/favicon pipelines (gulp): `pnpm favicons:generate`, `pnpm images:generate`.

This project does **not** use Prisma migrations in normal workflow — schema changes are applied with `pnpm db:push`. After editing any `.prisma` file, run `pnpm db:generate` to regenerate both the Postgres and IndexedDB clients, then `pnpm db:push` to sync the schema to the database.

Two Prisma clients are generated from a single `schema.prisma`:
- `prisma/generated/prisma` — Postgres server client (used via `src/db.ts` and `prisma/client.ts`).
- `prisma/generated/prisma-idb` — IndexedDB client for the browser (via `@prisma-idb/idb-client-generator`), used offline/client-side in `src/integrations/prisma-idb`.

Prisma is configured via `prisma.config.ts` with `schema: path.join('prisma')`, which enables Prisma's multi-file schema mode: every `.prisma` file under `prisma/` is auto-discovered. Per-game models live in `prisma/models/<gameId>.prisma` (currently `clairobscur.prisma`, `remnant2.prisma`, `slaythespire2.prisma`). No `@@prisma.import` directive is needed — just create the file.

## Skills

Skills live in `.claude/skills/`. Use the `/skill-name` slash command or reference them when working on relevant code.

| Skill | Use when |
|---|---|
| `tanstack-start` | Server functions, SSR, deployment |
| `tanstack-router` | Routes, loaders, search params, link generation |
| `tanstack-query` | `useQuery`, `useMutation`, query keys, cache invalidation |
| `tanstack-form` | Form state, validation, field arrays |
| `tanstack-virtual` | Virtualizing large lists |
| `tanstack-table` | Tables, sorting, filtering, pagination |
| `tanstack-store` | Reactive stores with `@tanstack/store` |
| `mantine-custom-components` | Creating components with Mantine Styles API, `factory()`, compound components |
| `better-auth-best-practices` | Auth config, plugins, session management |
| `web-design-guidelines` | Accessibility, UX review |

## Architecture

### Framework stack

- **TanStack Start** (SSR + server functions) on top of **TanStack Router** with file-based routing. `vite.config.ts` registers `tanstackStart()` before `@vitejs/plugin-react` — order matters.
- **React 19** with the **React Compiler** enabled. `babel-plugin-react-compiler` is installed as a dev dependency and is auto-detected by `@vitejs/plugin-react` v6+ — no explicit babel config is required, but the package must remain installed for the compiler to run. Write idiomatic React (no manual `useMemo`/`useCallback`/`React.memo` for values that don't need stable identity); the compiler handles memoization.
- **Mantine v9** for UI (core, dates, modals, notifications, carousel, spotlight, tiptap, code-highlight). `next-themes` drives the theme class on `<html>`.
- **Better Auth** for auth, mounted as a catch-all route at `src/routes/api/auth/$.ts`. Prisma adapter, Discord OAuth, email/password with Resend-sent verification + reset emails (React Email templates in `src/emails/auth/`).
- **TanStack Query** integrated with the router via `setupRouterSsrQueryIntegration` in `src/router.tsx`. Shared `QueryClient` is created in `src/integrations/tanstack-query/get-context.ts` and attached to router context.

### Routing

- Routes live in `src/routes/`. `routeTree.gen.ts` is **generated** — do not edit (also marked read-only in `.vscode/settings.json` and excluded from Biome).
- Root shell is `src/routes/__root.tsx`: renders `<html>`, the Mantine `AppShell` (header + navbar + footer), and mounts `AppProviders` (`src/components/AppProviders.tsx`). The provider chain is `NuqsAdapter` -> `MantineProviderWithTheme`; `MantineProviderWithTheme` itself wraps children in Mantine's `ModalsProvider`, and a `ScreenshotPreviewProvider` is also rendered inside it.
- The root route's `beforeLoad` resolves an authoritative `ssrGameId` for every request (see "Active-game resolution" below) and exposes it via route context.
- Game-scoped URLs live under `src/routes/$gameId/` — the `$gameId` path segment feeds into the root `beforeLoad`'s resolution chain; the segment itself drives favicon `<link>` tags via the route's `head()`.
- Profile routes:
  - `src/routes/profile/` — the anonymous/offline-friendly profile shell. Always reachable, even when signed out or offline (it renders the local DAL view). When the user is both authenticated **and** online, `route.tsx` redirects to `/account/profile/$userId` with the current session's user id.
  - `src/routes/account/profile/$userId/` — the canonical, userId-keyed profile route. Used for both the current user (after the redirect above) and public views of other users.
- HTML head metadata:
  - Root tags (title, og:*, twitter:*) are defined in `__root.tsx`. Routes can override them with their own `head()` — TanStack Router merges by `property`/`name`, with child routes winning on key conflicts.
  - The canonical profile route (`/account/profile/$userId`) overrides root metadata with user-specific OG/Twitter tags. The OG image is the active-game avatar override → primary avatar → legacy `avatarUrl` → site default. The active game here resolves as `subdomain → ?gameId= → active-game cookie` (the loader-context route-segment chain isn't used for OG since the profile path itself never carries a gameId segment). The cookie matters because the owner often lands on a profile tab via in-app nav with no `?gameId=` in the URL; including the cookie keeps the SSR'd OG consistent with what they see on screen, while crawlers without the cookie still get the correct preview when the shared URL carries `?gameId=` (the in-tab `useEffect` in `collected-items.tsx` mirrors the active gameId into the URL on hydration). The loader reuses the cached result of `getServerResolvedGameInputsServerFn` (`src/features/game/dal/active-game.ts`, queryKey `SERVER_GAME_INPUTS_QUERY_KEY` from `src/routes/__root.tsx`) that the root `beforeLoad` already populated, so no extra server call fires.
  - Per-tab title overrides (e.g. "Display Name — Collected Items | Toolkits.gg") use the shared helpers in `src/features/auth/core/profile-tab-head.ts`. Each tab's `loader` calls `loadProfileTabData()` (cache-hit from the parent loader's `ensureQueryData` — no extra fetch).

### Game registry pattern

Everything game-specific hangs off a central registry. Each game under `src/games/<gameId>/` exposes a `core/game-config/index.ts` that exports:

```typescript
const GAME_CONFIG = {
  ITEMS,         // { all, collectable, categorized, categories, uncollectableCategories }
  THEME,         // ToolkitThemeDefinition | undefined
  METADATA,      // id, name, label, description, faviconSourcePath, LogoComponent, externalResources[]
  PAGES,         // { renderItemLookup, renderCollectedItems }
  SEARCH_PARAMS, // nuqs search param cache | undefined (when the game has no custom filters)
  AVATARS,       // GameAvatar[] (optional)
  DAL,           // { collectedItems: GameCollectedItemsDal }
} satisfies GameConfig<LocalItem, CategoryEnum>;
export { GAME_CONFIG };
```

`src/features/game/registry/game-registry.tsx` wires every `gameId` to its `GameConfig` and exports: `GAME_REGISTRY`, `REGISTERED_GAME_IDS`, `getGameConfig()`, `getGameConfigTyped<TId>()`, `getGameItems()`, `getGameTheme()`, `getGameMetadata()`, `getGamePages()`, `getGameAvatars()`, `getGameLogoComponent()`, `getGameSearchParams()`, `getAllRegisteredThemeDefinitions()`, `getAllRegisteredThemeClassNames()`, `isRegisteredGameId()`, `getValidatedGameId()`.

The `GameId` enum is defined in `schema.prisma` and imported from `@/prisma`. `getAllRegisteredThemeDefinitions()` expands each game theme into light+dark variants plus a base `default-light`/`default-dark`.

### Feature/game separation rule

Game-specific logic (Prisma queries, sync handlers, server functions, DAL actions) must live in `src/games/<gameId>/`. Never add game-keyed branches or inline game handlers to files under `src/features/`.

DAL actions split by scope:
- **Cross-game** (e.g. `favoriteGames`, `userProfile`) -> `src/features/<feature>/dal/<entity>/` — currently all under `src/features/auth/dal/` since both belong to the authenticated-user surface area.
- **Game-specific** (e.g. `collectedItems`) -> `src/games/<gameId>/dal/`

Within each cross-game DAL folder, files follow a consistent suffix convention:

- `<entity>.ts` — TanStack Start server functions (Postgres reads/writes via Prisma)
- `<entity>.idb.ts` — IndexedDB layer (local reads/writes via the prisma-idb client)
- `<entity>.actions.ts` — `defineDalRead` / `defineDalWrite` action definitions wiring `remote` to the server functions and `local` to the IDB helpers
- `sync-handler.server.ts` — server-side sync handler invoked by `applyPendingOpServerFn`

All cross-game aggregation maps (registries) belong in `src/features/game/registry/`. When adding a new game, that folder is the single place to look for all maps that need a new entry — `game-registry.tsx`, `game-sync-handler-registry.ts`, `game-db-seed-registry.ts`, `game-idb-seed-registry.ts`, `favicon-registry.json`. Registry files may import from `src/games/` but must not contain any per-game business logic inline.

### Adding a new game

Follow these steps in order. The registry is the single place to check; no other `src/features/` files need changes.

1. **Add the enum value** — open `prisma/schema.prisma` and append the new id to `enum GameId`.

2. **Create game models** — copy an existing `prisma/models/<gameId>.prisma` as a template and create `prisma/models/<newGameId>.prisma`. No `@@prisma.import` is needed — Prisma's multi-file schema (configured in `prisma.config.ts`) auto-discovers every `.prisma` file under `prisma/`.

3. **Generate & push** — `pnpm db:generate && pnpm db:push`.

4. **Scaffold the game directory** — create `src/games/<newGameId>/` with the two top-level folders `core/` and `dal/`:

   ```
   core/
     game-config/
       index.ts          # exports GAME_CONFIG satisfies GameConfig<LocalItem, CategoryEnum>
       metadata.tsx      # id, name, label, description, faviconSourcePath, LogoComponent
       pages.tsx         # GamePages with renderItemLookup() and renderCollectedItems()
       theme.ts          # ToolkitThemeDefinition (colors, Mantine overrides) — uses generateThemeColors() from #/features/theme/core/generate-palette
       items.ts          # item data + categorization
       search-params.ts  # nuqs parsers (optional — only if custom filters needed)
       avatars.ts        # GameAvatar[] (optional)
       db-seed.ts        # GameDBSeed (initial Postgres data)
       idb-seed.ts       # GameIDBSeed (initial IndexedDB data)
     item-data/          # raw item definitions consumed by game-config/items.ts
     types.ts            # game-specific TypeScript types (LocalItem, etc.)
     constants.ts        # game-specific constants
     Logo.tsx            # game logo component referenced by metadata.LogoComponent
   dal/
     collected-items.ts  # exports the GameCollectedItemsDal via createCollectedItemsDal()
     server/
       collected-items.ts # TanStack Start server functions for collect/uncollect/list
       sync-handler.ts    # collectedItemSyncHandler — registered in game-sync-handler-registry.ts
   ```

   The DAL action file (`dal/collected-items.ts`) is a thin wrapper that calls `createCollectedItemsDal({ entityName, getModel, serverFns })` from `#/features/dal/core/create-collected-items-dal`.

5. **Register in all registry files** (all live in `src/features/game/registry/`):

   | File | What to add |
   |---|---|
   | `game-registry.tsx` | Entry in `GAME_REGISTRY` object |
   | `game-db-seed-registry.ts` | Entry in `allGameDBSeeds` |
   | `game-idb-seed-registry.ts` | Entry in `allGameIDBSeeds` |
   | `game-sync-handler-registry.ts` | Entry mapping entity name -> `collectedItemSyncHandler` |
   | `favicon-registry.json` | `"<gameId>": "<favicon-path>"` |

### Active-game resolution

GameId resolution is SSR-deterministic: the root route's `beforeLoad` (in `src/routes/__root.tsx`) computes an authoritative `ssrGameId` per request and exposes it via route context. Components read it through `useGameId()` (`src/features/game/core/use-game-id.ts`), which merges the SSR value with a client-only in-memory store used for mid-session toggles.

**Priority chain inside `beforeLoad`:**
1. **Subdomain** — from the `Host` header (e.g. `remnant2.toolkits.gg` → `remnant2`).
2. **Dev override** `?_game=` — only when `import.meta.env.DEV`. Used to test subdomain behavior on `localhost`.
3. **Route segment** — leading `/$gameId/...` in `location.pathname`.
4. **Search param** `?gameId=`.
5. **Cookie** `active-game` — durable user preference, written by `GameSwitcher` via `setActiveGameCookie()` (in `#/features/game/core/utils`).
6. Fallback `null` → resolves to `"none"` in `useGameId()`.

**Server-side resolution:** `getServerResolvedGameInputsServerFn` in `src/features/game/dal/active-game.ts` reads the Host header and the `active-game` cookie via `getRequest()`. Cached for the session via `queryClient.ensureQueryData` (queryKey `SERVER_GAME_INPUTS_QUERY_KEY` exported from `src/routes/__root.tsx`) with `staleTime: Infinity`, so it runs at most once per page load even when other loaders (e.g. the profile route) need the same inputs.

**Client layer:** the `@tanstack/store` at `src/features/game/core/store.ts` is a thin reactive layer (`{ gameId: GameId | null }`) used by `GameSwitcher` for mid-session toggles. `useGameId()` returns `clientStore.gameId ?? ssrGameId ?? "none"` — the client store wins when set so a switcher click updates the UI immediately, but on initial paint the store is empty and the SSR value wins (deterministic hydration).

**Writing from `GameSwitcher`:** `handleSelectGame` calls `setActiveGameCookie(id)` (durable) + `setGame(id)` (immediate UI reactivity). `handleGoHome` clears both.

Because every input in the chain is server-knowable, no `ClientOnly` wrappers are needed for gameId-driven render output. (`ClientOnly` is still used for genuinely client-only state like `UserMenu`'s auth status.)

### Theme system

- Mantine theme objects live in `src/features/theme/themes/` (base + default) and per-game in `src/games/<gameId>/core/game-config/theme.ts`. Per-game palettes are built with `generateThemeColors()` from `#/features/theme/core/generate-palette`.
- `MantineProviderWithTheme` reads the active Mantine theme from `#/features/theme/core/store` (`useMantineThemeStore`) and feeds `next-themes` with the full list of registered theme class names (`getAllRegisteredThemeClassNames()`), so `html[data-theme]`/`className` toggling is driven off the registry. It also nests Mantine's `ModalsProvider`.
- `SyncAndApplyTheme` syncs `next-themes` <-> the Mantine store and persists `autoChangeTheme` in `localStorage`.

### DAL (offline-first)

The DAL (`src/features/dal/`) is an offline-first data layer. Every read/write executes against either a **remote** backend (TanStack Start server functions -> Postgres) or a **local** backend (IndexedDB). The backend is chosen automatically by `chooseBackend()`: remote when the user is authenticated and online, local otherwise. Local writes are queued as `PendingOp`s and synced later with last-write-wins conflict resolution.

`src/features/dal/` contains:

- `core/` — `define-action.ts` (action factories), `create-collected-items-dal.ts` (the per-game DAL builder), `choose-backend.ts`, `to-query-options.ts`, `registry.ts`, `types.ts`
- `hooks/` — `useDalQuery`, `useDalMutation`, `useBackend`, `useDalContextSource`
- `identity/` — anon-id generation/persistence and `useEffectiveUserId`
- `local/` — IndexedDB constants, `local-db.ts` (prisma-idb client wrapper), and shared local row types
- `queue/` — `PendingOp` storage (`pending-ops.ts`), the `syncOps()` runner, last-write-wins resolution, and the `usePendingOps` hook
- `server/` — `apply-pending-ops.ts` server function and the cross-cutting collected-item handler/sync glue

See `src/features/dal/DIAGRAM.md` for mermaid diagrams of the read/write, sync, and LWW conflict-resolution flows.

```
Component
  └─ useDalQuery / useDalMutation
       └─ DalContext { anonUserId, authUserId, backend }
            ├─ "remote"  ->  action.remote(input, ctx)   (server function)
            └─ "local"   ->  action.local(input, ctx)    (IndexedDB)
                                 └─ [writes] enqueueOp() -> PendingOp -> syncOps()
```

**Key types:**

```typescript
interface DalContext {
  anonUserId: string;        // UUID from localStorage — always present
  authUserId: string | null; // set when signed in
  backend: "remote" | "local";
}
```

Use `ctx.authUserId ?? ctx.anonUserId` as the stable local user ID.

**Define actions** with the factory helpers:

```typescript
import { defineDalRead, defineDalWrite } from "#/features/dal/core/define-action";

// Read
const list = defineDalRead<void, MyItem[]>({
  queryKey: () => ["myEntity", "list"],
  remote: async (_input, _ctx) => myListServerFn(),
  local: async (_input, ctx) => listLocalItems(ctx.authUserId ?? ctx.anonUserId),
});

// Write
const upsert = defineDalWrite<MyInput, MyItem>({
  entity: "myEntity",
  operation: "upsert",
  invalidates: ["myEntity"],
  buildIdempotencyKey: (input, ctx) => `myEntity:upsert:${ctx.anonUserId}:${input.id}`,
  remote: async (input, _ctx) => myUpsertServerFn({ data: input }),
  local: async (input, ctx) => upsertLocalItem({ userId: ctx.authUserId ?? ctx.anonUserId, ...input }),
  sync: (op) => applyPendingOpServerFn({ data: op }),
});
```

**Use in components:**

```typescript
const { data } = useDalQuery(myActions.list, undefined);
const mutation = useDalMutation(myActions.upsert);
mutation.mutate({ id: "...", value: "..." });
```

**Server helpers** (use inside server functions only):

```typescript
import { requireUserId, getOptionalUserId } from "#/features/auth/dal/require-user.server";
const userId = await requireUserId();     // throws 401 if no session
const userId = await getOptionalUserId(); // returns null if unauthenticated
```

### Imports & path aliases

Two aliases are declared in both `package.json` `imports` **and** `tsconfig.json` `paths`:

- `#/*` -> `./src/*`.
- `@/prisma` -> `./prisma/client` — this is how you import `prisma` and generated types/enums (e.g. `import type { GameId } from "@/prisma"`). Do **not** import directly from `prisma/generated/prisma`.

### Env vars

Validated with zod in `src/config/env.ts`. `.env.local.example` is the template. **Never read `process.env` directly** — always use the type-safe accessors below.

**Server (private) vars** — import `serverEnv` from `#/config/env`. Keys: `DATABASE_URL`, `NODE_ENV`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `RESEND_KEY`.

```typescript
import { serverEnv } from "#/config/env";
const url = serverEnv.DATABASE_URL;
```

**Client (public) vars** — must be prefixed `VITE_*` and accessed via `import.meta.env`. Keys: `VITE_APP_NAME`, `VITE_APP_URL`, `VITE_CLOUDFRONT_URL`.

```typescript
const appUrl = import.meta.env.VITE_APP_URL;
```

Client-side `import.meta.env` is type-safe via `vite-env.d.ts` (repo root). Every `VITE_*` key must be declared in the `ImportMetaEnv` interface there or TypeScript will reject `import.meta.env.VITE_FOO`. When adding a new client env var, update `vite-env.d.ts` in addition to `.env.local.example` and `src/config/env.ts`.

## Code style

- **Tabs** for indentation, double quotes (Biome config). Organize-imports runs on save in VS Code.
- TypeScript is strict with `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` — always use `import type` for type-only imports.
- `routeTree.gen.ts` and `styles.css` are excluded from Biome; don't hand-edit them.
- **Arrow functions over `function` declarations.** Prefer `const foo = () => {}` over `function foo() {}` for all module-level functions. Do not use `function` declarations except where required (e.g. generators, or framework APIs that demand them).
- **Exports at the bottom of the file.** Declare everything (`const`, `type`, `class`, etc.) without an `export` keyword inline, then put a single `export { ... }` block (and `export type { ... }` if needed) at the very end of the file. No `export const`, `export function`, `export type`, or `export default` at the declaration site. This keeps the public surface area of each file visible in one place.

## Documentation

**After any non-trivial code change, check whether the contributor docs need to be updated.** Stale docs are worse than missing docs — a contributor who follows an out-of-date guide loses time and trust.

The contributor-facing docs live in two places:

- `.github/CONTRIBUTING.md` — entry point: workflow, code style, commit/PR conventions, links to the deep dives.
- `docs/LOCALSETUP.md` — environment setup (Node, pnpm, Docker, env vars, db scripts, troubleshooting).
- `docs/ARCHITECTURE.md` — framework stack, routing, active-game store, the game registry pattern, the feature/game separation rule, "Adding a new game" checklist.
- `docs/THEMES.md` — per-game theming, palette generation, light/dark handling.
- `docs/DAL.md` — offline-first data layer, action factories, sync queue.

And `CLAUDE.md` itself (this file) is the source of truth for AI-assisted work — keep it in sync with the contributor docs when the underlying behavior changes.

Use this checklist when finishing a change:

- Did you add, remove, or rename a `pnpm` script? Update `CLAUDE.md` Commands, `CONTRIBUTING.md`, and `LOCALSETUP.md`.
- Did you add or change an env var? Update `.env.local.example`, `src/config/env.ts`, `CLAUDE.md` Env vars, `LOCALSETUP.md` config table, and `ARCHITECTURE.md` Env vars. **If it's a client-side `VITE_*` var, also add it to `vite-env.d.ts`'s `ImportMetaEnv` interface** — without that, `import.meta.env.VITE_FOO` won't typecheck.
- Did you add a new game, change the registry shape, or change "Adding a new game" steps? Update `CLAUDE.md` Architecture and `docs/ARCHITECTURE.md`.
- Did you change the theme system (palette generator, light/dark switching, registry expansion)? Update `docs/THEMES.md`.
- Did you change DAL action shapes, the sync flow, or the file conventions under `src/features/dal/` or `src/games/*/dal/`? Update `docs/DAL.md` and `src/features/dal/DIAGRAM.md` if the diagrams are now wrong.
- Did you change routing structure (root shell, provider chain, profile redirect, `$gameId` route behavior)? Update `CLAUDE.md` Routing and `docs/ARCHITECTURE.md` Routing.

If you're unsure whether a change warrants a doc update, mention it in your response so the user can decide — don't silently skip it.

# Architecture

This document covers the parts of the codebase that aren't obvious from reading the source: how the framework pieces fit together, how the game-agnostic registry works, and how to add a new game.

> [!TIP]
> Pair this doc with the [DAL guide](DAL.md) (persisted data) and the [Themes guide](THEMES.md) (visual identity per game). Most non-trivial changes touch at least two of the three.

## Framework stack

- **[TanStack Start](https://tanstack.com/start)** for SSR and server functions, layered on **[TanStack Router](https://tanstack.com/router)** with file-based routing. The order matters in `vite.config.ts` — `tanstackStart()` must be registered **before** `@vitejs/plugin-react`.
- **React 19** with the **React Compiler** enabled. The compiler is auto-detected by `@vitejs/plugin-react` v6+ as long as `babel-plugin-react-compiler` is installed as a dev dependency (it is). Write idiomatic React — no manual `useMemo` / `useCallback` / `React.memo` for ordinary values. The compiler handles memoization. Only reach for those hooks when you need stable identity for an external API.
- **[Mantine v9](https://mantine.dev)** for the component library — core, dates, modals, notifications, carousel, spotlight, tiptap, code-highlight. `next-themes` drives the theme class on `<html>`.
- **[Better Auth](https://better-auth.com)** for authentication, mounted as a catch-all route at `src/routes/api/auth/$.ts`. Prisma adapter, Discord OAuth, email/password with verification + reset emails (React Email templates in `src/emails/auth/`) sent via Resend.
- **[TanStack Query](https://tanstack.com/query)** integrated with the router via `setupRouterSsrQueryIntegration` in `src/router.tsx`. A shared `QueryClient` is created in `src/integrations/tanstack-query/get-context.ts` and attached to the router context.

## Routing

Routes live in `src/routes/`. The file system is the source of truth — TanStack Router's plugin generates `routeTree.gen.ts` from the file layout.

> [!IMPORTANT]
> Never hand-edit `routeTree.gen.ts`. It's marked read-only in `.vscode/settings.json` and excluded from Biome. If it looks broken, delete it and re-run `pnpm dev`.

### Key routes to know

- `src/routes/__root.tsx` — the root shell. Renders `<html>`, the Mantine `AppShell` (header + navbar + footer), and mounts `AppProviders` (`src/components/AppProviders.tsx`). The provider chain is:

  ```
  NuqsAdapter
    └─ GameProvider
        └─ MantineProviderWithTheme
            └─ ModalsProvider
                └─ ScreenshotPreviewProvider
                    └─ <Outlet />
  ```

- `src/routes/$gameId/` — every URL scoped to a specific game. The `gameId` param is written into the active-game store on mount (see below).

- `src/routes/profile/` — the **offline-friendly** profile shell. Always reachable, even when signed out or offline (it renders the local DAL view). When the user is both authenticated *and* online, `route.tsx` redirects to `/account/profile/$userId` with the current session's user id.

- `src/routes/account/profile/$userId/` — the canonical, userId-keyed profile route. Used for both the current user (after the redirect above) and for viewing other users publicly.

## The active-game resolution

The active game is tracked in a `@tanstack/store` at `src/features/game/core/store.ts` (exports `gameStore` and `setGame`). It has a `source` priority — when multiple callers want to set the game, the highest-priority source wins:

```
subdomain > route > toggle/session > default
```

The store is rehydrated from `localStorage` (`active-game` key) on module load. Two callers write to it:

- **`GameProvider`** (client-only, mounted via `AppProviders` in `__root.tsx`) reads `window.location.hostname` via `parseSubdomain` from `#/features/game/core/utils`. There's a `?_game=` query override for development.
- **`src/routes/$gameId/route.tsx`** calls `setGame(gameId, "route")` on every navigation under the `$gameId` segment.

> [!CAUTION]
> A `subdomain`-sourced value deliberately wins over later `route` writes. If you change this precedence, you'll break per-game subdomains (`clairobscur.toolkits.gg`, etc.) — be sure that's what you intend.

## The game registry pattern

This is the single most important pattern in the codebase. **Everything game-specific hangs off a central registry.** If you're tempted to write `switch (gameId)` inside a feature module, you're working against the pattern.

### Anatomy of a game

Each game lives at `src/games/<gameId>/` and exposes a `GAME_CONFIG` from `core/game-config/index.ts`:

```typescript
const GAME_CONFIG = {
  ITEMS,         // { all, collectable, categorized, categories, uncollectableCategories }
  THEME,         // ToolkitThemeDefinition | undefined
  METADATA,      // id, name, label, description, faviconSourcePath, renderLogo(), externalResources[]
  PAGES,         // { renderItemLookup, renderCollectedItems }
  SEARCH_PARAMS, // nuqs search param cache | undefined (when the game has no custom filters)
  AVATARS,       // GameAvatar[] (optional)
  DAL,           // { collectedItems: GameCollectedItemsDal }
} satisfies GameConfig<LocalItem, CategoryEnum>;
export { GAME_CONFIG };
```

### The registry itself

`src/features/game/registry/game-registry.tsx` wires every `gameId` to its `GameConfig` and exports the helpers everything else uses:

```typescript
GAME_REGISTRY                      // the raw map
REGISTERED_GAME_IDS                // ordered list of every gameId
getGameConfig(id)                  // full config, loosely typed
getGameConfigTyped<TId>(id)        // full config, narrowed to TId
getGameItems(id)
getGameTheme(id)
getGameMetadata(id)
getGamePages(id)
getGameAvatars(id)
getGameLogo(id)
getGameSearchParams(id)
getAllRegisteredThemeDefinitions()
getAllRegisteredThemeClassNames()
isRegisteredGameId(id)
getValidatedGameId(id)             // throws if not registered
```

The `GameId` enum is the source of truth — it's defined in `prisma/schema.prisma` and imported from `@/prisma`.

`getAllRegisteredThemeDefinitions()` expands each game theme into light + dark variants plus a base `default-light` / `default-dark`. See the [Themes guide](THEMES.md) for details.

## Feature / game separation rule

This is the hard rule that makes the registry pattern work:

> **Game-specific logic (Prisma queries, sync handlers, server functions, DAL actions) must live in `src/games/<gameId>/`. Never add game-keyed branches or inline game handlers to files under `src/features/`.**

In practice that means:

| Logic type | Lives in |
|---|---|
| Cross-game DAL actions (`favoriteGames`, `userProfile`) | `src/features/<feature>/dal/<entity>/` — currently all under `src/features/auth/dal/` since both belong to the authenticated-user surface |
| Game-specific DAL actions (`collectedItems`) | `src/games/<gameId>/dal/` |
| The registry that maps game id -> handler | `src/features/game/registry/` |
| Per-game item data, themes, pages, logos | `src/games/<gameId>/` |

Within each cross-game DAL folder, files follow a consistent suffix convention:

- `<entity>.ts` — TanStack Start server functions (Postgres reads/writes via Prisma)
- `<entity>.idb.ts` — IndexedDB layer (local reads/writes via the prisma-idb client)
- `<entity>.actions.ts` — `defineDalRead` / `defineDalWrite` action definitions wiring `remote` to server functions and `local` to IDB helpers
- `sync-handler.ts` — server-side sync handler invoked by `applyPendingOpServerFn`

All cross-game aggregation maps (the registries) belong in `src/features/game/registry/`. When you add a new game, that folder is **the single place** to look for everything that needs a new entry.

## Adding a new game

Follow these steps in order. The registry folder is the only place outside `src/games/<newGameId>/` that you should need to touch.

### 1. Add the enum value

Open `prisma/schema.prisma` and append the new id to `enum GameId`.

### 2. Create the game's Prisma models

Copy an existing `prisma/models/<gameId>.prisma` as a template and create `prisma/models/<newGameId>.prisma`. No `@@prisma.import` directive is needed — Prisma's multi-file schema (configured in `prisma.config.ts` with `schema: path.join('prisma')`) auto-discovers every `.prisma` file under `prisma/`.

### 3. Generate the clients and push the schema

```bash
pnpm db:generate
pnpm db:push
```

### 4. Scaffold the game directory

Create `src/games/<newGameId>/` with two top-level folders, `core/` and `dal/`:

```
core/
  game-config/
    index.ts          # exports GAME_CONFIG satisfies GameConfig<LocalItem, CategoryEnum>
    metadata.tsx      # id, name, label, description, faviconSourcePath, renderLogo()
    pages.tsx         # GamePages with renderItemLookup() and renderCollectedItems()
    theme.ts          # ToolkitThemeDefinition (colors, Mantine overrides) — uses generateThemeColors()
    items.ts          # item data + categorization
    search-params.ts  # nuqs parsers (optional — only if custom filters)
    avatars.ts        # GameAvatar[] (optional)
    db-seed.ts        # GameDBSeed (initial Postgres data)
    idb-seed.ts       # GameIDBSeed (initial IndexedDB data)
  item-data/          # raw item definitions consumed by game-config/items.ts
  types.ts            # LocalItem and other game-specific TS types
  constants.ts        # game-specific constants
  Logo.tsx            # logo component referenced by metadata.renderLogo()
dal/
  collected-items.ts  # exports the GameCollectedItemsDal via createCollectedItemsDal()
  server/
    collected-items.ts # TanStack Start server functions for collect/uncollect/list
    sync-handler.ts    # collectedItemSyncHandler — registered in game-sync-handler-registry.ts
```

The DAL action file (`dal/collected-items.ts`) is a thin wrapper around `createCollectedItemsDal({ entityName, getModel, serverFns })` from `#/features/game/dal/collected-items/collected-items.actions`. The factory handles all the offline/online switching — your game just supplies the model accessor and server functions.

### 5. Register in every registry file

All five live in `src/features/game/registry/`:

| File | What to add |
|---|---|
| `game-registry.tsx` | Entry in `GAME_REGISTRY` mapping `<newGameId>` -> `GAME_CONFIG` |
| `game-db-seed-registry.ts` | Entry in `allGameDBSeeds` |
| `game-idb-seed-registry.ts` | Entry in `allGameIDBSeeds` |
| `game-sync-handler-registry.ts` | Entry mapping the entity name (e.g. `collectedItems`) -> `collectedItemSyncHandler` |
| `favicon-registry.json` | `"<newGameId>": "<favicon-path>"` |

That's it — no `src/features/` files need to change. If you find yourself editing anything else under `src/features/` to support the new game, stop and ask whether the logic actually belongs in `src/games/<newGameId>/` instead.

### 6. Generate favicons and item images

Once your `favicon-registry.json` entry exists and your `item-data/` files reference their source images, run the two Gulp pipelines:

```bash
pnpm favicons:generate   # required after adding/changing a favicon-registry.json entry
pnpm images:generate     # required after adding/changing item images
```

**Favicons (`pnpm favicons:generate`)** — reads `src/features/game/registry/favicon-registry.json`, fetches each entry's source image from CloudFront, runs it through the [`favicons`](https://www.npmjs.com/package/favicons) package, and writes the generated icons to `public/favicons/<gameId>/`. Re-run any time you add, remove, or change a favicon registry entry.

**Item images (`pnpm images:generate`)** — generates resized variants of every item image used by every registered game. Source images are stored on CloudFront; the resized output lives under `.images/<gameId>/...` and is checked into the repo so production builds don't need to refetch.

How it works:

1. Iterates every `gameId` in `favicon-registry.json` (excluding `"default"`).
2. For each game, scans `src/games/<gameId>/core/item-data/*.ts` for `imageUrl: "..."` string literals — that's how it discovers what to resize. **If you add an item, set its `imageUrl` and re-run the script.**
3. Fetches each source from `<CLOUDFRONT_URL>/games/<gameId>/<imageUrl>`.
4. Resizes to every preset defined in `src/features/game/registry/image-sizes.json` (currently `xs`/`sm`/`md`/`lg`/`xl`, from 32×32 to 512×512).
5. Writes each variant to `.images/<gameId>/<dir>/resized/<base>-<w>x<h><ext>`.

The pipeline is **idempotent** — for each item it checks whether every expected output already exists on disk and skips the fetch entirely if they do. Only missing variants are regenerated, so re-running after small changes is cheap.

If you replace a CloudFront original with new content at the same path (i.e. the URL didn't change but the bytes did), delete the relevant `.images/<gameId>/...` subtree first to force regeneration — the idempotency check has no way to know the source changed.

If you add a new size to `image-sizes.json`, every existing item picks it up on the next `pnpm images:generate` run (only the missing variant is generated; existing variants are skipped).

### 7. Run it

```bash
pnpm db:seed   # picks up the new game's db-seed.ts
pnpm dev
```

Navigate to `/<newGameId>` (or set up a local hostname mapping for `<newGameId>.localhost:3000` if you want to test the subdomain path).

## Imports & path aliases

Two aliases are declared in **both** `package.json` `imports` and `tsconfig.json` `paths`. If you change one, change the other.

- `#/*` -> `./src/*`
- `@/prisma` -> `./prisma/client` — this is how you import `prisma` and generated types/enums (e.g. `import type { GameId } from "@/prisma"`). **Never** import directly from `prisma/generated/prisma` — that bypasses the type wrapper and breaks the two-client setup.

## Env vars

All env vars are validated by zod in `src/config/env.ts`. `.env.local.example` is the canonical template.

> [!IMPORTANT]
> Never read `process.env` directly. Always use the type-safe accessors below.

**Server (private) vars** — import `serverEnv` from `#/config/env`. Keys: `DATABASE_URL`, `NODE_ENV`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `RESEND_KEY`.

```typescript
import { serverEnv } from "#/config/env";

const url = serverEnv.DATABASE_URL;
```

**Client (public) vars** — must be prefixed `VITE_*` and accessed via `import.meta.env`. Keys: `VITE_APP_NAME`, `VITE_APP_URL`, `VITE_CLOUDFRONT_URL`.

```typescript
const appUrl = import.meta.env.VITE_APP_URL;
```

Client-side `import.meta.env` is **type-safe** — the `ImportMetaEnv` interface in `vite-env.d.ts` (at the repo root) declares every `VITE_*` key. If a key isn't listed there, TypeScript will reject `import.meta.env.VITE_FOO`. This is intentional: it forces every client-side env var to be explicitly opted in, so typos and missing config are caught at compile time rather than silently resolving to `undefined` at runtime.

If you need a new env var, add it to:

1. `.env.local.example` (with a comment explaining what it's for)
2. `src/config/env.ts` (the zod schema)
3. **`vite-env.d.ts`** — only if it's a client-side `VITE_*` var. Add a `readonly VITE_FOO: string` line to the `ImportMetaEnv` interface so `import.meta.env.VITE_FOO` is typed.
4. The README's "Configuration" section if it's user-facing

## Where to go next

- **Persisted data** (collected items, profile, favorites) — read the [DAL guide](DAL.md). The DAL is offline-first; reaching for `useQuery` directly will silently break the offline experience.
- **Visual identity per game** — read the [Themes guide](THEMES.md).
- **Contributing in general** — see [CONTRIBUTING.md](CONTRIBUTING.md) for workflow and code style.

---

> _This documentation was generated with the help of an LLM._

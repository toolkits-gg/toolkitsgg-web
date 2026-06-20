# Contributing to toolkits.gg

Thanks for your interest in contributing! Whether you're fixing a typo, adding a feature, or adding support for a brand new game, this guide will get you oriented.

If you ever get stuck, come say hi in the [Discord](https://discord.gg/VQF23tPKyK).

## Table of contents

- [Where to start](#where-to-start)
- [Local setup](#local-setup)
- [Project tour](#project-tour)
- [Development workflow](#development-workflow)
- [Code style](#code-style)
- [Commit & PR conventions](#commit--pr-conventions)
- [Deep dives](#deep-dives)

## Where to start

- **Bug reports & feature requests** — [open an issue](https://github.com/toolkits-gg/toolkitsgg-web/issues). For bugs, include reproduction steps, the browser/OS you're using, and a screenshot if it's visual.
- **First-time contributors** — look for issues labelled `good first issue` or `help wanted`.
- **Adding a new game** — read the [Architecture guide](../documentation/ARCHITECTURE.md) end-to-end first; the "Adding a new game" section is your checklist.
- **Adding a theme** — read the [Themes guide](../documentation/THEMES.md).
- **Working with persisted data** (collected items, profile, favorites) — read the [DAL guide](../documentation/DAL.md). The DAL is offline-first; bypassing it will silently break the offline experience.

## Local setup

A full step-by-step is in [`LOCALSETUP.md`](../documentation/LOCALSETUP.md) — read that first. The TL;DR:

```bash
# 1. Install Node 22+, pnpm 11+, and Docker (see LOCALSETUP.md)
# 2. Clone and install
git clone https://github.com/toolkits-gg/toolkitsgg-web.git
cd toolkitsgg-web
pnpm install

# 3. Copy env template and fill in secrets
cp .env.local.example .env.local

# 4. Start Postgres, push the schema, seed
pnpm db:local:start
pnpm db:generate
pnpm db:push
pnpm db:seed

# 5. Run the dev server
pnpm dev
```

The app is now on <http://localhost:3000>.

## Project tour

```
src/
  routes/            # File-based routes (TanStack Router). routeTree.gen.ts is GENERATED.
  features/          # Cross-cutting features — auth, dal, game registry, theme system
  games/             # One folder per game; each is self-contained (config, items, DAL, logo)
  components/        # Shared React components
  integrations/      # Third-party glue (tanstack-query, prisma-idb)
  emails/            # React Email templates (auth)
  env/               # zod-validated env accessors — never read process.env directly
prisma/
  schema.prisma      # GameId enum + base models
  models/            # Per-game .prisma files (auto-discovered)
.github/             # Contributor docs: ARCHITECTURE, THEMES, DAL, LOCALSETUP
```

The most important rule for newcomers: **game-specific code never lives in `src/features/`**. If you find yourself reaching for a `switch (gameId)` inside a feature module, stop — that logic belongs in `src/games/<gameId>/`. See [Architecture](../documentation/ARCHITECTURE.md) for the registry pattern.

## Development workflow

| Command          | What it does                        |
|------------------|-------------------------------------|
| `pnpm dev`       | Vite dev server on :3000 (with HMR) |
| `pnpm test`      | Run vitest once                     |
| `pnpm check`     | Biome lint + format check           |
| `pnpm format`    | Apply Biome formatting              |
| `pnpm lint`      | Biome lint only                     |
| `pnpm type`      | TypeScript type check (no emit)     |
| `pnpm build`     | Production build                    |
| `pnpm db:studio` | Open Prisma Studio                  |

Run `pnpm check` and `pnpm type` before pushing — CI will reject anything that fails either.

### When the schema changes

After editing any `.prisma` file:

```bash
pnpm db:generate   # regenerates the Postgres client AND the IndexedDB client
pnpm db:push       # syncs the schema to your local Postgres
```

This project does **not** use Prisma migration files in the normal workflow — `db:push` is the source of truth for local dev.

## Code style

Biome enforces formatting and linting; the config is in `biome.json`.

- **Tabs** for indentation, double quotes for strings.
- **Arrow functions over `function` declarations** for module-level code.
- **Exports at the bottom of the file** — declare without `export`, then a single `export { ... }` block at the end. Don't use `export const`, `export function`, or `export default` at the declaration site.
- **`import type`** for type-only imports (strict `verbatimModuleSyntax`).
- **No manual memoization** (`useMemo`, `useCallback`, `React.memo`) for ordinary values — the React Compiler is enabled and handles this. Reach for them only when you genuinely need stable identity.
- **Path aliases:** `#/` -> `./src/`, `@/prisma` -> `./prisma/client`. Never import from `prisma/generated/prisma` directly.
- **Env vars:** import `serverEnv` from `#/env/server-env.ts` (server) or `clientEnv` from `#/env/client-env.ts` and read `clientEnv.VITE_*` (client). Never use `process.env` or `import.meta.env` directly.
- **Comments are off by default.** Only add one when the *why* is non-obvious. Don't restate what the code does.

## Commit & PR conventions

- Keep commits focused. One logical change per commit; one logical change per PR if you can.
- Commit messages: short imperative subject (`add discord login button`, `fix theme flash on cold load`). No issue prefix needed unless you want one.
- PR description should explain **why** the change is needed and any reviewer-facing context (screenshots for UI, repro steps for bug fixes, migration notes if the schema changed).
- Before opening a PR, make sure `pnpm check`, `pnpm type`, and `pnpm test` all pass.
- New games should be added in a single PR that includes the Prisma model, the `src/games/<gameId>/` folder, **every** registry entry from the checklist in [Architecture](../documentation/ARCHITECTURE.md), and a seeded sample so reviewers can see it in the UI.

## Deep dives

These three docs cover the non-obvious parts of the codebase. Read the one(s) relevant to your change.

| Doc                               | When you need it                                                                                              |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------|
| [Architecture](../documentation/ARCHITECTURE.md)   | Adding a game, touching the game registry, navigating routes, or wondering "where does this logic belong?"    |
| [Themes](../documentation/THEMES.md)               | Building a per-game theme, modifying the palette generator, or changing how light/dark switching works        |
| [DAL (data access layer)](../documentation/DAL.md) | Adding any persisted state — collected items, profile fields, favorites. Anything that needs to work offline. |

Thanks for contributing! ❤️


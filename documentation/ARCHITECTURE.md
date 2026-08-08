# Architecture

## Shape of the tree

```
src/
  routes/          TanStack Start file routes.
  components/      Game-agnostic UI. components/pages/* are whole page bodies.
  features/        Cross-cutting domains: auth, sync, local-db, theme, user, ...
  games/<game>/    Everything specific to one game.
    core/          Item data, types, and the game-config barrel.
    data/          Per-entity data access (client hooks + server fns + sync handler).
    wiki/          One-shot scrapers, run by hand. Not part of the app.
  games-registry/  The seams where games plug into the app.
  integrations/    Third-party wiring: better-auth, resend, pino, sentry, ...
  emails/          React Email templates.
```

## Games plug in through registries, not imports

Nothing in `components/` or `features/` imports a game. Games are reached only
through `src/games-registry/`, and each registry exists separately because each
is consumed differently (server or client, for example).

| Registry                          | Holds                                                    | Consumed by                                  |
|-----------------------------------|----------------------------------------------------------|----------------------------------------------|
| `public-registry.ts`              | Items, theme, metadata, avatars, wallpapers, inline tags | Anything, client included                    |
| `pages-registry.tsx`              | Each game's page renderers                               | Routes                                       |
| `builds-registry.ts`              | Build config                                             | Routes, nav, profile tabs                    |
| `idb-registry.ts`                 | Local-row claims for sign-in                             | Browser only                                 |
| `db-registry.ts`                  | Postgres reference-data seeds                            | `prisma/seed.ts`                             |
| `sync-handler-registry.server.ts` | `entity -> SyncHandler`                                  | `applyPendingOpServerFn`, server only        |
| `user-content-registry.server.ts` | "Hide everything this user published"                    | Moderation bans, server only                 |
| `favicon-registry.json`           | Logos for each game, converted to favicons               | `gulpfile.js`                                |

Two conventions worth noting:

- **All game content is opt-in** A game supports builds because it appears in
  `builds-registry`, has wallpapers because `WALLPAPERS` is non-empty, and is
  listed at all because it has items (`gameHasContent`). 
- **`REGISTERED_GAME_IDS` is a validation list, not a display list.** Roles,
  favorites, stored build image URLs, and subdomain routing all validate against
  it, so ids stay in it even when the game is hidden from the UI. Filter games out
  during display instead.

## Local-first data flow

Every write action works while unauthenticated. The path a write takes is decided
per hook depending on whether there is a session:

```
signed in   -> server fn -> prisma -> Postgres
signed out  -> local stores (IndexedDB) + enqueueOp(...)  [queued for later]
```

Signing in offers to drain the queue:

```
ClaimAnonDataOnSignIn
  -> claim-anon-data.ts       re-key local IDB rows to the auth user (reads flip first,
                              or the user watches their data vanish)
  -> sync-runner.ts           replay queued ops sequentially, FIFO
  -> applyPendingOpServerFn   re-validate at the boundary, dedupe by idempotency key
  -> syncHandlers[op.entity]  apply one op
```

Key modules split across two features. Everything that reconciles lives under
`features/sync/`:

- `entities.ts` - the `SyncableEntity` union. It is the join between the hooks
  that enqueue ops and the registry that applies them; an entity in one and not
  the other is a compile error rather than an op that retries forever.
- `queue/pending-ops.ts` - the queue itself, over the `ops` store.
- `last-write-wins.ts` - `compareTimestamps`, the conflict rule.
- `presence-sync-handler.ts` / `record-sync-handler.ts` - the two reconciliation
  factories. Presence rows only exist or don't (collected items, favorites);
  content records have mutable fields (builds, profiles). 

The browser storage it writes through is a feature of its own, `features/local-db/`,
which knows nothing about syncing beyond holding the queue's rows. The queue is one
consumer; the data hooks under `features/game/data/` and `games/*/data/` are the rest.

- `idb-store.ts` - the store factory every local read and write goes through, and
  `game-stores.ts` / `user-stores.ts` - the thirteen stores it declares.
  `local-db.ts` owns the one `openDB` call and the store definitions the upgrade
  creates, including the queue's `ops`. It is the only module that opens a
  database; anything reaching IndexedDB some other way is a bug.
- `claim-rows.ts` - re-keys locally-owned rows from the anon id to the auth user,
  the piece each game's local claim is built from.

## Server/client boundary

- `*.server.ts` opts a module into Start's import protection. Prisma may only be
  reached from these.
- `createServerFn` is extracted at compile time **by source position**, so those
  calls must stay hand-written at module scope in each game. Their handler bodies
  can delegate anywhere; the compiler strips the body, and prisma with it, from
  the client bundle.
- `*.sync.server.ts` holds an entity's sync handler, kept apart from its CRUD
  sibling so the replay path and direct data access don't tangle.
- The `@prisma/client` runtime is **not** in the client bundle. The local stores
  import the generated model types with `import type`, so the schema still types
  a local row while the runtime erases.

## Client bundle

`public-registry` now dominates on its own: ~1.2 MB raw / ~219 KB gzip of every
game's item tables, needed wherever items are rendered, and a static import of
the entry chunk. Measured over the eager set (the entry plus its 34 static
imports) it is roughly two fifths of ~514 KB gzip.

It used to share the top with the generated prisma-idb client, ~615 KB raw /
~56 KB gzip of query engine emitted for all 29 models to serve ten methods
across ten of them. That is gone: `features/local-db/` hand-rolls
the same ten methods in a few hundred lines, typed from the Prisma model types.

One thing there is still worth fixing. `ClaimAnonDataOnSignIn` runs
`claimAnonData` on every page load with a session, and `claimAnonData` calls
`getOrCreateAnonUserId()`, which **mints** a fresh anon id when none is stored.
Since that id never equals the auth user id, the guard below it always passes,
so a signed-in user with nothing to claim still opens IndexedDB and sweeps every
game's claim on every load. A peek that reads without creating would let it
return early.

## Profile routes come in two trees

- `/profile/*` serves signed-out local accounts; 
- `/account/profile/$userId/*` serves authenticated ones. 

`features/user/use-profile-links.ts` picks between them. Only
the authenticated tree validates a `gameId` search param. 
The duplication is known and deliberate.

## See also

- [LOCALSETUP.md](./LOCALSETUP.md) - getting a database and the app running
- [ADDING-A-GAME.md](./ADDING-A-GAME.md) - the per-game checklist
- [THEMES.md](./THEMES.md) - theme generation
- [../prisma/SEED.md](../prisma/SEED.md) - seeding

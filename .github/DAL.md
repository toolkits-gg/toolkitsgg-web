# The DAL (Data Access Layer)

The DAL is an **offline-first data layer**. Every read and write executes against either a remote Postgres backend (via TanStack Start server functions) or a local IndexedDB backend, and the choice is made automatically by `chooseBackend()` based on auth status and network connectivity.

If you're adding any persisted state to the app - collected items, profile fields, favorites, anything a user expects to keep - you go through the DAL. Reaching for `useQuery` directly will silently break the offline experience.

## When the remote vs. local backend is chosen

`chooseBackend()` picks `remote` when **both** are true:

- The user is authenticated (`authUserId` is set).
- The browser reports it's online (`navigator.onLine` / network event listeners).

Otherwise it picks `local`. That covers:

- Signed-out browsing - collected items persist in IndexedDB under an anon UUID.
- Signed-in but offline - reads/writes hit IndexedDB; writes get queued.
- The signed-in user comes back online - queued writes flush to the server with last-write-wins resolution.

## Folder layout

`src/features/dal/` contains:

```
core/
  define-action.ts            # defineDalRead / defineDalWrite - the action factories
  choose-backend.ts           # remote-vs-local selection logic
  to-query-options.ts         # adapts a DalRead to TanStack Query options
  presence-sync-handler.ts    # shared SyncHandler factory for presence-toggle entities
  types.ts                    # DalContext, DalRead, DalWrite, PendingOp, etc.
hooks/
  useDalQuery / useDalSuspenseQuery
  useDalMutation
  useBackend                  # exposes the current backend choice
  useDalContextSource         # used internally to build the DalContext
identity/
  Anon-id generation/persistence, useEffectiveUserId
local/
  IndexedDB constants, local-db.ts (prisma-idb wrapper), shared local row types
queue/
  pending-ops.ts              # PendingOp storage in IndexedDB
  sync-runner.ts              # syncOps() / forceSyncOp() - drains the queue
  last-write-wins.ts          # last-write-wins conflict resolution
  apply-pending-ops.ts        # applyPendingOpServerFn the runner calls; dispatches by entity
  usePendingOps               # observe pending ops from React
```

The sync runner uploads every queued op through the single `applyPendingOpServerFn`, which dispatches to the right `SyncHandler` by `op.entity`. There is no client-side write-action registry - server-side dispatch is the only routing layer.

## The flow at a glance

```
Component
  └─ useDalQuery / useDalMutation
       └─ DalContext { anonUserId, authUserId, backend }
            ├─ "remote"  ->  action.remote(input, ctx)   (server function)
            └─ "local"   ->  action.local(input, ctx)    (IndexedDB)
                                 └─ [writes] enqueueOp() -> PendingOp -> syncOps()
```

When a write happens locally, it:

1. Writes to IndexedDB immediately (so the UI updates).
2. Enqueues a `PendingOp` in IndexedDB.
3. `syncOps()` picks up the op when the user is online and authenticated, and calls the server-side handler via `applyPendingOpServerFn`.

## Key types

```typescript
interface DalContext {
  anonUserId: string;        // UUID from localStorage - always present
  authUserId: string | null; // set when signed in
  backend: "remote" | "local";
}
```

Use `ctx.authUserId ?? ctx.anonUserId` whenever you need a stable local user ID - that's the key your local rows should be scoped to.

## Defining actions

Actions are declared with two factory helpers from `#/features/dal/core/define-action`. Reads and writes have different shapes.

### Read action

```typescript
import { defineDalRead } from "#/features/dal/core/define-action";

const list = defineDalRead<void, MyItem[]>({
  queryKey: () => ["myEntity", "list"],
  remote: async (_input, _ctx) => myListServerFn(),
  local: async (_input, ctx) => listLocalItems(ctx.authUserId ?? ctx.anonUserId),
});
```

The `queryKey` is what TanStack Query uses for caching. The `remote` and `local` resolvers receive the input and the `DalContext`.

### Write action

```typescript
import { defineDalWrite } from "#/features/dal/core/define-action";

const upsert = defineDalWrite<MyInput, MyItem>({
  entity: "myEntity",
  operation: "upsert",
  invalidates: ["myEntity"],
  buildIdempotencyKey: (input, ctx) => `myEntity:upsert:${ctx.anonUserId}:${input.id}`,
  remote: async (input, _ctx) => myUpsertServerFn({ data: input }),
  local: async (input, ctx) =>
    upsertLocalItem({ userId: ctx.authUserId ?? ctx.anonUserId, ...input }),
  // Optional: describe (sync-UI summary) and getServerUpdatedAt (LWW baseline).
  describe: (input) => ({ title: `Saved ${input.id}` }),
});
```

Write actions carry more metadata because they need to participate in the sync queue:

- **`entity` + `operation`** - categorize the op. `entity` must match a key in the server-side sync-handler map (see below).
- **`invalidates`** - query keys to invalidate after the write succeeds. This is what makes related lists re-fetch.
- **`buildIdempotencyKey`** - used for de-duplication on the server when the same op flushes twice (network retry, etc.). Include the user id and a stable identifier from the input.
- **`describe`** _(optional)_ - a `PendingOpSummary` snapshot so the data-sync UI can show a friendly description of the queued op.
- **`getServerUpdatedAt`** _(optional)_ - reads the server record's `updatedAt` before the local write and stores it on the op as the last-write-wins baseline (resolution lives in `queue/last-write-wins.ts`). Omit it for pure creates; actions without it fall back to comparing the op's own creation time.

There is **no `sync` field**. Every queued op is uploaded by the sync runner through the same `applyPendingOpServerFn`, which dispatches by `entity` - so wiring sync is just registering the server-side handler.

## Using actions in components

```typescript
import { useDalQuery, useDalMutation } from "#/features/dal/hooks";
import { myActions } from "...";

const { data, isLoading } = useDalQuery(myActions.list, undefined);

const mutation = useDalMutation(myActions.upsert);
const onClick = () => mutation.mutate({ id: "...", value: "..." });
```

That's the entire surface area for most consumers. The DAL takes care of:

- Picking the right backend.
- Wiring the action into TanStack Query (caching, refetch, invalidation).
- Enqueuing local writes and syncing them later.
- Resolving conflicts with last-write-wins when a queued op reaches the server.

## Server-only helpers

Inside server functions you have two helpers for resolving the authenticated user:

```typescript
import { requireUserId, getOptionalUserId } from "#/features/auth/dal/require-user.server";

const userId = await requireUserId();     // throws 401 if no session
const maybeUserId = await getOptionalUserId(); // returns null if unauthenticated
```

Reach for `requireUserId()` whenever a write absolutely requires a logged-in user. Use `getOptionalUserId()` for reads that can fall back to public/anonymous data.

## Where DAL files live

DAL actions split by scope:

| Scope | Location |
|---|---|
| Cross-game (e.g. `favoriteGames`, `userProfile`) | `src/features/<feature>/dal/<entity>/` - currently all under `src/features/auth/dal/` since both belong to the authenticated-user surface |
| Game-specific (e.g. `collectedItems`) | `src/games/<gameId>/dal/` |

Within each cross-game DAL folder, files follow a consistent suffix convention:

- **`<entity>.ts`** - TanStack Start server functions (Postgres reads/writes via Prisma)
- **`<entity>.idb.ts`** - IndexedDB layer (local reads/writes via the prisma-idb client)
- **`<entity>.actions.ts`** - `defineDalRead` / `defineDalWrite` action definitions, wiring `remote` to the server functions and `local` to the IDB helpers
- **`sync-handler.ts`** - server-side sync handler invoked by `applyPendingOpServerFn`

> [!IMPORTANT]
> Game-specific DAL logic must live under `src/games/<gameId>/dal/`, **never** as a branch inside `src/features/`. The shared `createCollectedItemsDal()` factory in `#/features/game/dal/collected-items/collected-items.actions` is how per-game DAL files stay short - they pass in the model accessor and server functions and get a fully-wired DAL back.

## Adding a new persisted entity

The shortest path:

1. **Add the Prisma model** in `prisma/schema.prisma` (or `prisma/models/<gameId>.prisma` if it's game-scoped). Run `pnpm db:generate && pnpm db:push`.

2. **Write the server functions** (`<entity>.ts`) - standard TanStack Start `createServerFn` calls that read/write via the `prisma` client.

3. **Write the IDB helpers** (`<entity>.idb.ts`) - read/write via the prisma-idb client. The local row type usually mirrors the Postgres row but with extra bookkeeping (e.g. `userId` scoping).

4. **Define the actions** (`<entity>.actions.ts`) with `defineDalRead` / `defineDalWrite` - see the examples above.

5. **(Writes only)** Add the sync handler in `sync-handler.ts`. It receives the `PendingOp` and applies it to Postgres, with last-write-wins on conflicts. If the entity is a simple presence toggle (a row that either exists or not, with no mutable fields - like collected items or favorited games), reuse `createPresenceToggleSyncHandler` from `#/features/dal/core/presence-sync-handler` instead of hand-writing the delete/upsert + LWW branching.

6. **(Writes only)** Register the handler under its `entity` key so `applyPendingOpServerFn` can dispatch to it:
   - **Game-scoped** - add it to `src/features/game/registry/game-sync-handler-registry.ts`.
   - **Cross-game** - add it to the `handlers` map in `src/features/dal/queue/apply-pending-ops.ts`.

7. **Use it from components** with `useDalQuery` / `useDalMutation`.

## Common pitfalls

- **Calling `useQuery` directly instead of `useDalQuery`.** Works fine when signed in and online; silently shows an empty state otherwise. Always go through the DAL for persisted data.
- **Forgetting `buildIdempotencyKey` on writes.** Without it, a retried op can apply twice and produce duplicate rows.
- **Scoping local rows to `authUserId` only.** Anonymous users have an `anonUserId` but no `authUserId` - your row key should always be `ctx.authUserId ?? ctx.anonUserId`. Anything else makes signed-out usage silently lose data.
- **Mixing `remote` and `local` resolvers that return different shapes.** `useDalQuery` typing won't catch this if both return `unknown`-y types; you'll get a runtime shape mismatch when the user switches backends. Keep the return shape identical.
- **Putting game-keyed branches inside `src/features/dal/`.** The factory pattern exists precisely so game logic stays in `src/games/<gameId>/`. If you find yourself writing `if (gameId === ...)` inside a DAL file, refactor instead.

## Related docs

- [Architecture](ARCHITECTURE.md) - the game registry and why the feature/game split matters for the DAL.
---

> _This documentation was generated with the help of an LLM._

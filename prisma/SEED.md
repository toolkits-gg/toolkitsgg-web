# Seeding the Database

There are two seed scripts, and the difference between them matters. One is safe
to run anywhere, the other will delete every user in the database it points at.

| Script                   | What it does                                                                                    | Safe against    |
|--------------------------|-------------------------------------------------------------------------------------------------|-----------------|
| `pnpm db:seed:reference` | Upserts each game's reference data (items). No deletes.                                         | Any environment |
| `pnpm db:seed`           | Everything above, **plus** wipes all users and game data and recreates the local test accounts. | Local only      |

> [!WARNING]
> Never run `pnpm db:seed` against a shared or production database. It deletes
> every row in `User` (cascading to profiles, favorites, follows, and roles),
> wipes each game's user-generated data such as Remnant 2 builds and
> collections, and then creates the `admin` and `user` fixture accounts from
> your `.env.local`.

The reference seed is idempotent. It only upserts, so running it twice is
harmless, and re-running is how you recover from a run that failed partway.

## Before you seed

The schema has to exist first. This project does not use migrations, so the
schema is applied with `db push`:

```bash
pnpm db:push
```

Seeding a database with no tables fails with `P2021 The table ... does not exist`.

## 1. Local development (Docker)

The default setup. `.env.local` points `DATABASE_URL` at the local Postgres
container from `compose.local.yaml`.

```bash
pnpm db:local:start   # start the container if it isn't running
pnpm db:push          # apply the schema
pnpm db:seed          # fixtures + reference data
```

`pnpm db:seed` needs these in `.env.local`, all present in `.env.local.example`:

- `NODE_ENV`
- `LOCAL_ADMIN_EMAIL`, `LOCAL_ADMIN_PASSWORD`
- `LOCAL_USER_EMAIL`, `LOCAL_USER_PASSWORD`

It also imports the auth module to create the fixture accounts, so the rest of
the server environment (`BETTER_AUTH_SECRET`, `RESEND_KEY`, and so on) must be
set too. A missing variable surfaces as a `ZodError` from `src/env/server-env.ts`.

## 2. Development branch on Neon

Point `DATABASE_URL` in `.env.local` at the Neon dev branch, then run the same
commands as above. Two differences from local Docker:

- **Use the unpooled endpoint for `db push`.** Schema operations take advisory
  locks and need session affinity that a transaction-mode pooler cannot
  guarantee. Set `DATABASE_URL_UNPOOLED` in `.env.local` (the same host without
  the `-pooler` suffix) and `prisma.config.ts` picks it up automatically for
  schema work while the app keeps using the pooled URL at runtime.
- **Use the pooled endpoint for seeding.** Seeding is ordinary DML, so it runs
  fine over the pooler.

Running the full `pnpm db:seed` here is only appropriate if nobody else relies
on that branch's data, since it deletes all users.

## 3. Production on Neon

Only ever run the reference seed. Pass the production connection string inline;
an inline variable takes precedence over the one in `.env.local`, so the npm
script targets whatever you give it:

```bash
DATABASE_URL="<production pooled url>" pnpm db:seed:reference
```

Confirm the target before you commit to it. Dev and production branch hostnames
differ by only a few characters:

```bash
DATABASE_URL="<production pooled url>" pnpm exec tsx -e \
  "console.log('TARGET:', new URL(process.env.DATABASE_URL).hostname)"
```

The reference seed needs **only** `DATABASE_URL`. It does not import the auth
module, so no auth secret, Resend key, or Discord credentials are required.

Expect roughly 15 seconds, and output along these lines:

```
DB Seed: Seeding reference data for clairobscur...
DB Seed: Seeding reference data for remnant2...
DB Seed: Seeding reference data for slaythespire2...
DB Seed (reference): Finished (15889ms)
```

The script exits non-zero on failure, so it is safe to chain into a deploy step.

## Notes

**Items are upserted, never deleted.** Each game's collected-item table cascades
from its item table, so a `deleteMany` would wipe every user's collection on
every reseed.

**Upserts run in batches of 100.** A single transaction covering all of a game's
items exceeds Prisma's five second interactive-transaction timeout against a
networked database, even though it passes against a local one. See
`src/features/game/seed-utils.ts`.

**Adding a game.** Implement `seedReferenceData` on the game's `GameDBSeed`
(`src/features/game/types.ts`) and register it in
`src/game-registry/game-db-seed-registry.ts`. `resetUserData` is optional and
belongs there only if the game stores user-generated data that local fixtures
should clear.

**`prisma.config.ts` points `migrations.seed` at the destructive seed.** That
only runs via `prisma migrate reset` or `migrate dev`, neither of which this
project uses, but it is worth knowing if migrations are ever adopted.

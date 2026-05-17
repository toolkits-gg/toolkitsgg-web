# Local Setup

Welcome! This guide will get the project running on your machine, even if you've never set up a Node.js project before. You only need to do most of these things one time.

If you get stuck, ask in the [Discord](https://discord.gg/VQF23tPKyK) — we want to help. If something here is confusing, wrong, or out of date, that's our bug; please [open an issue](https://github.com/toolkits-gg/toolkitsgg-web/issues).

## 1. Prerequisites

Before you start, you'll need to install a few tools. If you already have them, skip ahead.

### Node.js — version 22 or newer

Node.js is the JavaScript runtime that powers everything in this repo. You'll use it (via `pnpm`) to install dependencies and run the dev server.

- **Recommended:** install [`nvm`](https://github.com/nvm-sh/nvm) (Node Version Manager) first. It lets you switch Node versions easily as you work on different projects. Once nvm is installed: `nvm install 22 && nvm use 22`.
- **Or:** just download the latest LTS from [nodejs.org](https://nodejs.org) — easiest if you only ever work on one Node project.

To check it worked, open a terminal and run:

```bash
node --version   # should print v22.x.x or newer
```

> [!NOTE]
> Older versions of Node may work, but we don't test against them — if something breaks on Node 20 or below, upgrading is usually the fix.

### pnpm — version 11 or newer

pnpm is a package manager (similar to npm and yarn) that we use to install dependencies. You need pnpm specifically — running `npm install` or `yarn install` won't work here, because the lockfile is in pnpm's format.

The easiest way to install pnpm is via NPM:

```bash
npm install -g pnpm@latest-11
```

If that doesn't work for any reason, follow the standalone installer at [pnpm.io/installation](https://pnpm.io/installation).

Check it worked:

```bash
pnpm --version   # should print 11.x.x or newer
```

### Docker (with Docker Compose v2)

Docker lets us run a Postgres database in a self-contained sandbox, so you don't have to install or configure Postgres yourself. You only use it for the database — nothing else.

- **macOS / Windows:** install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and start it.
- **Linux:** install Docker Engine and the Compose v2 plugin via your distro's package manager — see [docs.docker.com/engine/install](https://docs.docker.com/engine/install/).

Check it worked:

```bash
docker --version
docker compose version    # note: a space, not a hyphen
```

> [!NOTE]
> Don't want to install Docker? You can point `DATABASE_URL` at any Postgres 16+ database you already have access to (Supabase, Neon, a remote Postgres, etc). The `pnpm db:local:*` scripts won't be useful, but everything else will work.

### Biome (editor integration, optional but nice)

Biome is the project's linter and formatter. It runs via `pnpm` so you don't need to install it separately, but if you install the editor extension you'll get instant feedback (and auto-format on save) while you code:

- **VS Code:** [Biome extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome). The repo's `.vscode/settings.json` already configures it as the default formatter.
- **JetBrains:** built-in since IntelliJ/WebStorm 2024.1 — enable it under *Settings → Languages & Frameworks → Biome*.
- **Other editors:** see [biomejs.dev/guides/editors](https://biomejs.dev/guides/editors/first-party-extensions/).

### Git

If you don't already have it, install Git from [git-scm.com](https://git-scm.com). You'll use it to clone the project and (later) to submit changes.

## 2. Clone the repo

```bash
git clone https://github.com/toolkits-gg/toolkitsgg-web.git
cd toolkitsgg-web
```

## 3. Install dependencies

From inside the project folder, run:

```bash
pnpm install
```

This downloads all the libraries the project needs. It can take a minute or two the first time.

## 4. Configure environment variables

Copy the example file to create your own local config:

```bash
cp .env.local.example .env.local
```

Then open `.env.local` in your editor and fill in the values below.

**Required to run the app:**

| Variable | What it's for | What to put there |
|---|---|---|
| `DATABASE_URL` | Connection string to your local Postgres | Leave the default — it matches the Docker setup we'll start in step 5 |
| `BETTER_AUTH_SECRET` | Used to sign auth sessions and cookies | Generate one: `openssl rand -base64 32` and paste the result |
| `BETTER_AUTH_URL` | Where the app lives | `http://localhost:3000` for local dev |
| `VITE_APP_URL` | Same — public URL of the app | `http://localhost:3000` for local dev |
| `VITE_APP_NAME` | Shown in page titles | `"Toolkits.gg"` |

**Optional — leave blank if you don't need them:**

| Variable | What it's for                                                                                                                                                                                                                                                   |
|---|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | Lets you sign in with Discord locally. Get these from the [Discord developer portal](https://discord.com/developers/applications), and set the redirect URI to `http://localhost:3000/api/auth/callback/discord`. Skip if you don't need Discord login locally. |
| `RESEND_KEY` | Used to send verification + password-reset emails. Get a free key at [resend.com](https://resend.com). Without it, signup still works — you just won't receive the verification email.                                                                          |
| `VITE_CLOUDFRONT_URL` | Image CDN for almost all project images. (# TODO: Make assets available for self-hosted CDN).                                                                                                                                                                   |

> [!IMPORTANT]
> All env vars are validated by zod (a TypeScript validation library) in `src/config/env.ts`. If you start the app with a missing or malformed value, you'll see a clear error message at startup — read it; it usually tells you exactly what's wrong.
>
> In code, server-side files import `serverEnv` from `#/config/env`. Client-side files read `import.meta.env.VITE_*`. You don't need to know this to get set up, but it's good to know once you start contributing.

## 5. Start Postgres

Postgres is the database where users, profiles, collected items, and everything else gets stored. The next command starts a Postgres database inside a Docker container — nothing gets installed on your computer:

```bash
pnpm db:local:start
```

It boots a Postgres 16 container on port `5432` using the credentials in the default `DATABASE_URL`. Your data persists across restarts.

Other helpful commands:

```bash
pnpm db:local:stop      # stop the database (data is preserved)
pnpm db:local:restart   # stop then start it again
pnpm db:local:down      # ⚠️ wipes the database entirely — only use if you want a fresh start
```

> [!NOTE]
> If port 5432 is already in use (for example, you have another Postgres installed), edit `compose.local.yaml` to use a different host port, then update `DATABASE_URL` in `.env.local` to match.

## 6. Set up the database schema

```bash
pnpm db:generate
pnpm db:push
```

A quick explanation of what just happened:

- **Prisma** is the library this project uses to talk to the database. It reads a schema file (`prisma/schema.prisma`) and generates type-safe TypeScript code that you call from the app.
- **`pnpm db:generate`** generates that TypeScript code. It actually builds two clients: one for the server (talks to Postgres) and one for the browser (talks to IndexedDB, used when the user is offline). Both come from the same schema.
- **`pnpm db:push`** takes the schema and applies it to your local Postgres database, creating the necessary tables.

You only need to re-run these when something in `prisma/` changes.

## 7. Seed sample data (optional but recommended)

```bash
pnpm db:seed
```

This fills your local database with sample items, users, and per-game data so the app has something to display when you open it.

## 8. Start the dev server

```bash
pnpm dev
```

Open <http://localhost:3000> in your browser — you should see the app. 🎉

The dev server auto-reloads the page when you save a file, so you can leave it running while you work. Two situations where you'll need to restart it manually:

- **You edited a `.prisma` file** — re-run `pnpm db:generate && pnpm db:push`, then restart `pnpm dev`.
- **Routes look stale** — TanStack Router usually regenerates `routeTree.gen.ts` automatically, but if a route doesn't appear or behave correctly, restart the dev server.

## 9. Daily commands

These are the commands you'll use most often while working on the project:

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server with auto-reload on :3000 |
| `pnpm build` | Production build |
| `pnpm preview` | Serve the production build locally |
| `pnpm test` | Run the test suite once |
| `pnpm vitest` | Run the test suite in watch mode |
| `pnpm check` | Check formatting and lint (run before pushing) |
| `pnpm format` | Auto-fix formatting issues |
| `pnpm lint` | Check for lint errors only |
| `pnpm type` | TypeScript type check |
| `pnpm db:studio` | Open Prisma Studio (a browser-based DB viewer) |
| `pnpm db:seed` | Re-run the seed script |

To run a single test file or a single test by name:

```bash
pnpm vitest run path/to/file.test.ts
pnpm vitest run -t "test name"
```

## 10. Image & favicon pipelines

You only need these if you're adding or changing source images for a game — most contributors will never run them.

```bash
pnpm favicons:generate    # regenerate favicons from per-game source files
pnpm images:generate      # regenerate resized item images
```

Both are Gulp tasks defined in `gulpfile.js`. See the [Architecture guide](ARCHITECTURE.md#6-generate-favicons-and-item-images) for what they do.

## Notes for when you start contributing

Once you're up and running, a couple of things to keep in mind:

- **Adding dependencies?** The project's `.npmrc` pins exact versions (no `^` or `~`), and blocks brand-new packages (less than 3 days old) as a precaution against supply-chain issues. If you need a brand-new package urgently, mention it in your PR.
- **Where to go next:** read the [Architecture guide](ARCHITECTURE.md) to understand how the codebase is laid out, then [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow.

## Troubleshooting

**`pnpm install` fails with errors about `sharp` or other native binaries**
Make sure you're on Node 22+ and pnpm 11+. On Linux, you may also need `python3` and `build-essential` installed.

**`pnpm db:generate` complains about a missing schema**
Make sure your working directory is the project root (where `package.json` lives) — Prisma looks for the schema relative to that folder.

**`pnpm db:push` errors with "database doesn't exist" or "connection refused"**
Check that Postgres is running (`pnpm db:local:start`) and that `DATABASE_URL` in `.env.local` matches the credentials in `compose.local.yaml`.

**The app loads but signing in / signing up doesn't stick**
Usually one of two things: `BETTER_AUTH_SECRET` is missing, or `BETTER_AUTH_URL` doesn't match `VITE_APP_URL`. Both URLs must point at the same origin.

**The theme flickers on first paint, or sticks on the wrong color**
Clear `localStorage` (in your browser DevTools → Application → Storage). The theme name is cached there, and a stale value from an earlier session can confuse the loader.

**TypeScript can't find `#/...` or `@/prisma`**
Path aliases are declared in two places: `package.json` `imports` and `tsconfig.json` `paths`. If you changed one, change the other to match. Then restart the TypeScript server in your editor.

**`routeTree.gen.ts` looks broken or has merge conflicts**
This file is auto-generated — don't edit it by hand. Delete it, then run `pnpm dev` and it will be regenerated.

---

Next: read the [Architecture guide](ARCHITECTURE.md) to understand how the codebase is laid out, especially if you're adding a new game.

---

> _This documentation was generated with the help of AI, and reviewed and refined by a human._

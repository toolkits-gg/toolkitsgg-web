# Local Setup

This file aims to walk through the steps of getting this project running locally. If you have any trouble, please open an issue or join the Discord for help.

## Understanding the guide

This guide assumes you are using a terminal to run commands.

- If you are using VSCode, you can use the built-in terminal. Press `Ctrl + Backtick` to open the terminal.
- If you are using Windows, you can use the built-in Command Prompt, PowerShell, or Terminal.
- If you are using macOS or Linux, you can use the built-in Terminal app.

When you see a command like this, this is instructing you to run the command in your terminal:

```bash
pnpm run dev
```

## Requirements

### Installing Software

- [Git](https://git-scm.com/downloads) - Allows you to run `git` commands in your terminal.
- [NVM for Windows](https://github.com/coreybutler/nvm-windows/releases) - Allows you to install and swap between different versions of Node.js. If you are not on Windows, use [NVM](https://github.com/nvm-sh/nvm).
- [VSCode](https://code.visualstudio.com/download) is what I use, but you can use whatever code editor you want.

#### NVM for Windows

Once you have installed NVM, activate NodeJS v22.15.0 (or any other version) by running the following command in your terminal:

```bash
nvm install 22.15.0
nvm use 22.15.0
```

#### Install PNPM

This project uses PNPM as the package manager. You can install it by running the following command in your terminal:

```bash
npm install -g pnpm
```

## First-time Setup

### Clone the repository

In your terminal, run the following commands to clone the repository and navigate to the project directory.

```bash
git clone https://github.com/toolkits-gg/toolkitsgg-web.git
cd toolkitsgg-web
```

### Install the dependencies

Run the following command to install the dependencies for the project:

```bash
pnpm install
```

### Set up the `.env` file

```bash
cp .env.example .env
```

### Create a free NeonDB database

1. Go to [NeonDB](https://neon.tech/) and create a free account.
2. Create a new project and database.
3. Copy the connection strings from the dashboard to your `.env` file.
   a. The DATABASE_URL should be the connection string with the connection pooling toggle disabled.
   b. The DIRECT_URL should be the connection string with the connection pooling toggle enabled.

### Create a free Resend account (optional, for email)

1. Go to [Resend](https://resend.com/) and create a free account.
2. Create a new API key and copy it to your `.env` file as `RESEND_KEY`.

## Managing the local environment

### Start the development server

Run the following command in your terminal to start the development server:

```bash
pnpm run dev
```

### Build the project

To build the project for production, run the following command:

```bash
pnpm run build
```

### Run the production build

To run the production build, first build the project and then run the following command:

```bash
pnpm run start
```

Open your web browser and navigate to `http://localhost:3000`. You should see the project running.

### Lint the project

Linting is important to ensure code quality. To lint the project, run:

```bash
pnpm run lint
```

If you want to lint and fix any issues automatically, you can run:

```bash
pnpm run lint-fix
```

### Type-check the project

To ensure the build will complete, run the TypeScript type checker:

```bash
pnpm run type-check
```

### Run tests

**TODO**: surely....

### Interacting with the database (Prisma Studio)

Prisma Studio is a locally hosted application that allows you to view and interact with your database.

In a separate terminal window, run the following command to start Prisma Studio:

```bash
pnpm prisma-studio
```

This will open Prisma Studio in your web browser at `http://localhost:5555`, where you can view and manage your database.

### Changes to the database schema

If you make changes to the database schema, you will need to run the following commands to update your database:

```bash
pnpm prisma-push
```

Once complete, the updated Typescript types will be generated automatically. In the event you are still getting Typescript errors, you can restart the Typescript server in VSCode by opening the Command Palette (`Ctrl + Shift + P` or `Cmd + Shift + P` on macOS) and typing `TypeScript: Restart TS Server`.

### Seed the database

To make it easier to develop, you can seed the database with some initial data. Run the following command:

```bash
pnpm db-seed
```

This will populate your database via the [seed script](../src/lib/prisma/seed.ts)

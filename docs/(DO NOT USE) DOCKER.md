# (NOT WORKING PRESENTLY) Docker Development Quick Start

# IMPORTANT

This currently does not work with the project, due to issues with the NeonDB adapter and NextJS middleware and Nodejs.

TODO: Try to get this working locally again.

## Introduction

You can use Docker to quickly spin up a local Postgresql database to use with your locally running
project. Follow the instructions below to get started.

## Pre-Requisites

1. Install Docker ([https://www.docker.com/get-started](https://www.docker.com/get-started))
2. Install docker-compose ([https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/))

## Setup

### Update the .env file

If you have not already, create a `.env` file in the root of the project folder, using the `.env.example` file as a template.

```bash
cp .env.example .env
```

Ensure the `DATABASE_URL` and `DIRECT_URL` match the default value in `.env.example`.

### Seed the database

#### Start the Docker container

```bash
pnpm db-start
```

#### Run the seed script

```bash
pnpm db-seed
```

## View the database dashboard

Run the following in your terminal, which should launch `http://localhost:5555` in your web browser:

```bash
pnpm prisma-studio
```

## Managing Docker Containers

Run the following commands from the project directory:

- `docker-compose up` to start the docker containers and build the dist files
- `docker-compose up -d` to start the containers and build the dist files in detached mode
- `docker-compose stop` to stop detached mode
- `docker-compose down` to stop the container and purge its containers and networks
- `ctrl+c` to stop

## Tips and Troubleshooting

TODO

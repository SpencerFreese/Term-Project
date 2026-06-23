## Term Project Setup

This app uses Next.js App Router plus a local MySQL container for movie data.

## Prerequisites

- Docker Desktop
- pnpm

## Start MySQL

```bash
docker compose up -d
```

The included `compose.yml` starts MySQL on port `3306` with:

- user: `root`
- password: `term_project_root`
- database: `term_project`

## Load Schema And Seed Data

Run the schema file first:

```zsh
docker compose exec -T mysql mysql -uroot -pterm_project_root < db/database_setup.sql
```

Then seed the movie data:

```zsh
docker compose exec -T mysql mysql -uroot -pterm_project_root term_project < db/seed_movies.sql
```

## Start The App

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

The app reads these values from `.env.local`:

```bash
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=term_project_root
MYSQL_DATABASE=term_project
```

## Project Structure

- `compose.yml`: local MySQL container
- `db/database_setup.sql`: schema creation
- `db/seed_movies.sql`: movie seed data
- `lib/db.ts`: server-only MySQL pool
- `lib/movies.ts`: movie queries used by the homepage
- `app/page.tsx`: renders currently playing and coming soon movies

## Term Project Setup

This app uses Next.js App Router plus a local MySQL container for movie data.

## Prerequisites

- Docker Desktop
- pnpm

## Start MySQL

```bash
docker compose up -d
```

The included `compose.yml` starts MySQL on port `3307` with:

- user: `root`
- password: `term_project_root`
- database: `term_project`

## Load Schema And Seed Data

Run the schema file first:
```bash
docker compose exec -T mysql mysql -uroot -pterm_project_root < db/database_setup.sql
```

Then seed the movie data:

```bash
docker compose exec -T mysql mysql -uroot -pterm_project_root term_project < db/seed_movies.sql
```

### Option 2: Windows PowerShell

Run the schema file first:

```powershell
Get-Content db/database_setup.sql | docker compose exec -T mysql mysql -uroot -pterm_project_root
```

Then seed the movie data:

```powershell
Get-Content db/seed_movies.sql | docker compose exec -T mysql mysql -uroot -pterm_project_root term_project
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
MYSQL_PORT=3307
MYSQL_USER=root
MYSQL_PASSWORD=term_project_root
MYSQL_DATABASE=term_project
```
## Project Structure

```txt
app/                         Next.js App Router pages and API routes
app/page.tsx                 Homepage that renders movie data
app/api/                     Backend API routes
app/movies/[movieId]/        Movie details page route
app/booking/[showtimeId]/    Booking prototype route
db/                          Database SQL files
db/database_setup.sql        Database schema creation
db/seed_movies.sql           Movie, genre, theater room, seat, and showtime seed data
lib/db.ts                    Server-only MySQL connection pool
lib/repositories/            Database query layer
lib/services/                Business logic layer
lib/movies.ts                Compatibility wrapper for movie service functions
compose.yml                  Local MySQL Docker container setup
public/                      Static assets
```

## Backend Structure

The backend is organized into layers:

```txt
API Route -> Service -> Repository -> Database
```

- API routes handle HTTP requests and responses
- Services contain business logic
- Repositories contain SQL queries
- `lib/db.ts` manages the MySQL connection pool

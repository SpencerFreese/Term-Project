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

### Option 2: Windows PowerShell Fresh DB

Run the schema file first:

```powershell
Get-Content db/database_setup.sql | docker compose exec -T mysql mysql -uroot -pterm_project_root
```

Then seed the movie data:
```powershell
Get-Content db/seed_movies.sql | docker compose exec -T mysql mysql -uroot -pterm_project_root term_project
```

Seed theater seats
```powershell
Get-Content -Raw db/seed_seats.sql | docker exec -i term-project-mysql mysql -uroot -pterm_project_root term_project
```

Seed test customer/admin accounts
```powershell
Get-Content -Raw db/seed_users.sql | docker exec -i term-project-mysql mysql -uroot -pterm_project_root term_project
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

AUTH_SECRET=replace_with_a_long_random_secret
APP_URL=http://localhost:3000
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=
```

## Poster Setup

If seeded poster images are broken or missing, you can refresh them from TMDB with `scripts/fetch_posters.py`.

Install the Python dependencies:

```bash
python -m pip install requests mysql-connector-python
```

Get an API key from https://www.themoviedb.org/settings/api

Create a `tmdb.env` file in the project root:


```bash
TMDB_API_KEY=your_tmdb_api_key_here
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3307
MYSQL_USER=root
MYSQL_PASSWORD=term_project_root
MYSQL_DATABASE=term_project
```

Then run:

```bash
python scripts/fetch_posters.py
```

The script updates movie rows whose `poster_url` is empty or still points to the old Wikipedia URLs.

## Project Structure

```txt
app/                                   Next.js App Router pages and API routes
app/page.tsx                           Movie homepage
app/login/page.tsx                     Login page
app/register/page.tsx                  Customer registration page
app/profile/page.tsx                   Customer profile page
app/admin/page.tsx                     Administrator dashboard
app/api/auth/login/route.ts            Login API
app/api/auth/logout/route.ts           Logout API
app/api/auth/register/route.ts         Registration API
app/api/auth/verify-email/route.ts     Email-verification API
app/movies/[movieId]/                  Movie-details route
app/booking/[showtimeId]/              Booking route
db/database_setup.sql                  Database schema
db/seed_movies.sql                     Movie, genre, room, and showtime data
db/seed_seats.sql                     Theater-seat data
db/seed_users.sql                     Development customer and admin users
lib/db.ts                             MySQL connection and query helpers
lib/auth.ts                           Session-token functions
lib/email.ts                          Email-delivery functions
lib/repositories/                     Database query layer
lib/services/                         Business-logic layer middleware.ts Route protection and role checking compose.yml Local MySQL Docker configuration
public/                               Static assets
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
- 'lib/auth.ts' creates and verifies login sessions
- 'lib/email.ts' handles verification-email delivery

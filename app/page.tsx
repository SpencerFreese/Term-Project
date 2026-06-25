import Link from "next/link";

import {
  getAllGenres,
  getComingSoonMovies,
  getCurrentlyPlayingMovies,
  getMovieSearchResults,
  type Genre,
  type Movie,
} from "@/lib/movies";

export const dynamic = "force-dynamic";

type HomeDataResult =
  | {
      ok: true;
      currentlyPlaying: Movie[];
      comingSoon: Movie[];
      filteredResults: Movie[] | null;
      genres: Genre[];
    }
  | {
      ok: false;
      message: string;
    };

function formatReleaseDate(value: string | null) {
  if (!value) {
    return "Release date TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function MovieSection({
  title,
  movies,
}: {
  title: string;
  movies: Movie[];
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          {title}
        </h2>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {movies.length} movie{movies.length === 1 ? "" : "s"}
        </p>
      </div>

      {movies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          No movies found.
        </div>
      ) : (
        <div className="grid gap-4">
          {movies.map((movie) => (
            <article
              key={movie.movieId}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
                    {movie.title}
                  </h3>

                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {movie.genres ?? "No genres listed"}
                  </p>

                  <p className="max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {movie.description ?? "Description coming soon."}
                  </p>

                  <Link
                    href={`/movies/${movie.movieId}`}
                    className="inline-flex rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950"
                  >
                    View Details
                  </Link>
                </div>

                <dl className="grid min-w-44 gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <div>
                    <dt className="font-medium text-zinc-950 dark:text-zinc-100">
                      Release
                    </dt>
                    <dd>{formatReleaseDate(movie.releaseDate)}</dd>
                  </div>

                  <div>
                    <dt className="font-medium text-zinc-950 dark:text-zinc-100">
                      Rating
                    </dt>
                    <dd>{movie.mpaaRating ?? "Unrated"}</dd>
                  </div>

                  <div>
                    <dt className="font-medium text-zinc-950 dark:text-zinc-100">
                      Runtime
                    </dt>
                    <dd>
                      {movie.runtimeMinutes
                        ? `${movie.runtimeMinutes} min`
                        : "TBD"}
                    </dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

async function loadHomeData(
  searchTerm: string,
  genre: string,
): Promise<HomeDataResult> {
  try {
    const [currentlyPlaying, comingSoon, filteredResults, genres] =
      await Promise.all([
        getCurrentlyPlayingMovies(),
        getComingSoonMovies(),
        searchTerm || genre
          ? getMovieSearchResults(searchTerm || undefined, genre || undefined)
          : Promise.resolve(null),
        getAllGenres(),
      ]);

    return {
      ok: true,
      currentlyPlaying,
      comingSoon,
      filteredResults,
      genres,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; genre?: string; showDate?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const searchTerm = resolvedSearchParams.search?.trim() ?? "";
  const genre = resolvedSearchParams.genre?.trim() ?? "";
  const showDate = resolvedSearchParams.showDate?.trim() ?? "";

  const result = await loadHomeData(searchTerm, genre);

  if (!result.ok) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12 sm:px-10">
        <section className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
            Term Project Cinema
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            MySQL connection not ready yet.
          </h1>

          <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Start the Docker database and load the schema and seed files, then
            refresh this page.
          </p>
        </section>

        <pre className="overflow-x-auto rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
          {result.message}
        </pre>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-12 sm:px-10">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
          Term Project Cinema
        </p>

        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl">
          Movies loaded from MySQL in a Next.js server component.
        </h1>

        <p className="max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
          The homepage queries the Docker-backed MySQL database directly and
          renders seeded movie categories.
        </p>
      </section>

      <form
        action="/"
        className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-end"
      >
        <input
          type="search"
          name="search"
          defaultValue={searchTerm}
          placeholder="Search movies by title..."
          className="min-h-11 flex-1 rounded-lg border border-zinc-300 bg-white px-4 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-300"
        />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="genre"
            className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
          >
            Genre
          </label>
          <select
            id="genre"
            name="genre"
            defaultValue={genre}
            className="min-h-11 rounded-lg border border-zinc-300 bg-white px-4 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-300"
          >
            <option value="">All Genres</option>
            {result.genres.map((genreOption) => (
              <option key={genreOption.genreId} value={genreOption.name}>
                {genreOption.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="showDate"
            className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
          >
            Show Date
          </label>
          <input
            type="date"
            id="showDate"
            name="showDate"
            defaultValue={showDate}
            className="min-h-11 rounded-lg border border-zinc-300 bg-white px-4 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-300"
          />
        </div>

        <button
          type="submit"
          className="min-h-11 rounded-lg bg-zinc-950 px-5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950"
        >
          Apply Filters
        </button>

        {searchTerm || genre || showDate ? (
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-300 px-5 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
          >
            Clear
          </Link>
        ) : null}
      </form>

      {searchTerm || genre ? (
        <MovieSection
          title={
            searchTerm
              ? `Search Results for "${searchTerm}"`
              : `Genre: ${genre}`
          }
          movies={result.filteredResults ?? []}
        />
      ) : (
        <>
          <MovieSection
            title="Currently Playing"
            movies={result.currentlyPlaying}
          />

          <MovieSection title="Coming Soon" movies={result.comingSoon} />
        </>
      )}
    </main>
  );
}

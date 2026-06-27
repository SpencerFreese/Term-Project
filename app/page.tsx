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

function normalizeGenres(value?: string | string[]) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
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
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {movies.map((movie) => (
            <article
              key={movie.movieId}
              className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-sky-500 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
            >
              <Link
                href={`/movies/${movie.movieId}`}
                className="block"
                aria-label={`View details for ${movie.title}`}
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={`${movie.title} poster`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-950 via-zinc-900 to-black p-6">
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-sky-400/40 bg-black/40 text-4xl font-black text-sky-300">
                        {movie.title.slice(0, 1)}
                      </div>
                    </div>
                  )}

                  <div className="absolute left-3 top-3 rounded-full bg-sky-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
                    {movie.mpaaRating ?? "Unrated"}
                  </div>
                </div>
              </Link>

              <div className="flex min-h-72 flex-col justify-between gap-5 p-5">
                <div className="space-y-3">
                  <div>
                    <h3 className="line-clamp-2 text-lg font-bold leading-tight text-zinc-950 dark:text-zinc-50">
                      {movie.title}
                    </h3>

                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {movie.runtimeMinutes
                        ? `${movie.runtimeMinutes} min`
                        : "Runtime TBD"}
                    </p>
                  </div>

                  <p className="line-clamp-2 text-xs font-medium text-sky-600 dark:text-sky-400">
                    {movie.genres ?? "No genres listed"}
                  </p>

                  <p className="line-clamp-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {movie.description ?? "Description coming soon."}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Release: {formatReleaseDate(movie.releaseDate)}
                  </p>

                  <Link
                    href={`/movies/${movie.movieId}`}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500"
                  >
                    View Details
                  </Link>
                </div>
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
  selectedGenres: string[],
  showDate: string,
): Promise<HomeDataResult> {
  try {
    const filters = {
      searchTerm: searchTerm || undefined,
      genres: selectedGenres,
      showDate: showDate || undefined,
    };

    const [currentlyPlaying, comingSoon, genres] = await Promise.all([
      getCurrentlyPlayingMovies(filters),
      getComingSoonMovies(filters),
      getAllGenres(),
    ]);

    return {
      ok: true,
      currentlyPlaying,
      comingSoon,
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
  searchParams: Promise<{
    search?: string;
    genre?: string | string[];
    showDate?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const searchTerm = resolvedSearchParams.search?.trim() ?? "";
  const selectedGenres = normalizeGenres(resolvedSearchParams.genre);
  const showDate = resolvedSearchParams.showDate?.trim() ?? "";

  const result = await loadHomeData(searchTerm, selectedGenres, showDate);

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
        <p className="inline-flex rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-sky-300">
          Term Project Cinema-E-Booking
        </p>

        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl">
          Watch a movie Today
        </h1>

        <p className="max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
          Browse currently playing and coming soon movies, search by title,
          filter by genre, and view details before booking your seats.
        </p>
      </section>

     <form
  key={`${searchTerm}-${selectedGenres.join("-")}-${showDate}`}
  action="/"
  className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
>
  <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
    <input
      type="search"
      name="search"
      defaultValue={searchTerm}
      placeholder="Search movies by title..."
      className="min-h-11 rounded-lg border border-zinc-300 bg-white px-4 text-sm text-zinc-950 outline-none focus:border-sky-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-sky-500"
    />

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
        className="min-h-11 cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 text-sm text-zinc-950 outline-none focus:border-sky-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-sky-500 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:[filter:brightness(0)_saturate(100%)_invert(55%)_sepia(93%)_saturate(1432%)_hue-rotate(165deg)_brightness(96%)_contrast(94%)]"
      />
    </div>

    <button
      type="submit"
      className="min-h-11 rounded-lg bg-sky-600 px-5 text-sm font-medium text-white transition hover:bg-sky-500"
    >
      Apply Filters
    </button>

    {searchTerm || selectedGenres.length > 0 || showDate ? (
      <Link
        href="/"
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:border-sky-500 dark:border-zinc-700 dark:text-zinc-300"
      >
        Clear All
      </Link>
    ) : null}
  </div>

  <details className="rounded-2xl border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black/50">
    <summary className="cursor-pointer text-sm font-semibold text-zinc-950 dark:text-zinc-100">
      Filter by genre
      {selectedGenres.length > 0
        ? `: ${selectedGenres.join(", ")}`
        : ""}
    </summary>

    <div className="mt-4 flex flex-wrap gap-3">
      {result.genres.map((genre) => (
        <label
          key={genre.genreId}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 transition hover:border-sky-500 hover:text-sky-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white"
        >
          <input
            type="checkbox"
            name="genre"
            value={genre.name}
            defaultChecked={selectedGenres.includes(genre.name)}
            className="h-4 w-4 accent-sky-500"
          />

          {genre.name}
        </label>
      ))}
    </div>

    <p className="mt-3 text-xs text-zinc-500">
      Selecting multiple genres only shows movies that match all selected genres.
    </p>
  </details>
</form>

<MovieSection
  title={
    searchTerm || selectedGenres.length > 0 || showDate
      ? "Currently Playing — Filtered Results"
      : "Currently Playing"
  }
  movies={result.currentlyPlaying}
/>

<MovieSection
  title={
    searchTerm || selectedGenres.length > 0 || showDate
      ? "Coming Soon — Filtered Results"
      : "Coming Soon"
  }
  movies={result.comingSoon}
/>
    </main>
  );
}

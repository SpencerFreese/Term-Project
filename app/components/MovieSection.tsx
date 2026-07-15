import Link from "next/link";
import { type Movie } from "@/lib/movies";
import { type ShowtimeRow } from "@/lib/repositories/showtimeRepository";
import FavoriteButton from "./FavoriteButton";

type MovieWithShowtimes = Movie & { showtimes: ShowtimeRow[] };

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

function formatShowtime(value: string | null) {
  if (!value) return "Time TBD";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function MovieSection({
  title,
  movies,
  favoritedMovieIds = [],
  isAuthenticated = false,
}: {
  title: string;
  movies: MovieWithShowtimes[];
  favoritedMovieIds?: number[];
  isAuthenticated?: boolean;
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
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-sky-500 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
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

              <FavoriteButton
                movieId={movie.movieId}
                initialFavorited={favoritedMovieIds.includes(movie.movieId)}
                isAuthenticated={isAuthenticated}
                className="absolute right-3 top-3"
              />

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

                  {movie.showtimes.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Showtimes
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {movie.showtimes.slice(0, 3).map((showtime) => (
                          <Link
                            key={showtime.showtimeId}
                            href={`/booking/${showtime.showtimeId}`}
                            className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:border-sky-500 hover:bg-sky-50 hover:text-sky-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-sky-500 dark:hover:bg-sky-950/30 dark:hover:text-sky-400"
                          >
                            {formatShowtime(showtime.startTime)}
                          </Link>
                        ))}
                        {movie.showtimes.length > 3 && (
                          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                            +{movie.showtimes.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

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
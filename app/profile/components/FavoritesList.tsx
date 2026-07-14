"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type FavoriteMovie = {
  movieId: number;
  title: string;
  posterUrl: string | null;
  mpaaRating: string | null;
  runtimeMinutes: number | null;
};

export default function FavoritesList({
  favorites,
}: {
  favorites: FavoriteMovie[];
}) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function handleRemove(movieId: number) {
    setError("");
    setRemovingId(movieId);

    try {
      const response = await fetch(`/api/profile/favorites/${movieId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not remove favorite.");
        return;
      }

      router.refresh();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-300 p-6 dark:border-zinc-800">
      <h2 className="mb-1 text-2xl font-semibold">Favorite Movies</h2>

      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Add movies to your favorites list by tapping the heart icon while
        browsing.
      </p>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {favorites.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          You have not favorited any movies yet.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((movie) => (
            <li
              key={movie.movieId}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <Link
                href={`/movies/${movie.movieId}`}
                className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900"
              >
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={`${movie.title} poster`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-sky-400">
                    {movie.title.slice(0, 1)}
                  </div>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/movies/${movie.movieId}`}
                  className="block truncate text-sm font-semibold hover:text-sky-600"
                >
                  {movie.title}
                </Link>

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {movie.mpaaRating ?? "Unrated"}
                  {movie.runtimeMinutes ? ` · ${movie.runtimeMinutes} min` : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(movie.movieId)}
                disabled={removingId === movie.movieId}
                title="Remove from favorites"
                aria-label={`Remove ${movie.title} from favorites`}
                className="shrink-0 rounded-lg border border-red-300 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:hover:bg-red-950/30"
              >
                {removingId === movie.movieId ? "..." : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

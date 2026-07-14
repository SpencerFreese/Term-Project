import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovieDetails } from "@/lib/movies";
import { findFavoriteMovieIdsByUserId } from "@/lib/repositories/favoriteRepository";
import { getSession } from "@/lib/auth";
import MovieOverview from "./components/MovieOverview";
import MovieTrailer from "./components/MovieTrailer";
import Showtimes from "./components/Showtimes";

export const dynamic = "force-dynamic";

export default async function MovieDetailsPage({
  params,
}: {
  params: Promise<{ movieId: string }>;
}) {
  const { movieId } = await params;
  const movie = await getMovieDetails(Number(movieId));

  if (!movie) {
    notFound();
  }

  const genres = (movie.genres ?? "")
  .split(",")
  .map((genre) => genre.trim())
  .filter(Boolean);

  const session = await getSession();
  const favoritedMovieIds = session
    ? await findFavoriteMovieIdsByUserId(session.userId)
    : [];
  const isFavorited = favoritedMovieIds.includes(movie.movieId);

return (
  <main className="min-h-screen bg-black text-zinc-50">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-10">
      <Link
        href="/"
        className="inline-flex w-fit items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-sky-500 hover:text-white"
      >
        ← Back to Movies
      </Link>

      <MovieOverview
        movie={movie}
        genres={genres}
        isFavorited={isFavorited}
        isAuthenticated={Boolean(session)}
      />

      <MovieTrailer movie={movie} />

      <Showtimes movie={movie}/>

    </div>
  </main>
);
}
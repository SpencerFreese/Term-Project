import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovieDetails } from "@/lib/movies";

export const dynamic = "force-dynamic";

function formatDateTime(value: string | null) {
  if (!value) {
    return "Time TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

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

  console.log(movie.trailerUrl)

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <Link href="/" className="text-sm text-blue-600 underline">
        ← Back to movies
      </Link>

      <section className="grid gap-8 md:grid-cols-[220px_1fr]">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            className="w-full rounded-2xl border object-cover"
          />
        ) : (
          <div className="flex h-80 items-center justify-center rounded-2xl border">
            No poster
          </div>
        )}

        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{movie.title}</h1>

          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {movie.mpaaRating ?? "Unrated"} •{" "}
            {movie.runtimeMinutes ? `${movie.runtimeMinutes} min` : "Runtime TBD"} •{" "}
            {movie.genres ?? "Genres TBD"}
          </p>

          <p className="leading-7 text-zinc-700 dark:text-zinc-300">
            {movie.description ?? "Description coming soon."}
          </p>

          <div>
            <h2 className="font-semibold">Cast</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {movie.castList ?? "Cast coming soon."}
            </p>
          </div>
        </div>
      </section>

      {movie.trailerUrl ? (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Trailer</h2>
          <iframe
            src={movie.trailerUrl}
            title={`${movie.title} trailer`}
            className="aspect-video w-full rounded-2xl border"
            allowFullScreen
          />
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Showtimes</h2>

        {movie.showtimes.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            No showtimes have been added yet.
          </p>
        ) : (
          <div className="grid gap-3">
            {movie.showtimes.map((showtime) => (
              <Link
                key={showtime.showtimeId}
                href={`/booking/${showtime.showtimeId}`}
                className="rounded-xl border p-4 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <p className="font-medium">{formatDateTime(showtime.startTime)}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {showtime.roomName} • {showtime.formatType ?? "Standard"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
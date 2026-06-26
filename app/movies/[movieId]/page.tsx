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

  const genres = (movie.genres ?? "")
  .split(",")
  .map((genre) => genre.trim())
  .filter(Boolean);



return (
  <main className="min-h-screen bg-black text-zinc-50">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-10">
      <Link
        href="/"
        className="inline-flex w-fit items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-sky-500 hover:text-white"
      >
        ← Back to Movies
      </Link>

      <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40">
        <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={`${movie.title} poster`}
                className="aspect-[2/3] w-full rounded-2xl object-cover shadow-2xl shadow-black/50"
              />
            ) : (
              <div className="flex aspect-[2/3] w-full items-center justify-center rounded-2xl border border-sky-400/40 bg-black/40 text-6xl font-black text-sky-300">
                {movie.title.slice(0, 1)}
              </div>
            )}


          <div className="flex flex-col justify-center gap-6 p-6 sm:p-8">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-sky-300">
                Movie Details
              </p>

              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                {movie.title}
              </h1>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-sky-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  {movie.mpaaRating ?? "Unrated"}
                </span>

                <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300">
                  {movie.runtimeMinutes
                    ? `${movie.runtimeMinutes} min`
                    : "Runtime TBD"}
                </span>
              </div>

              {genres.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">Genres TBD</p>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white">Synopsis</h2>

              <p className="max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
                {movie.description ?? "Description coming soon."}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-300">
                Cast
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {movie.castList ?? "Cast coming soon."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-400">
            Watch Preview
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-white">
            Trailer
          </h2>
        </div>

        {movie.trailerUrl ? (
          <iframe
            src={movie.trailerUrl}
            title={`${movie.title} trailer`}
            className="aspect-video w-full rounded-3xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/30"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-950 p-8 text-sm text-zinc-400">
            No trailer available.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-400">
            Choose a Time
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-white">
            Showtimes
          </h2>
        </div>

        {movie.showtimes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-950 p-8 text-sm text-zinc-400">
            No showtimes have been added yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {movie.showtimes.map((showtime) => (
              <Link
                key={showtime.showtimeId}
                href={`/booking/${showtime.showtimeId}`}
                className="group rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm transition hover:-translate-y-1 hover:border-sky-500 hover:shadow-xl hover:shadow-sky-950/30"
              >
                <p className="text-lg font-bold text-white">
                  {formatDateTime(showtime.startTime)}
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  {showtime.roomName}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
                    {showtime.formatType ?? "Standard"}
                  </span>

                  <span className="text-sm font-semibold text-sky-400 group-hover:text-sky-300">
                    Book Seats →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  </main>
);
}